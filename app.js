var express = require('express');
var mongoose = require('mongoose');
var ortcNodeclient = require('ibtrealtimesjnode').IbtRealTimeSJNode;
var Chess = require('./chess/chess');

var app = express();

var db = mongoose.connect(process.env.MONGO_URI);
var Schema = mongoose.Schema;


//=========================
// Setup Express
//========================= 
app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
});

//=========================
// Setup Schemas
//=========================
var GameSchema = new Schema({
	code : String,
	alive : Boolean,
	king : {
		name : String,
		passkey : String,
		playerCode : String,
		authId : String
	},
	peasants : [{
		name : String,
		playerCode : String,
		alive : Boolean
	}],
	board : Array,
	turn : String	
});

mongoose.model('Game', GameSchema);
var Game = mongoose.model('Game');

//=========================
// ORTC Client
//=========================


var ortcClient = new ortcNodeclient();

var ortcSubscriber = function(code){
	console.log('Subscribing to: ' + 'peasant_chess_server_'+code);
	ortcClient.subscribe('peasant_chess_server_'+code, true, 
		function(ortc, channel, message){
			console.log('Recieved Message: ');
			var msgObj = JSON.parse(message);
			handleORTCMessage(code, msgObj);
		});
}

var ortcPublisher = function(code, message){
	var browserChannel = 'peasant_chess_browser_'+code;
	ortcClient.send(browserChannel, JSON.stringify(message));
}

ortcClient.setClusterUrl('http://ortc-developers.realtime.co/server/2.1/');

ortcClient.onConnected = function(ortc){
	console.log("ORTC Connected...");
	//Connected
	/** GET ALL EXISTING GAMES AND RESUBSCRIBE TO ALL OF THEM **/
	Game.find({alive:true}, function(err, games){
		if(err){
			console.log('Unable to create subscribers for games');
		}

		for(var i in games){
			var game = games[i];
				ortcSubscriber(game.code);	
		}
	});	
}

Game.find({alive:true}, function(err, games){
		if(err){
			console.log('Unable to create subscribers for games');
		}

		var channels = {};
		for(var i in games){
			var game = games[i];
				console.log('Subscribing... ' + game.code);
				channels['peasant_chess_server_'+game.code] = 'r';
				channels['peasant_chess_browser_'+game.code] = 'w';
		}

		// Post permissions
		ortcClient.saveAuthentication('http://ortc-developers.realtime.co/server/2.1', true, 
			'peasantchessauth', 0, 
			process.env.ORTC_APP_KEY, 1400, 
			process.env.ORTC_PRIVATE_KEY, channels, function (error, success) {
		    if (error) {
		        console.log('Error saving authentication: ' + error);
		    } else if (success) {
		        console.log('Successfully authenticated');
		        ortcClient.connect(process.env.ORTC_APP_KEY, 'peasantchessauth');
		    } else {
		        console.log('Not authenticated');
		    }
		});
});	






//=========================
// RESTful Resources
//=========================
app.post('/api/v1/game', function(req, res){
	var name = req.body.kingName;
	var password = req.body.kingPass;

	if(name == ''){
		name = 'King de Fault IV';
	}

	if(password == ''){
		password = 'hijackthis';
	}

	var king = {
		name : name,
		passkey : password,
		authId : generateAuthKey(),
		playerCode : generateAuthKey()
	};

	var board = createNewBoard();

	Game.count({alive:true}, function(err, count){
		if(err){
			console.log('Error occured');
			console.dir(err);
			return;
		}

		if(count <= 4){
			var game = new Game();
			game.code = generateGameCode();
			game.king = king;
			game.alive = true;
			game.board = board;
			game.turn = 'W';
			var https = require('https');
			
			game.save(function(err, savedGame){
				if(err){
					console.log('Error saving new game');			
					return;
				}

				/*CREATE A NEW CHANNEL*/
				ortcSubscriber(savedGame.code);

				return res.send({
					code : savedGame.code,
					king : {
						name : savedGame.king.name,
						authId : savedGame.king.authId
					},
					turn : 'W',
					board : savedGame.board,
					player : {
						name : savedGame.king.name,
						authId : savedGame.king.authId,
						playerCode : savedGame.king.playerCode
					},
					alive : true
				});
			});	
		}else{
			console.log('Game is full:' + count);
			return res.send({
				error : {
					msg : 'All game slots are full',
					code : 2
				}
			});
		}
		
	});
	
});

