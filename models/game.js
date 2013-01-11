var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

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
		}
	}]	
});

module.exports = mongoose.model('Game', GameSchema);