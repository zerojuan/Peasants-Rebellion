var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var PUBNUB = require('pubnub');
var app = express();


//=========================
// Load Configuration File
//=========================
var fileConfig = fs.readFileSync(__dirname + '/app_config.json'),
	appConfig;

try{
	appConfig = JSON.parse(fileConfig);
	console.log('Loaded config: ');
	console.log(appConfig);
}catch(err){
	console.log('Error parsing config file');
}

var db = mongoose.connect(appConfig.database.uri);
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
// PUBNUB FUNCTIONS
//=========================

var pubnub = PUBNUB.init({
	publish_key : appConfig.pubnub.publish_key,
	subscribe_key : appConfig.pubnub.subscribe_key,
	origin : 'pubsub.pubnub.com'
});

var pubnubSubscriber = function(channel){
	/*
	pubnub.presence({
        channel:'peasant_chess_server_'+channel,
        callback:function (message) {
        	console.log('Something is up here');
        	if(message.action === "join"){
        		console.log('User (server)' + message.uuid + ' has joined'); 
        	}else if(message.action === "leave"){
        		console.log('User (server)' + message.uuid + ' has left');
        	}
        }
    });
    pubnub.presence({
        channel:'peasant_chess_browser_'+channel,
        callback:function (message) {
        	console.log('Something else is up here');
        	if(message.action === "join"){
        		console.log('User (browser)' + message.uuid + ' has joined'); 
        	}else if(message.action === "leave"){
        		console.log('User (browser)' + message.uuid + ' has left');
        	}
        }
    });*/
	pubnub.subscribe({
		channel : 'peasant_chess_server_'+channel,
		callback : function(message){
			console.log('Subscribe callback  ' +'peasant_chess_server_'+channel +":" + message);
			handlePubnubMessage(channel, message);
		}/*,
		presence : function (message) {
			console.log('PRESENCE');
        	if(message.action === "join"){
        		console.log('User (browser)' + message.uuid + ' has joined'); 
        	}else if(message.action === "leave"){
        		console.log('User (browser)' + message.uuid + ' has left');
        	}
        }*/
	});
}

var pubnubPublisher = function(channel, message){
	console.log('Publishing to ' + 'peasant_chess_browser_'+channel);
	pubnub.publish({
		channel : 'peasant_chess_browser_'+channel,
		message : message
	});
}

/** GET ALL EXISTING GAMES AND RESUBSCRIBE TO ALL OF THEM **/

Game.find({alive:true}, function(err, games){
	if(err){
		console.log('Unable to create subscribers for games');
	}

	for(var i in games){
		var game = games[i];
			console.log('Subscribing... ' + game.code);
			pubnubSubscriber(game.code);	
	}
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

			game.save(function(err, savedGame){
				if(err){
					console.log('Error saving new game');			
					return;
				}

				/*CREATE A NEW CHANNEL*/
				pubnubSubscriber(savedGame.code);

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
var handlePubnubMessage = function(code, message){
	console.log('Message From: ' + code + '>>' + message.type);
	console.log(message);
	var type = message.type;
	switch(type){
		case 'connect' :
			var player = message.player;
			console.log('Player ' + player.name + ' connected to ' + code);
			pubnubPublisher(code, message);
			break;
		case 'chat' :
			var player = message.player;
			console.log(player.name + ':' + message.chat);
			pubnubPublisher(code, message); 
			break;
		case 'move' :
			var piece = message.piece;
			var from = message.from;
			var to = message.to;
			var color = message.color;
			console.log('Move ' + color + ':' + piece + ' to ' + to.row + ', ' + to.col);
			pubnubPublisher(code, message);
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