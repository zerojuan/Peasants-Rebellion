var express = require('express');
var mongoose = require('mongoose');
var less = require('less-middleware');
var ChessRTC = require('./realtime/chessRTC');
var Chess = require('./chess/chess');
var ChatCommands = require('./chess/chatcommands');

var miscData = require('./models/miscData.json');


var app = express();

var db = mongoose.connect(process.env.MONGO_URI);


//=========================
// Setup Express
//========================= 
app.configure(function(){
	app.use(less({ src: __dirname + '/public' }));
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
	app.use(function(err, req, res, next){
		console.error(err.stack);
		res.send(500, 'Something broke!');
	});
});

//=========================
// Setup Schemas
//=========================
var Game = require('./models/game');

//=========================
// ORTC Client
//=========================
var chessRTC = new ChessRTC('http://ortc-developers.realtime.co/server/2.1/');

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
		chessRTC.ortcClient.saveAuthentication('http://ortc-developers.realtime.co/server/2.1', true, 
			'peasantchessauth', 0, 
			process.env.ORTC_APP_KEY, 1400, 
			process.env.ORTC_PRIVATE_KEY, channels, function (error, success) {
		    if (error) {
		        console.log('Error saving authentication: ' + error);
		    } else if (success) {
		        console.log('Successfully authenticated');
		        chessRTC.ortcClient.connect(process.env.ORTC_APP_KEY, 'peasantchessauth');
		    } else {
		        console.log('Not authenticated');
		    }
		});
});	


//=========================
// Routes for easy testing
//=========================

var test = require("./routes/test");
app.configure('development', function(){
	console.log('Development mode: Test routes are open');
	app.get('/testreset', test.reset);
});


//=========================
// RESTful Resources
//=========================


var gameRoutes = require("./routes/game");
app.post('/api/v1/game', function(req, res){
	var name = req.body.kingName;
	var password = req.body.kingPass;
	

	if(password == ''){
		password = 'usurpthis';
	}

	Game.count({alive:true}, function(err, count){
		if(err){
			console.log('Error occured');
			console.dir(err);
			return;
		}

		var game = new Game();

		if(name == ''){						
			name = game.getRandomKingName();
		}
		
		var king = {
			name : name,
			title : game.getRandomKingTitle(),
			passkey : password,
			authId : game.generateAuthKey(),
			playerCode : game.generateAuthKey()
		};
		var board = game.createNewBoard();

		game.code = game.generateGameCode();
		game.king = king;
		game.alive = true;
		game.board = board;
		game.moves = [];
		game.turn = 'W';
		var https = require('https');
		
		game.save(function(err, savedGame){
			if(err){
				console.log('Error saving new game');			
				return;
			}

			/*CREATE A NEW CHANNEL*/
			chessRTC.ortcSubscriber(savedGame.code);

			return res.send({
				code : savedGame.code,
				king : {
					name : game.shortenName(savedGame.king.name),
					title : savedGame.king.title,
					authId : savedGame.king.authId
				},
				turn : 'W',
				board : savedGame.board,
				player : {
					name : game.shortenName(savedGame.king.name),
					authId : savedGame.king.authId,
					playerCode : savedGame.king.playerCode
				},
				alive : true
			});
		});			
	});
	
});


app.get('/api/v1/game/random', gameRoutes.randomGame);

app.get('/api/v1/game/:code', gameRoutes.getByCode);



app.listen(process.env.PORT || 3000, function(){
	console.log('Started app...');
});