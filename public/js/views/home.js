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
			this.currSelected = 'NONE';
			this.model = new GameModel();
			this.template = _.template(tpl);
		},
		events : {
			"click #peasant-submit" : "submitPeasant",
			"click #king-submit" : "submitKing",
			"click .team.left img" : "clickTeamKing",
			"click .team.right img" : "clickTeamPeasant"
		},
		render : function(){
			var that = this,
				tmpl;

			var tmpl = this.template();

			$(that.el).html(tmpl);
			return this;
		},
		clickTeamKing : function(){
			if(this.currSelected == 'KING'){				
				this.currSelected = 'NONE';
				$(this.el).find('.team-details').addClass('hidden');
			}else{
				$(this.el).find('.team-details').removeClass('hidden');
				$(this.el).find('.team-details').removeClass('peasant');
				$(this.el).find('.team-details').addClass('king');
				$(this.el).find('.team-details .team-info').addClass('hidden');
				$(this.el).find('.team-info.king').removeClass('hidden');
				//show King div and set currSelected to KING
				this.currSelected = 'KING';
			}
		},
		clickTeamPeasant : function(){
			if(this.currSelected == 'PEASANT'){
				this.currSelected = 'NONE';
				$(this.el).find('.team-details').addClass('hidden');
			}else{
				$(this.el).find('.team-details').removeClass('hidden');
				$(this.el).find('.team-details').removeClass('king');
				$(this.el).find('.team-details').addClass('peasant');
				$(this.el).find('.team-details .team-info').addClass('hidden');
				$(this.el).find('.team-info.peasant').removeClass('hidden');
				this.currSelected = 'PEASANT';
			}
		},
		submitPeasant : function(){
			var that = this,
				peasantName = $('#peasant-name').val();

			//send ajax request to server
			$.ajax({
				url : '/api/v1/game/random',
				type : 'GET',
				data : {
					peasantName : peasantName
				},
				dataType : 'json'				
			}).done(function(res){
				if(res.error){
					console.log(res);
				}else{
					if(res){
						that.model.set(res);
						that.model.trigger('peasant-start-success');
					}else{
						console.log(res);
					}
				}
			}).fail(function(jqXHR, textStatus){
				console.log("Request failed: " + textStatus);
			});
			

			
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
					if(res && res.error){
						console.log('Error starting a new game');
						if(res.error.code == 2){
							console.log('Game limit reached');
						}
					}else{
						console.log('Success, starting a new game');
						model.trigger('king-start-success');
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
			});
		}

	});

	return HomeView;
});