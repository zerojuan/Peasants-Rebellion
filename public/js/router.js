define('Router', [
	'jquery',
	'cookie',
	'underscore',
	'backbone',
	'HeaderView',
	'HomeView',
	'ErrorView',
	'GameView',
	'GameModel'
], function($, Cookie2, _, Backbone, HeaderView, HomeView, ErrorView, GameView, GameModel){
	var Router;

	Router = Backbone.Router.extend({
		routes : {
			'' : 'home',
			'home' : 'home',
			'g/:id' : 'game'
		},
		initialize : function(){
			this.headerView = new HeaderView();

			this.currentGame = null;

			this.elms = {
		        'header' : $('.header'),
		        'page-content' : $('.page-content')
		    };

		    this.elms['header'].hide().html(this.headerView.render().el).fadeIn('slow');
		},
		home : function(){
			var that = this;
				
			if(!this.homeView){
		    	this.homeView = new HomeView();
		    }

		    this.homeView.model.on('king-start-success', function(code){
		    	console.log('Starting as king...');
		    	var king  = this.get('king');
		    	$.cookie(code+'.auth_king', king.authId);
		    	console.log('COOKIE: ' + $.cookie(code+'.auth_king'));
		    	delete that.homeView;
		    	that.currentGame = this;
		    	that.navigate('#/g/'+this.get('code'), {trigger : true});
		    });

		    this.homeView.model.on('peasant-start-success', function(code){
		    	console.log('Starting as peasant...');
		    	delete that.homeView;
		    	that.currentGame = this;
		    	that.navigate('#/g/'+this.get('code'), {trigger : true});
		    });

		    this.elms['page-content'].html(this.homeView.render().el);
		},
		game : function(code){
			var that = this,
				authId;
			console.log('Code: ' + code);
			if(!$.cookie(code + '.auth_king')){
				if(this.currentGame){
					var king = this.currentGame.get('king');
					console.log('Setting Cookie: ' + king.authId);
					$.cookie(code + '.auth_king', king.authId);	
				}
				console.log('Cookie Doesnt Exist');
			}else{
				authId = $.cookie(code+'.auth_king');
				console.log('Loading cookie: ' + $.cookie(code+'.auth_king'));
			}

			if(!this.currentGame){
				console.log('Current Game not found, loading...');
				this.currentGame = new GameModel({code: code, authId: authId});
				//query the game from database
				this.currentGame.fetch({
					data : {
						authId : authId
					},
					success : function(model, res){
						if(res.error){
							that._errorPage(res.error);
						}else{
							that._game();	
						}
					},
					error : function(model, res){
						console.log('Error');
					}
				});
			}else{
				console.log('Current game exists...  ');
				this._game();
			}	
		},
		_errorPage : function(error){
			var errorView = new ErrorView();
			console.log('Error View: ');
			console.dir(error);
			this.elms['page-content'].html(errorView.render(error).el);
		},
		_game : function(){
			//no need to sync
			if(!this.gameView){
				this.gameView = new GameView(this.currentGame);
			}

			console.log(this.currentGame.get('board'));

			this.elms['page-content'].html(this.gameView.render().el);	

		}
	});

	return Router;
});