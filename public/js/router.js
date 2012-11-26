define('Router', [
	'jquery',
	'underscore',
	'backbone',
	'HeaderView',
	'HomeView',
	'GameView',
	'GameModel'
], function($, _, Backbone, HeaderView, HomeView, GameView, GameModel){
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
			var that = this;

			if(!this.currentGame){
				this.currentGame = new GameModel({code: code});
				//query the game from database
				this.currentGame.fetch({
					success : function(model, res){
						console.log('Success');
						that._game();
					},
					error : function(model, res){
						console.log('Error');
					}
				});
			}else{
				this._game();
			}

			
		},
		_game : function(){
			//no need to sync
			if(!this.gameView){
				this.gameView = new GameView();
			}

			this.elms['page-content'].html(this.gameView.render().el);	

		}
	});

	return Router;
});