define('HomeView', [
	'jquery',
	'underscore',
	'backbone',
	'text!templates/home.html',
	'GameModel'
], function($, _, Backbone, tpl, GameModel){
	var HomeView;

	HomeView = Backbone.View.extend({
		initialize : function(){
			this.model = new GameModel();
			this.template = _.template(tpl);
		},
		events : {
			"click #peasant-submit" : "submitPeasant",
			"click #king-submit" : "submitKing"
		},
		render : function(){
			var that = this,
				tmpl;

			var tmpl = this.template();

			$(that.el).html(tmpl);
			return this;
		},
		submitPeasant : function(){
			var peasantName = $('#peasant-name').val();

			//send request to server
		},
		submitKing : function(){
			var kingName = $.trim($('#king-name').val());
			var kingPass = $.trim($('#king-pass').val());

			this.model.save({
				kingName : kingName,
				kingPass : kingPass 
			}, {
				silent : false,
				sync : true,
				success : function(model, res){
					if(res && res.errors){
						console.log('Error starting a new game');
					}else{
						console.log('Success, starting a new game');
						model.trigger('start-success');
					}
				},
				error : function(model, res){
					if(res && res.errors){
						console.log('Error starting new game');
					}else if(res.status === 404){
						console.log('Unable to start a new game: 404');
					}else if(res.status === 500){
						console.log('Unable to start a new game: 500');
					}
				}
			})
		}

	});

	return HomeView;
});