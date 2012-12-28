define('GameView',[
	'jquery',
	'underscore',
	'backbone',
	'text!templates/game.html',
	'text!templates/status-item.html',
	'text!templates/chat-item.html',
	'GameModel',
	'PlayChess'
], function($, _, Backbone, tpl, statusTpl, chatTpl, GameModel, PlayChess){
	var GameView;

	var that = GameView;

	GameView = Backbone.View.extend({
		initialize : function(model){
			var that = this;
			this.model = model;
			this.channel = this.model.get('code');
			this.side = (this.model.get('player').authId == null) ? 'W' : 'B';
			this.playChess = new PlayChess({
				color : this.side,
				turn : this.model.get('turn')
			});

			this.playChess.addMoveListener(this);

			this.template = _.template(tpl);
			this.chatTemplate = _.template(chatTpl);
			this.statusTemplate = _.template(statusTpl);

			xRTML.Config.debug = true;
			this.ortcClient = null;

			loadOrtcFactory(IbtRealTimeSJType, function(factory, error){
				if(error != null){
					console.log('Factory error: ' + error.message);
				}else{
					if(factory != null){
						that.ortcClient = factory.createClient();

						that.ortcClient.setClusterUrl('http://ortc-developers.realtime.co/server/2.1/');
                 
						that.ortcClient.onConnected = function(ortc){
							console.log('Connected...');
							$('.overlay').fadeOut();
							$('.chat-box').prop('disabled', false);
							that.ortcClient.subscribe('peasant_chess_browser_' + that.channel,
								true, function(ortc, channel, message){
									console.log('Message Recieved: ' + message);
									that._parseMessage(message);
								});
						}

						that.ortcClient.connect('Qy9W72', 'peasantchessauth');
					}
				}
			});
			$('time').timeago();
		},
		events : {
			"keyup .chat-box" : "onChatType" 
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
		onChatType : function(e){
			console.log('Key pressed');
			if(e.keyCode == 13 && !e.shiftKey){				
				var message = $.trim($(this.el).find('.chat-box').val());
				$(this.el).find('.chat-box').val(message);
				//submit chat message
				var timestamp = new Date().toISOString();
				var data = {
					player : this.model.get('player'),
					message : message,
					timestamp : timestamp
				}
				this._publishMessage('chat', data);
			}
			return false;
		},
		onMove : function(piece, move_to){
			this._publishMessage('move', {
				piece : piece.type,
				color : piece.color,
				from : {
					row : piece.row,
					col : piece.col,
				},
				to : move_to
			});
		},
		createChatElement : function(data){
			var timestring = $.timeago(data.timestamp);
			var tmpl = this.chatTemplate({name: data.player.name, message: data.message, timestamp : data.timestamp, timestring : timestring});
			$(this.el).find('.feed-content-inner').prepend(tmpl);
		},
		createStatusElement : function(data, msg){
			var timeString = $.timeago(new Date());
			if(data){
				msg = data.color + data.piece + " moved.";
				timestring = $.timeago(data.timestamp);
			}
			
			var tmpl = this.statusTemplate({msg : msg});					
			$(this.el).find('.feed-content-inner').prepend(tmpl);					
		},
		_parseMessage : function(message){
			var msgObj = JSON.parse(message);
			var data = msgObj.data;
			//the message is global
			switch(msgObj.type){
				case 'chat' : 
					console.log('CHAT:');
					//TODO: show chat message
					this.createChatElement(data);
					break;
				case 'move' :
					console.log('MOVE: ');
					this.createStatusElement(data);
					this.playChess.updatePiece(data);
					break;
			}
			$('time').timeago();
		},
		_publishMessage : function(type, data){
			//send via ajax			 
			var channel = 'peasant_chess_server_'+this.channel;
			console.log('Publishing to ' + channel);
			switch(type){
				case 'connect':
					console.log('Connected'); 
					break;
				case 'chat':				
					var message = {
						type : type,
						data : data
					};
					this.ortcClient.send(channel,JSON.stringify(message));
					console.log("Sending to chat");
					break;
				case 'move' :
					var message = {
						type : type,
						data : data
					};
					this.ortcClient.send(channel,
						JSON.stringify(message));
					break;
			}
		}
	});
 
	return GameView;
});