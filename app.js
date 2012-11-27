var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var app = express();


//=========================
// Load Configuration File
//=========================
var fileConfig = fs.readFileSync(__dirname + '/app_config.json'),
	databaseConfig;

try{
	databaseConfig = JSON.parse(fileConfig);
	console.log('Loaded config: ');
	console.log(databaseConfig);
}catch(err){
	console.log('Error parsing config file');
}

var db = mongoose.connect(databaseConfig.database.uri);
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
	king : {
		name : String,
		passkey : String,
		authId : String
	},
	peasants : [{
		name : String,
		alive : Boolean
	}],
	board : Array,
	turn : String	
});

mongoose.model('Game', GameSchema);
var Game = mongoose.model('Game');

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
		authId : generateAuthKey()
	};

	var board = createNewBoard();

	var game = new Game();
	game.code = generateGameCode();
	game.king = king;
	game.board = board;
	game.turn = 'W';

	game.save(function(err, savedGame){
		if(err){
			console.log('Error saving new game');			
			return;
		}

		return res.send({
			code : savedGame.code,
			king : {
				name : savedGame.king.name,
				authId : savedGame.king.authId
			},
			turn : 'W',
			board : savedGame.board
		});
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
				player : peasant
			}); 
		});
	});
});

app.get('/api/v1/game/:code', function(req, res, next){
	var authId;
	if(req.params.authId){
		console.log('AuthId is present');
		authId = req.params.authId;
	}

	console.dir(req.params);

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
			peasant;
		console.dir(game);

		if(game.king.authId == authId){
			//correct auth, reply with a king object
			king = {
				name : game.king.name,
				authId : game.king.authId
			};
		}else{
			//invalid, create a random name
			var peasantSize = game.peasants.length + 1;
			peasant = {
				name : 'Random P ' + peasantSize,
				alive : true
			};

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
			player : peasant
		});
	});
});

//======================================
// GAME UTILS (PUT THIS IN ANOTHER FILE)
//======================================
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
		['0', 'N', 'N', '0', 'K', '0', 'N', '0'],
		['0', '0', '0', '0', 'P', '0', '0', '0'],
		['0', '0', '0', '0', '0', '0', '0', '0'],
		['0', '0', '0', '0', '0', '0', '0', '0'],
		['0', '0', '0', '0', '0', '0', '0', '0'],
		['0', '0', '0', '0', '0', '0', '0', '0'],
		['0', '0', '0', '0', '0', '0', '0', '0'],
		['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
		['0', '0', '0', '0', 'K', '0', '0', '0'],
	];
	return board;
}



app.listen(process.env.PORT || 3000, function(){
	console.log('Started app...');
});