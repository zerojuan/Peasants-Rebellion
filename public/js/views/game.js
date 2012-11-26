define('GameView',[
	'jquery',
	'underscore',
	'backbone',
	'text!templates/game.html',
	'GameModel'
], function($, _, Backbone, tpl, GameModel){
	var GameView;

	GameView = Backbone.View.extend({
		initialize : function(){
			this.template = _.template(tpl);
		},
		render : function(){
			var that = this,
				tmpl;

			var tmpl = this.template();

			$(that.el).html(tmpl);
			return this;
		}
	});

	return GameView;
});