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
					console.log('ONClient Connect Message: ' + message);
					console.log('Channel: ' + channel);
				});
			that.ortcClient.subscribe('ortcClientDisconnected', true,
				function(ortc, channel, message){
					console.log('Disconnected: ' + message);
					console.log('Channel: ' + channel);
				});
		});	
	}
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
	handleORTCMessage : function(code, message){
		var that = this;
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
						this.ortcPublisher(code, message);
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
				var player = message.data.player;
				console.log(player.name + ' touched ' 
					+ message.data.piece + ' at ' 
					+ message.data.from.row + ', ' + message.data.from.col);
				var parsedPlayer = {
					name : player.name
				};
				message.data.player = parsedPlayer;
				this.ortcPublisher(code, message);
				break;
			case 'move' :
				var piece = message.data.piece;
				var from = message.data.from;
				var to = message.data.to;
				var color = message.data.color;
				//query database
				Game.findOne({ code: code}, function(err, game){
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
								//update game state
								//check if move is a promotion
								if(piece == 'P'){
									//promote to queen
									if(color == 'W' && to.row == 0){
										piece = 'Q';				
										message.data.type = 'promote';					
									}else if(color == 'B' && to.row == 7){									
										piece = 'Q';
										message.data.type = 'promote';
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
									message.data.type = 'checkmate';
									game.alive = false;
									game.winner = color;
								}else if(endGameCheck.staleMate){
									message.data.type = 'stalemate';
									game.alive = false;
									game.winner = 'D';
								}
								message.data.time = Date.now();
								game.moves.push(message.data);
								game.board = board;
								game.markModified('board');
								game.save();
								message.data.turn = game.turn;

								that.ortcPublisher(code, message);
							}
						}	
					}
					
				});				
				break;
		}		
	}
}

module.exports = ChessRTC;


