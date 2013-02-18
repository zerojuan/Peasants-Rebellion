var Game = require('../models/game');

exports.reset = function(req, res){
	console.log('Resetting test databases');		
		Game.findOne({ code: 'CHKMTE'}, function(err, game){
			if(err){
				console.log('Error finding CheckMate Test Game');
				console.log(err);
				return;
			}

			if(!game){
				console.log('Game not found.. creating game.');
				//TODO: Create new game here							
				game = new Game();
				game.code = 'CHKMTE';
				var king = {
					name : "King Checque",
					title : "Tester of Checkmates",
					passkey : 'hijackthis',
					authId : game.generateAuthKey(),
					playerCode : game.generateAuthKey()
				};
				game.king = king;							
			}

			//Black checkmate in 2 moves
			var chkMateBoard = [
				['0', '0', 'BK', '0', '0', '0', '0', '0'],
				['0', '0', '0', '0', '0', 'WP', '0', '0'],
				['0', 'WP', 'WP', '0', '0', '0', '0', '0'],
				['0', '0', '0', '0', '0', '0', '0', '0'],
				['0', '0', 'WK', '0', '0', '0', '0', '0'],
				['0', '0', '0', '0', '0', '0', '0', '0'],
				['0', '0', '0', '0', '0', '0', '0', '0'],
				['0', '0', '0', '0', '0', '0', '0', '0']
			];

			game.board = chkMateBoard;
			game.turn = 'B';
			game.alive = true;
			game.king.passkey = 'hijackthis';
			game.peasants = [];
			game.moves = [];
			game.save();
			Game.findOne({code : 'STLMTE'}, function(err,game){
				if(err){
					console.log('Error finding Stalemate Test Game');
					console.log(err);
					return;
				}

				if(!game){
					console.log('Game not found.. creating game.');
					game = new Game();
					game.code = 'STLMTE';
					var king = {
						name : "King Stale",
						title : "Tester of Stalemates",
						passkey : 'hijackthis',
						authId : game.generateAuthKey(),
						playerCode : game.generateAuthKey()
					};
					game.king = king;					
				}
				var staleMateBoard = [
					['0', 'BK', '0', '0', '0', '0', '0', '0'],
					['WP', '0', '0', '0', '0', '0', '0', '0'],
					['WQ', 'WP', 'WP', '0', '0', '0', '0', '0'],
					['0', '0', '0', '0', '0', '0', '0', '0'],
					['0', '0', 'WK', '0', '0', '0', '0', '0'],
					['0', '0', '0', '0', '0', '0', '0', '0'],
					['0', '0', '0', '0', '0', '0', '0', '0'],
					['0', '0', '0', '0', '0', '0', '0', '0']
				];
				game.board = staleMateBoard;
				game.turn = 'B';
				game.alive = true;
				game.king.passkey = 'hijackthis';
				game.peasants = [];
				game.moves = [];
				game.save();
				console.log('Done!');
				res.send('Test setup done.');	
			});			
		});
}