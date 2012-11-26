var express = require('express');

var app = express();

app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
});

app.post('/api/v1/game', function(req, res){
	var name = req.body.kingName;
	var password = req.body.kingPass;

	console.log('Created a new game');
	return res.send({
		code : 'XXVVC',
		name : name,
		board : [0, 0, 1, 0],
		cookie_token : 101010100
	});
});

app.get('/api/v1/game/random', function(req, res){
	var playerName = req.params.peasantName;

	console.log('Loading random game');
	return res.send({
		name : playerName,
		code : 'XXVVC',
		board : [0, 0, 1, 0]
	});
});

app.get('/api/v1/game/:code', function(req, res){
	//look for the game record
		//validate cookie
			//reply as king
		//reply as peasant
});

app.listen(3000, function(){
	console.log('Started app...');
});