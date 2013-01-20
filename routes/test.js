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
				console.log('Game not found');
				//TODO: Create new game here							
				return;
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
					console.log('Game not found');
					return;
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