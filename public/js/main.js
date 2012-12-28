requirejs.config({
	baseURL : './js',
	shim : {
		'underscore' : {
			exports : '_'
		},
		'backbone' : {
			deps : ['underscore', 'jquery'],
			exports : 'Backbone'
		},
		'cookie' : {
			deps : ['jquery']
		},
		'timeago' : {
			deps : ['jquery']
		},
		'GameView' : {
			deps : ['xrtml', 'timeago']
		},
		'PlayChess' : {
			deps : ['easel', 'preload', 'Tilemap']
		}
	},
	paths : {
		'jquery' : 'lib/jquery-1.8.2',
		'cookie' : 'lib/jquery.cookie',
		'easel' : 'lib/easeljs-0.5.0.min',
		'preload' : 'lib/preloadjs-0.2.0.min',
		'timeago' : 'lib/jquery.timeago',
		'xrtml' : 'lib/xrtml-custom-3.0-min',
		'sound' : 'lib/soundjs-0.3.0.min',
		'backbone' : 'lib/backbone',
		'underscore' : 'lib/underscore',
		'text' : 'lib/text',
		'App' : 'app',
		'Router' : 'router',
		'Tilemap' : 'utils/tilemap',
		'PlayChess' : 'chess/playchess',
		'ChessPiece' : 'chess/chesspiece',
		'MovesLayer' : 'chess/moveslayer', 
		'PieceManager' : 'chess/piecemanager',
		'HeaderView' : 'views/header',
		'HomeView' : 'views/home',
		'ErrorView' : 'views/error',
		'GameView' : 'views/game',
		'GameModel' : 'models/game'
	}
});

require(['App'], function(App){
	App.initialize();
});