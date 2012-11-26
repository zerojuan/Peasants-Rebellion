requirejs.config({
	baseURL : './js',
	shim : {
		'underscore' : {
			exports : '_'
		},
		'backbone' : {
			deps : ['underscore', 'jquery'],
			exports : 'Backbone'
		}
	},
	paths : {
		'jquery' : 'lib/jquery-1.8.2',
		'easel' : 'lib/easeljs-0.5.0.min',
		'preload' : 'lib/preloadjs-0.2.0.min',
		'sound' : 'lib/soundjs-0.3.0.min',
		'backbone' : 'lib/backbone',
		'underscore' : 'lib/underscore',
		'text' : 'lib/text',
		'App' : 'app',
		'Router' : 'router',
		'HeaderView' : 'views/header',
		'HomeView' : 'views/home',
		'GameView' : 'views/game',
		'GameModel' : 'models/game'
	}
});

require(['App'], function(App){
	App.initialize();
});