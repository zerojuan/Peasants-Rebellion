var Game = require('../models/game');

exports.randomGame = function(req, res, next){
	var playerName = req.params.peasantName;
	console.log(req.params);	

	Game.count({alive:true}, function(err, count){
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
			var name = "";
			console.dir(game);
			if(playerName == null || playerName.length <= 0){												
				name = game.getRandomPeasantName();
			}else{
				name = playerName;
			}			

			for(i in game.peasants){
				if(game.peasants[i].name == name){
					name += " " + game.romanize(game.peasants.length);
				}
			}
			peasant = {
				name : game.shortenName(name),
				title : game.getRandomPeasantTitle(),
				alive : true,
				playerCode : game.generateAuthKey()
			};
			game.peasants.push(peasant);
			game.markModified('peasants');
			game.save();

			return res.send({
				code : game.code,
				king : {
					name : game.king.name,
					title : game.king.title,
					alive : game.king.alive,
					playerCode : game.king.playerCode
				},
				peasants : game.peasants,
				board : game.board,
				turn : game.turn,
				player : peasant,
				alive : game.alive
			}); 
		});
	});
};

exports.getByCode = function(req, res, next){
	var authId;

	if(req.query.authId){
		authId = req.query.authId;
		console.log('AuthId is present');
		console.log(authId);
	}


	Game.findOne({ code: req.params.code}, function(err, game){
		if(err){
			console.log('Error loading: ' + req.params.code);
			return res.send({
				error : {
					msg : 'Unable to connect to database ',
					code : 1
				}
			});
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
			console.log('Correct King Found!');
			//correct auth, reply with a king object
			king = {
				name : game.shortenName(game.king.name),
				title : game.king.title,
				authId : game.king.authId,
				playerCode : game.king.playerCode
			};

			player = king;
		}else{
			console.log('False King Found! ' + game.king.authId);
			//invalid, create a random name								
			var name = game.getRandomPeasantName();
			for(i in game.peasants){
				if(game.peasants[i].name == name){
					name += " " + game.romanize(game.peasants.length);
				}
			}
			peasant = {
				name : game.shortenName(name),
				title : game.getRandomPeasantTitle(),
				alive : true,
				playerCode : game.generateAuthKey()
			};

			if(!game.alive){
				peasant.name = 'A Historian';
				peasant.title = 'Lover of History';
			}

			player = peasant;

			game.peasants.push(peasant);
			game.markModified('peasants');
			game.save();
		}

		
		return res.send({
			code : game.code,
			king : {
				name : game.king.name,
				title : game.king.title,
				alive : game.king.alive,
				playerCode : game.king.playerCode
			},
			board : game.board,
			turn : game.turn,
			peasants : game.peasants,
			player : player,
			alive : game.alive,
			winner : game.winner,
			moves : game.moves			
		});
	});
};