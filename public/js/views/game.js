define('GameView',[
	'jquery',
	'underscore',
	'backbone',
	'text!templates/game.html',
	'GameModel'
], function($, _, Backbone, tpl, GameModel){
	var GameView;

	GameView = Backbone.View.extend({
		initialize : function(model){
			this.template = _.template(tpl);
			this.model = model;
			this.side = (this.model.get('king.authId') == null) ? 'W' : 'B';
			
		},
		render : function(){
			var that = this,
				tmpl;

			var game = this.model.toJSON();		

			var tmpl = this.template({game: game, side : this.side});

			$(that.el).html(tmpl);
			return this;
		}
	});

	return GameView;
});