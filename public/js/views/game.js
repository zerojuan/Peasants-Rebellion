define('GameView',[
	'jquery',
	'underscore',
	'backbone',
	'text!templates/game.html',
	'GameModel',
	'PlayChess'
], function($, _, Backbone, tpl, GameModel, PlayChess){
	var GameView;

	GameView = Backbone.View.extend({
		initialize : function(model){
			var that = this;
			this.model = model;
			this.channel = this.model.get('code');
			this.side = (this.model.get('player').authId == null) ? 'W' : 'B';
			this.playChess = new PlayChess(this.side);

			this.template = _.template(tpl);

			this.pubnub = PUBNUB.init({
				publish_key : 'pub-ffc0ec10-6f99-4d87-b7dc-b950178e0891',
				subscribe_key : 'sub-997218e1-5ccd-11e1-8d2c-674c1f1ec115',
				ssl : false,
				uuid : this.model.get('player').playerCode,
				origin : 'pubsub.pubnub.com'
			});
			this.pubnub.subscribe({
				channel : 'peasant_chess_browser_'+that.channel,
				restore : false,
				callback : function(message){
					console.log(message);
					that._parseMessage(message);
				},
				disconnect : function(){
					alert("Connection Lost");
				},
				reconnect : function(){
					alert("And we're back");
				},
				connect : function(){
					that._publishMessage('connect', {
						code : that.model.get('code'),
						player : that.model.get('player')
					});
				}
			});
		},
		render : function(){
			var that = this,
				tmpl;

			var game = this.model.toJSON();		

			var tmpl = this.template({game: game, side : this.side});

			$(that.el).html(tmpl);

			var canvas = $(that.el).find('#gameboard')[0];			
			this.playChess.initialize(canvas, game);
			
			return this;
		},
		_parseMessage : function(message){
			//the message is global
		},
		_publishMessage : function(type, data){
			var channel = 'peasant_chess_server_'+this.channel;
			console.log('Publishing to ' + channel);
			switch(type){
				case 'connect':
					console.log('Connected'); 
					break;
				case 'chat':
					this.pubnub.publish({
						channel : channel,
						message : {
							type : type,
							data : data
						}
					});
					break;
				case 'move' :
					console.log('Move');
					this.pubnub.publish({
						channel : channel,
						message : {
							type : type,
							data : data
						}
					});
			}
		}
	});

	return GameView;
});