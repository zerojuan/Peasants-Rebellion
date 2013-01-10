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

			xRTML.ready(function(){
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
								that.updateTurn(that.model.get('turn'));
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
			});

			
			$('time').timeago();
		},
		events : {
			"keyup .chat-box" : "onChatType",
			"focus .chat-box" : "onChatFocus",
			"blur .chat-box" : "onChatBlur"
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
		onChatBlur : function(){
			var msg = $.trim($(this.el).find('.chat-box').val());
			if(msg === ""){
				$(this.el).find('.chat-form').removeClass('expanded');
				$(this.el).find('.chat-form').addClass('condensed');	
			}			
		},
		onChatFocus : function(){
			$(this.el).find('.chat-form').removeClass('condensed');
			$(this.el).find('.chat-form').addClass('expanded');
		},
		onChatType : function(e){
			if(e.keyCode == 13 && !e.shiftKey){				
				var chatBox = $(this.el).find('.chat-box');
				var message = $.trim(chatBox.val());
				chatBox.val(message);
				//submit chat message
				var timestamp = new Date().toISOString();
				var data = {
					player : this.model.get('player'),
					message : message,
					timestamp : timestamp
				}
				this._publishMessage('chat', data);
				//disable text input
				chatBox.attr('disabled', 'disabled');
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
			var timestring = $.timeago(new Date());
			if(data){
				msg = data.color + data.piece + " moved.";
				timestring = $.timeago(new Date());
			}
			
			var tmpl = this.statusTemplate({msg : msg, timestamp : new Date().toISOString(), timestring: timestring});					
			$(this.el).find('.feed-content-inner').prepend(tmpl);					
		},
		updateTurn : function(currentTurn){
			var name = (this.side == 'W') ? 'Peasant' : 'King';
			console.log('Current Turn: ' + currentTurn);
			if(this.side == currentTurn){
				$(this.el).find('#turn-wrapper').html('Your Turn, ' + name);
			}else{				
				if(this.side == 'W'){
					name = "the King's turn";
				}else{
					name = "the peasants' move";
				}
				$(this.el).find('#turn-wrapper').html('Waiting for ' + name);
			}
		},
		_parseMessage : function(message){
			var msgObj = JSON.parse(message);
			var data = msgObj.data;
			//the message is global
			switch(msgObj.type){
				case 'chat' : 
					console.log('CHAT:');
					if(data.player.name == this.model.get('player').name){
						$(this.el).find('.chat-box').removeAttr('disabled');
						$(this.el).find('.chat-box').val('');
					}
					this.createChatElement(data);
					break;
				case 'move' :
					console.log('MOVE: ');
					if(data.type == 'promote'){
						
					}else if(data.type == 'stalemate'){

					}else if(data.type == 'checkmate'){

					}
					this.createStatusElement(data);
					this.updateTurn(data.turn);
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