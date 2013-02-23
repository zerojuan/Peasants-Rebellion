var ortcNodeclient = require('ibtrealtimesjnode').IbtRealTimeSJNode;
var Chess = require('../chess/chess');
var Game = require('../models/game');
var ChatCommands = require('../chess/chatcommands');

var ChessRTC = function(clusterURL){
	var that = this;
	this.ortcClient = new ortcNodeclient();
	this.ortcClient.setClusterUrl(clusterURL);
	this.ortcClient.onConnected = function(ortc){
		console.log("ORTC Connected...");
		//Connected
		/** GET ALL EXISTING GAMES AND RESUBSCRIBE TO ALL OF THEM **/
		Game.find({alive:true}, function(err, games){
			if(err){
				console.log('Unable to create subscribers for games');
			}

			for(var i in games){
				var game = games[i];
					that.ortcSubscriber(game.code);	
			}
			that.ortcClient.subscribe('ortcClientConnected', true, 
				function(ortc, channel, message){					
					console.log('Channel: ' + channel);
					console.log('Connected: ' + message);
					var messageObj = JSON.parse(message);
					try{
						var connectionObj = JSON.parse(messageObj.cm);	
					}catch(exception){
						console.log('Error Occured: ', exception);
						return;
					}			
					
					console.log(connectionObj);
					//Add the player back to the list
					Game.findOne({code : connectionObj.code}, function(err, game){
						if(err){
							console.log('Error looking up game ' + connectionObj.code);
							console.log(err);
							return;
						}

						if(game){
							console.log('Game found, peasant count: ' + game.peasants.length);
							if(game.king.playerCode == connectionObj.player.playerCode){
								console.log("King Has Connected!");
								game.king.alive = true;
								connectionObj.player.alive = true;
							}else{
								for(var i in game.peasants){
									if(game.peasants[i].playerCode == connectionObj.player.playerCode){
										//player is already signed in before, don't add
										connectionObj.type = 'connection';
										var message = {};
										message.type = 'connection';
										message.data = connectionObj;
										that.ortcPublisher(connectionObj.code, message);
										return;
									}
								}	
							}
							if(game.king.playerCode != connectionObj.player.playerCode){
								game.peasants.push(connectionObj.player);
							}
							
							game.save(function(){
								console.log('Peasant count after connecting: ' + game.peasants.length);
							});
							connectionObj.type = 'connection';
							var message = {};
							message.type = 'connection';
							message.data = connectionObj;
							that.ortcPublisher(connectionObj.code, message);
						}
					});			
				});
			that.ortcClient.subscribe('ortcClientDisconnected', true,
				function(ortc, channel, message){
					console.log('Channel: ' + channel);
					console.log('Disconnected: ' + message);
					var messageObj = JSON.parse(message);			
					var disconnectionObj = JSON.parse(messageObj.cm);
					try{
						var connectionObj = JSON.parse(messageObj.cm);	
					}catch(exception){
						console.log('Error Occured: ', exception);
						return;
					}	
					console.log(disconnectionObj);

					//Check database on which game this came from
					Game.findOne({ code: disconnectionObj.code}, function(err, game){
						if(err){
							console.log('Error looking up game ' + disconnectionObj.code);
							console.log(err);
							return;
						}

						if(game){
							console.log('Game found, peasant count: ' + game.peasants.length);
							if(game.king.playerCode == disconnectionObj.player.playerCode){
								game.king.alive = false;
								disconnectionObj.player.passkey = game.obscurePasskey(game.king.passkey);
							}else{
								for(var i in game.peasants){
									if(game.peasants[i].playerCode == disconnectionObj.player.playerCode){
										game.peasants.remove(game.peasants[i]);
									}
								}	
							}
							
							game.save(function(){
								console.log('Peasant count after disconnect: ' + game.peasants.length);
							});							
							disconnectionObj.type = 'disconnection';
							var message = {};
							message.type = 'disconnection';
							message.data = disconnectionObj;
							that.ortcPublisher(disconnectionObj.code, message);
						}else{
							console.log('Game ' + disconnectionObj.code + " does not exist.");
							return null;
						}
					});
					
				});
		});		
	}
	this.ortcClient.onException = function (ortc, exception) {
		console.log('Exception occured:', exception);
	};
}

