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

	test('valid king', function(){
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
			['0', 'WP', '0', 'BP', '0', '0', '0', '0'],
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