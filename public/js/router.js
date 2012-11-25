define('Router', [
	'jquery',
	'underscore',
	'backbone',
	'HeaderView',
	'HomeView',
	'GameModel'
], function($, _, Backbone, HeaderView, HomeView, GameModel){
	var Router;

	Router = Backbone.Router.extend({
		routes : {
			'' : 'home',
			'home' : 'home',
			'g/:id' : 'game'
		},
		initialize : function(){
			this.headerView = new HeaderView();

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

		    this.homeView.model.on('save-success', function(code){
		    	delete that.homeView;
		    	that.navigate('#/g/'+code, {trigger : true});
		    });

		    this.elms['page-content'].html(this.homeView.render().el);
		},
		game : function(id){

		}
	});

	return Router;
});