ChessRTC.prototype = {
	ortcSubscriber : function(code){
		var that = this;
		console.log('Subscribing to: ' + 'peasant_chess_server_'+code);
		this.ortcClient.subscribe('peasant_chess_server_'+code, true, 
			function(ortc, channel, message){
				console.log('Recieved Message: ');
				var msgObj = JSON.parse(message);
				that.handleORTCMessage(code, msgObj);
			});
	},
	ortcPublisher : function(code, message){		
		var browserChannel = 'peasant_chess_browser_'+code;
		this.ortcClient.send(browserChannel, JSON.stringify(message));
	},
	handleORTCMessage : function(code, xRTMLMessage){
		var that = this;
		console.log(xRTMLMessage);
		message = xRTMLMessage.xrtml.d;
		console.log('Message From: ' + code + '>> ' + message.type);
		console.log(message);
		var type = message.type;
		switch(type){
			case 'connect' :
				var player = message.data.player;
				console.log('Player ' + player.name + ' connected to ' + code);
				this.ortcPublisher(code, message);
				break;
			case 'chat' :
				var player = message.data.player;
				var playerColor = 'W';
					if(player.authId) playerColor = 'B';
				console.log(player.name + ':' + message.data.message);
				var command = ChatCommands.parseChatMessage(message.data.message);
				if(command && command.command == 'usurp'){
					console.log('Usurpation attempt!');
					Game.findOne({ code: code}, function(err, game){
						if(err){
							console.log('Error finding game: ' + err.message);
						}
						if(!game){
							console.log('Cannot find game');
							return;
						}
						var result = ChatCommands.doUsurp(game, player, command.passcode, command.newPasscode);
						message.type = 'usurp';
						if(result){			

							message.data = {
								player : {
									playerCode : player.playerCode,
									title : player.title,
									name : player.name,
									authId : game.king.authId
								},
								success : true
							};
							game.save();
							console.log('Success! All hail the new King ' + player.name );						
						}else{
							
							message.data = {
								player : {								
									name : player.name,								
									color : playerColor
								},
								success : false
							};
							console.log('Failed! ' + player.name);
						}
						that.ortcPublisher(code, message);
					});
				}else{
					var parsedPlayer = {
						name : message.data.player.name,
						color : playerColor
					};
					message.data.player = parsedPlayer;
					this.ortcPublisher(code, message); 	
				}
				
				break;
			case 'touch' :
				var player = message.data;
				console.log(player.name + ' touched ' 
					+ player.piece + ' at ' 
					+ player.from.row + ', ' + player.from.col);
				var parsedPlayer = {
					name : player.name
				};
				this.ortcPublisher(code, message);
				break;
			case 'move' :
				var piece = message.data.piece;
				var from = message.data.from;
				var to = message.data.to;
				var color = message.data.color;

				/**SETUP CLOSURE SO WE CAN SEND THE RIGHT MESSAGE**/
				var publishMessage = function(message){
					console.log('Enclosing '+ message.data.name+'\'s move');
					return function(customData){
						message.data.type = customData.type;
						message.data.time = customData.time;
						message.data.turn = customData.turn;
						console.log('Publishing '+ message.data.name+'\'s move');
						that.ortcPublisher(code, message);	
					};
				};
				var msgPublisher = publishMessage(message);


				//query database
				console.log("Processing Move...");				
				Game.findOne({ code: code}, function(err, game){
					console.log("Queried...");
					if(err){
						console.log('Error finding game: ' + err.message);
					}
					if(!game){
						console.log('Cannot find game');
						return;
					}

					//check if valid move	
					var board = game.board;
					if(color == game.turn){
						if(board[from.row][from.col] == color+''+piece){
							console.log('Correct starting piece');
							//confirm if chess piece move is correct
							if(Chess.isValidMove(board, piece, from, to, color)){
								console.log('Valid move found');
								var customData = {};
								//update game state
								//check if move is a promotion
								if(piece == 'P'){
									//promote to queen
									if(color == 'W' && to.row == 0){
										piece = 'Q';				
										customData.type = 'promote';					
									}else if(color == 'B' && to.row == 7){									
										piece = 'Q';
										customData.type = 'promote';
									}
								}							

								if(color == 'W'){
									game.turn = 'B';
								}else{
									game.turn = 'W';
								}							

								board[from.row][from.col] = '0';
								board[to.row][to.col] = color+''+piece;

								//check if move is a gameover
								var endGameCheck = Chess.endGameCheck(board, 'K', {
										row : 0,
										col : 0
									},{
										row : 0,
										col : 0
									}, game.turn);
								if(endGameCheck.checkMate){
									customData.type = 'checkmate';
									game.alive = false;
									game.winner = color;
								}else if(endGameCheck.staleMate){
									customData.type = 'stalemate';
									game.alive = false;
									game.winner = 'D';
								}
								customData.time = Date.now();
								game.moves.push(message.data);
								game.board = board;
								game.markModified('board');
								console.log("VERSION:"+ game.toJSON().__v);								
								game.save(function(err){
									if(err){
										console.log(err);
										return;
									}									
									customData.turn = game.turn;	
									console.log('PUBLISHED MESSAGE! NEW DATA HAS BEEN SAVED');
									msgPublisher(customData);
								});	
								
							}else{
								console.log('INVALID MOVE! Not gonna process this');
							}
						}else{
							console.log('INVALID MOVE! Incorrect starting piece');
						}	
					}else{
						console.log('Error Color Doesnt Match');
					}
					
				});	
				console.log("Move processor over...");			
				break;
		}		
	}
}

module.exports = ChessRTC;


