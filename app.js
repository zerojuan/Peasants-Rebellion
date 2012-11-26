var express = require('express');
var fs = require('fs');
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


//=========================
// Setup Express
//========================= 
app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
});


//=========================
// RESTful Resources
//=========================
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