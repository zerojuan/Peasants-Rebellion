var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var miscData = require('./miscData.json');

var GameSchema = new Schema({
	code : String,
	alive : Boolean,
	king : {
		name : String,
		passkey : String,
		playerCode : String,
		title : String,
		authId : String
	},
	peasants : [{
		name : String,
		playerCode : String,
		title : String,
		alive : Boolean
	}],
	board : Array,
	turn : String,
	winner : String, //B, W, D,
	moves : [{
		name : String,
		color : String,
		piece : String,
		from : {
			row : Number,
			col : Number
		},
		to : {
			row : Number,
			col : Number
		},
		time : { type : Date, default: Date.now() }
	}]	
});

GameSchema.methods.generateAuthKey = function(){
	var result = '';
	var chars = '01234567890abcdefghijklmnopqrstwxyz';
	for(var i = 16; i > 0; --i){
		result += chars[Math.round(Math.random() * (chars.length - 1))];
	}
	return result;
}

GameSchema.methods.generateGameCode = function(){
	var result = '';
	var chars = '01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	for(var i = 6; i > 0; --i){
		result += chars[Math.round(Math.random() * (chars.length - 1))];
	}
	return result;	
}

GameSchema.methods.createNewBoard = function(){
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

GameSchema.methods.getRandomPeasantName = function(){
	var peasantsLength = miscData.peasants.length;
	return miscData.peasants[Math.floor((Math.random() * peasantsLength))];
}

GameSchema.methods.getRandomPeasantTitle = function(){
	var peasantTitle = Math.floor(Math.random() * miscData.peasantTitles.length);
	return miscData.peasantTitles[peasantTitle]; 
}

GameSchema.methods.getRandomKingName = function(){
	var kingsLength = miscData.kings.length;
	return miscData.kings[Math.floor((Math.random() * kingsLength))];	
}

GameSchema.methods.getRandomKingTitle = function(){
	var kingTitle = Math.floor(Math.random() * miscData.kingTitles.length);
	return miscData.kingTitles[kingTitle];
}

GameSchema.methods.getRandomUsurperTitle = function(){
	var usurperTitle = Math.floor(Math.random() * miscData.usurperTitles.length);
	return miscData.usurperTitles[usurperTitle];
}

module.exports = mongoose.model('Game', GameSchema);