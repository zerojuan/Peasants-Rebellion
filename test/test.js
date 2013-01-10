var assert = require('assert');
var chess = require('../chess/chess');

suite('Chess Mechanics: ', function(){
	setup(function(){

	});
	
	test('en passant', function(){
		var board = [
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', 'BP', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', 'WP', 'BP', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['WP', 'WP', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
		];
		var double_jump = {
			col : 2,
			row : 4 
		};
		//TODO, test for enpassant
	});

	test('pawn transform', function(){
		var board = [
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
		];
		//TODO: passing moves should transform to queen

	});

	test('open check', function(){
		var board = [
			['0', 'BK', '0', '0', '0', '0', '0', '0'],
			['0', '0', 'BP', '0', '0', '0', '0', '0'],
			['0', '0', '0', 'WB', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0']
		];

		assert.ok(!chess.isValidMove(board, 'P', {
			row : 1,
			col : 2
		},{
			row : 2,
			col : 2
		}, 'B'), 'Black Pawn open check');	

		board = [
			['0', 'BK', '0', 'BR', '0', '0', '0', '0'],
			['0', 'BR', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', 'WB', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0']
		];

		assert.ok(!chess.isValidMove(board, 'R', {
			row : 1,
			col : 1
		},{
			row : 2,
			col : 1
		}, 'B'), 'Black Rook not blocking');
		assert.ok(chess.isValidMove(board, 'R', {
			row : 1,
			col : 1
		},{
			row : 1,
			col : 2
		}, 'B'), 'Black Rook blocks check');
		assert.ok(chess.isValidMove(board, 'R', {
			row : 0,
			col : 3
		},{
			row : 2,
			col : 3
		}, 'B'), 'Black Rook captures checker');	
	});

	test('check mate', function(){
		var board = [
			['BK', '0', '0', '0', '0', '0', '0', '0'],
			['BP', 'WP', 'WP', '0', '0', '0', '0', '0'],
			['WP', 'WP', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
		];

		assert.ok(chess.endGameCheck(board, 'K', {
			row : 0,
			col : 0
		},{
			row : 0,
			col : 0
		}, 'B').checkMate, 'Black King checkmate');
		board = [
			['BK', '0', '0', '0', '0', '0', '0', '0'],
			['WP', '0', 'WP', '0', '0', '0', '0', '0'],
			['WP', 'WP', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
		];

		assert.ok(chess.endGameCheck(board, 'K', {
			row : 0,
			col : 0
		},{
			row : 0,
			col : 0
		}, 'B').staleMate, 'Black King stalemate');
		
		board = [
			['0', 'WQ', '0', 'BK', '0', '0', '0', '0'],
			['0', 'WQ', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
		];
		assert.ok(chess.endGameCheck(board, 'K', {
			row : 0,
			col : 0
		},{
			row : 0,
			col : 0
		}, 'B').checkMate, 'Black King checkmate 2');		
	});

	test('valid rook', function(){
		var board = [
			['0', '0', '0', 'BK', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', 'BP', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', 'WR', '0', 'WR', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', 'WP', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
		];
		assert.ok(chess.isValidMove(board, 'R',
				{row: 4, col: 2},
				{row: 4, col: 0},
				'W'
			), 'White Rook Left');
		assert.ok(chess.isValidMove(board, 'R',
				{row: 4, col: 2},
				{row: 4, col: 3},
				'W'
			), 'White Rook Right');
		assert.ok(chess.isValidMove(board, 'R',
				{row: 4, col: 2},
				{row: 7, col: 2},
				'W'
			), 'White Rook Down');
		assert.ok(chess.isValidMove(board, 'R',
				{row: 4, col: 2},
				{row: 3, col: 2},
				'W'
			), 'White Rook Up');
		assert.ok(!chess.isValidMove(board, 'R',
				{row: 4, col: 2},
				{row: 4, col: 5},
				'W'
			), 'White Rook Blocked Right');
		assert.ok(!chess.isValidMove(board, 'R',
				{row: 4, col: 2},
				{row: 1, col: 2},
				'W'
			), 'White Rook Blocked Top');
		assert.ok(chess.isValidMove(board, 'R',
				{row: 4, col: 2},
				{row: 2, col: 2},
				'W'
			), 'White Rook Capture Top');
		assert.ok(!chess.isValidMove(board, 'R',
				{row: 4, col: 4},
				{row: 7, col: 4},
				'W'
			), 'White Rook Block Bottom');

		//TODO: Test for open checks
	});

	test('valid bishop', function(){
		var board = [
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', 'BP', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', 'WB', '0', '0', '0', '0', '0'],
			['0', '0', '0', 'WB', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', 'BP', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
		];
		assert.ok(chess.isValidMove(board, 'B',
				{row: 4, col: 3},
				{row: 5, col: 2},
				'W'
			), 'White Bishop SW');
		assert.ok(chess.isValidMove(board, 'B',
				{row: 4, col: 3},
				{row: 1, col: 6},
				'W'
			), 'White Bishop NE');
		assert.ok(chess.isValidMove(board, 'B',
				{row: 3, col: 2},
				{row: 2, col: 1},
				'W'
			), 'White Bishop NW');
		assert.ok(chess.isValidMove(board, 'B',
				{row: 4, col: 3},
				{row: 6, col: 5},
				'W'
			), 'White Bishop SE');
		assert.ok(!chess.isValidMove(board, 'B',
				{row: 4, col: 3},
				{row: 3, col: 2},
				'W'
			), 'White Bishop capture same team');
		assert.ok(!chess.isValidMove(board, 'B',
				{row: 4, col: 3},
				{row: 0, col: 7},
				'W'
			), 'White Bishop block NE');
		assert.ok(!chess.isValidMove(board, 'B',
				{row: 4, col: 3},
				{row: 2, col: 1},
				'W'
			), 'White Bishop block NW');
		assert.ok(!chess.isValidMove(board, 'B',
				{row: 3, col: 2},
				{row: 5, col: 4},
				'W'
			), 'White Bishop block SE');
		assert.ok(chess.isValidMove(board, 'B',
				{row: 4, col: 3},
				{row: 6, col: 1},
				'W'
			), 'White Bishop capture SW');
		assert.ok(chess.isValidMove(board, 'B',
				{row: 4, col: 3},
				{row: 1, col: 6},
				'W'
			), 'White Bishop capture NE');
	});

	test('valid queen', function(){
		var board = [
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', 'WP', '0', 'WP', '0', 'WP', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', 'WP', '0', 'WQ', '0', 'WP', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', 'WP', '0', 'WP', '0', 'WP', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
		];
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 5, col: 3},
				'W'
			), 'White Bishop move S');
		assert.ok(!chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 6, col: 3},
				'W'
			), 'White Bishop capture same S');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 3, col: 3},
				'W'
			), 'White Bishop move N');
		assert.ok(!chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 2, col: 3},
				'W'
			), 'White Bishop capture same N');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 4, col: 4},
				'W'
			), 'White Bishop move E');
		assert.ok(!chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 4, col: 5},
				'W'
			), 'White Bishop capture same E');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 4, col: 2},
				'W'
			), 'White Bishop move W');
		assert.ok(!chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 4, col: 1},
				'W'
			), 'White Bishop capture same W');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 3, col: 4},
				'W'
			), 'White Bishop move NE');
		assert.ok(!chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 2, col: 5},
				'W'
			), 'White Bishop capture same NE');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 3, col: 2},
				'W'
			), 'White Bishop move NW');
		assert.ok(!chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 2, col: 1},
				'W'
			), 'White Bishop capture same NW');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 5, col: 2},
				'W'
			), 'White Bishop move SW');
		assert.ok(!chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 6, col: 1},
				'W'
			), 'White Bishop capture same SW');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 5, col: 4},
				'W'
			), 'White Bishop move SE');
		assert.ok(!chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 6, col: 5},
				'W'
			), 'White Bishop capture same SE');
		board = [
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', 'BP', '0', 'BP', '0', 'BP', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', 'BP', '0', 'WQ', '0', 'BP', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', 'BP', '0', 'BP', '0', 'BP', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
		];
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 6, col: 3},
				'W'
			), 'White Bishop capture S');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 2, col: 3},
				'W'
			), 'White Bishop capture N');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 4, col: 5},
				'W'
			), 'White Bishop capture E');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 4, col: 1},
				'W'
			), 'White Bishop capture W');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 2, col: 5},
				'W'
			), 'White Bishop capture NE');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 2, col: 1},
				'W'
			), 'White Bishop capture NW');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 6, col: 1},
				'W'
			), 'White Bishop same SW');
		assert.ok(chess.isValidMove(board, 'Q',
				{row: 4, col: 3},
				{row: 6, col: 5},
				'W'
			), 'White Bishop capture SE');
	});

	test('valid king', function(){
		var board = [
			['BK', '0', '0', '0', '0', '0', '0', '0'],
			['BP', 'BP', 'WP', '0', '0', '0', '0', '0'],
			['WP', 'WP', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
		];
		assert.ok(!chess.isValidMove(board, 'K', {
			row : 0,
			col : 0
		},{
			row : 0,
			col : 1
		}, 'B'), 'Black King cannot move to controlled square');
		board = [
			['BK', '0', '0', '0', '0', '0', '0', '0'],
			['BP', 'WP', 'WP', '0', '0', '0', '0', '0'],
			['WP', 'WP', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
		];
		assert.ok(!chess.isValidMove(board, 'K', {
			row : 0,
			col : 0
		},{
			row : 1,
			col : 1
		}, 'B'), 'Black King cannot capture a protected square');
		board = [
			['0', '0', '0', '0', 'BK', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', 'WP', '0', 'BN', 'WP', '0'],
			['0', '0', 'WP', '0', 'BP', 'WP', '0', '0'],
			['0', 'WP', '0', '0', 'WP', '0', '0', '0'],
			['WP', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', 'WK', '0', '0', '0'],
		];
		assert.ok(chess.isValidMove(board, 'K', {
			row : 0,
			col : 4
		},{
			row : 1,
			col : 3
		}, 'B'), 'Black King move on top of Pawn');
	});

	test('valid pawn', function(){
		var board = [
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', 'BP', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', 'BP', '0', '0', '0', '0'],
			['0', '0', 'WP', 'WP', '0', '0', '0', '0'],
			['WP', 'WP', '0', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
		];
		assert.ok(chess.isValidMove(board, 'P', {
			row : 5,
			col : 2
		}, {
			row : 4,
			col : 3
		}, 'W'), 'White Pawn capture diagonal');
		assert.ok(!chess.isValidMove(board, 'P', {
			row : 6,
			col : 1
		}, {
			row : 5,
			col : 2
		}, 'W'), 'White Pawn capture diagonal same team');
		assert.ok(!chess.isValidMove(board, 'P', {
			row : 4,
			col : 3
		}, {
			row : 5,
			col : 4
		}, 'B'), 'Black Pawn capture diagonal empty');
		assert.ok(chess.isValidMove(board, 'P', {
			row : 4,
			col : 3
		}, {
			row : 5,
			col : 2
		}, 'B'), 'Black Pawn capture diagonal down');
		assert.ok(!chess.isValidMove(board, 'P', {
			row : 4,
			col : 3
		}, {
			row : 5,
			col : 3
		}, 'B'), 'Black Pawn cant capture 1 down');
		assert.ok(chess.isValidMove(board, 'P', {
			row : 1,
			col : 2
		}, {
			row : 2,
			col : 2
		}, 'B'), 'Black Pawn move 1 down');
		assert.ok(chess.isValidMove(board, 'P', {
			row : 1,
			col : 2
		}, {
			row : 3,
			col : 2
		}, 'B'), 'Black Pawn move 2 down');
		assert.ok(!chess.isValidMove(board, 'P', {
			row : 1,
			col : 2
		}, {
			row : 4,
			col : 2
		}, 'B'), 'Black Pawn move 3 down');
		assert.ok(!chess.isValidMove(board, 'P', {
			row : 6,
			col : 0
		}, {
			row : 3,
			col : 0
		}, 'W'), 'White Pawn jump 3 spaces');
		assert.ok(!chess.isValidMove(board, 'P', {
			row : 5,
			col : 2
		}, {
			row : 3,
			col : 2
		}, 'W'), 'White Pawn jump 2 spaces after start');
		assert.ok(chess.isValidMove(board, 'P', {
			row : 5,
			col : 2
		}, {
			row : 4,
			col : 2
		}, 'W'), 'White Pawn jump cant move 1 space');
		assert.ok(!chess.isValidMove(board, 'P', {
			row : 5,
			col : 3
		}, {
			row : 4,
			col : 3
		}, 'W'), 'White Pawn cant capture 1 space up');		
	});

	test('valid knight', function(){
		var board = [
			['BN', '0', '0', '0', '0', '0', '0', 'WN'],
			['0', '0', 'BN', '0', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['0', 'WN', '0', 'BP', '0', '0', '0', '0'],
			['0', '0', '0', 'BN', '0', '0', '0', '0'],
			['0', '0', '0', 'WN', '0', '0', '0', '0'],
			['0', '0', '0', '0', '0', '0', '0', '0'],
			['WN', '0', '0', '0', '0', '0', '0', 'WN'],
		];
		
		assert.ok(chess.isValidMove(board, 'N', {
			row : 0,
			col : 0
		}, {
			row : 2,
			col : 1
		}, 'B'), 'Black Knight corner move');	
		assert.ok(!chess.isValidMove(board, 'N', {
			row : 0,
			col : 0
		}, {
			row : 1,
			col : 2
		}, 'B'), 'Black Knight capture same color');
		assert.ok(chess.isValidMove(board, 'N', {
			row : 1,
			col : 2
		}, {
			row : 3,
			col : 1
		}, 'B'), 'Black Knight capture W');
		assert.ok(chess.isValidMove(board, 'N', {
			row : 3,
			col : 1
		}, {
			row : 1,
			col : 2
		}, 'W'), 'White Knight capture B');
		assert.ok(chess.isValidMove(board, 'N', {
			row : 7,
			col : 7
		}, {
			row : 6,
			col : 5
		}, 'W'), 'White Knight corner move');
		
	});
});