app.get('/api/v1/game/random', function(req, res, next){
	var playerName = req.params.peasantName;
	console.log(req.params);
	if(playerName == null || playerName.length <= 0){
		playerName = 'Peasant Poor';
	}

	Game.count({}, function(err, count){
		if(err){
			console.log('Error count query');
			return;
		}
		var random = Math.max(0, Math.round(Math.random() * count - 1));
		console.log('Getting result: ' + random);
		Game.find().limit(1).skip(random).exec(function(err, game){

			if(err){
				console.log('Error looking for random game');
				console.dir(err);
				return;
			}

			var game = game[0];
			console.dir(game);
			var peasantSize = game.peasants.length + 1;
			peasant = {
				name : playerName,
				playerCode : generateAuthKey(),
				alive : true
			};
			game.peasants.push(peasant);
			game.markModified('peasants');
			game.save();

			return res.send({
				code : game.code,
				king : {
					name : game.king.name
				},
				peasants : game.peasants,
				board : game.board,
				turn : game.turn,
				player : peasant,
				alive : game.alive
			}); 
		});
	});
});

app.get('/api/v1/game/:code', function(req, res, next){
	var authId;

	if(req.query.authId){
		authId = req.query.authId;
		console.log('AuthId is present');
		console.log(authId);
	}


	Game.findOne({ code: req.params.code}, function(err, game){
		if(err){
			console.log('Error loading: ' + req.params.code);
			return;			
		}

		if(!game){
			console.log('Cannot find game :' + req.params.code);
			return res.send({
				error : {
					msg : 'Cannot find game : ' + req.params.code,
					code : 1
				}
			});
		}

		var king,
			peasant,
			player;

		if(game.king.authId == authId){
			//correct auth, reply with a king object
			king = {
				name : game.king.name,
				authId : game.king.authId,
				playerCode : game.king.playerCode
			};

			player = king;
		}else{
			//invalid, create a random name
			var peasantSize = game.peasants.length + 1;
			peasant = {
				name : 'Random P ' + peasantSize,
				alive : true,
				playerCode : generateAuthKey()
			};

			player = peasant;

			game.peasants.push(peasant);
			game.markModified('peasants');
			game.save();
		}

		
		return res.send({
			code : game.code,
			king : {
				name : game.king.name
			},
			board : game.board,
			turn : game.turn,
			peasants : game.peasants,
			player : player,
			alive : game.alive
		});
	});
});

//======================================
// GAME UTILS (PUT THIS IN ANOTHER FILE)
//======================================
var handleORTCMessage = function(code, message){
	console.log('Message From: ' + code + '>> ' + message.type);
	console.log(message);
	var type = message.type;
	switch(type){
		case 'connect' :
			var player = message.data.player;
			console.log('Player ' + player.name + ' connected to ' + code);
			ortcPublisher(code, message);
			break;
		case 'chat' :
			var player = message.data.player;
			console.log(player.name + ':' + message.chat);
			ortcPublisher(code, message); 
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
							if(color == 'W'){
								game.turn = 'B';
							}else{
								game.turn = 'W';
							}
							board[from.row][from.col] = '0';
							board[to.row][to.col] = color+''+piece;
							game.board = board;
							game.markModified('board');
							game.save();
							message.data.turn = game.turn;

							ortcPublisher(code, message);
						}
					}	
				}
				
			});
			
			break;
	}
	
}



var generateAuthKey = function(){
	var result = '';
	var chars = '01234567890abcdefghijklmnopqrstwxyz';
	for(var i = 16; i > 0; --i){
		result += chars[Math.round(Math.random() * (chars.length - 1))];
	}
	return result;
}

var generateGameCode = function(){
	var result = '';
	var chars = '01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	for(var i = 6; i > 0; --i){
		result += chars[Math.round(Math.random() * (chars.length - 1))];
	}
	return result;	
}

var createNewBoard = function(){
	var board;
	board = [
		['0', 'BN', 'BN', '0', 'BK', '0', 'BN', '0'],
		['0', '0', '0', '0', 'BP', '0', '0', '0'],
		['0', '0', '0', '0', '0', '0', '0', '0'],
		['0', '0', '0', '0', '0', '0', '0', '0'],
		['0', '0', '0', '0', '0', '0', '0', '0'],
		['0', '0', '0', '0', '0', '0', '0', '0'],
		['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
		['0', '0', '0', '0', 'WK', '0', '0', '0']
	];
	return board;
}



app.listen(process.env.PORT || 3000, function(){
	console.log('Started app...');
});