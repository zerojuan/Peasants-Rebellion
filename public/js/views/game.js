define('GameView',[
	'jquery',
	'underscore',
	'backbone',
	'text!templates/game.html',
	'text!templates/status-item.html',
	'text!templates/move-item.html',
	'text!templates/chat-item.html',
	'text!templates/result-sidebar.html',
	'text!templates/usurp-item.html',
	'text!templates/announcement-item.html',
	'GameModel',
	'PlayChess'
], function($, _, Backbone, tpl, statusTpl, moveTpl, chatTpl, resultTpl, usurpTpl, announcementTpl, GameModel, PlayChess){
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
			this.moveTemplate = _.template(moveTpl);
			this.resultTemplate = _.template(resultTpl);
			this.usurpTemplate = _.template(usurpTpl);
			this.announcementTemplate = _.template(announcementTpl);

			xRTML.Config.debug = true;
			this.ortcClient = null;

			//if game is still running
			if(this.model.get('alive')){  
				xRTML.ready(function(){
					var connection = xRTML.ConnectionManager.create({
						url : 'http://ortc-developers.realtime.co/server/2.1/',
						id : 'Peasant-Chess-Connection',
						appKey : 'Qy9W72',
						authToken : 'peasantchessauth',
						channels : [{
							name : 'peasant_chess_browser_' + that.channel,
							onMessage : xRTML.Common.Function.proxy(function(e){
								var message = e.message;
								console.log('Message Recieved: ' + message);
								that._parseMessage(message);
							}, this)
						}],
						onConnect : xRTML.Common.Function.proxy(function(e){
							console.log('Connected...');
							$('.overlay').fadeOut();
							$('.chat-box').prop('disabled', false);									
						}, this),
						metadata : xRTML.JSON.stringify({
							player : that.model.get('player'),
							color : that.side,
							code : that.model.get('code')
						})
					});
				});		
			}else{
				$('.overlay').fadeOut();
			}
				
			
			$('time').timeago();
		},
		events : {
			"keyup .chat-box" : "onChatType",
			"focus .chat-box" : "onChatFocus",
			"blur .chat-box" : "onChatBlur",
			"resize window" : "onResizeWindow",
			"click #results-panel" : "onHideResultsPanel"
		},
		render : function(){
			var that = this,
				tmpl;

			var game = this.model.toJSON();		
			var color = 'king';
			if(this.side == 'W'){
				color = 'peasant';
			}

			var tmpl = this.template({color: color, game: game, side : this.side});

			$(that.el).html(tmpl);					
			
			var canvas = $(that.el).find('#gameboard')[0];
						
			this.playChess.initialize(canvas, game, function(){
				that.updateTurn(that.model.get('turn'));
				if(!game.alive){
					console.log('GAME IS DEAD!');
					$(that.el).find('.overlay').hide();				
					that.showWinnerBG(game.winner);
					that.showResultSidebar(game.winner, game.moves);
					that.playChess.showGameOver(game.winner);
				}else{
					that.showMoves(game.moves);
				}
			});

			$(window).resize(function(){
				that._resizeScroller();
			})
			//initialize antiscroll here
				
			return this;
		},
		initializeAntiscroll : function(){
			this._resizeScroller();
		},
		_resizeScroller : function(){
			var this_el = $(this.el);
			var height = this_el.find('.content-slider-wrapper').height();
			var headerHeight = this_el.find('.side-bar-header').height() + 20;
			console.log('Height: ' + height + " HeaderHeight: " + headerHeight);	
			this_el.find('.antiscroll-inner').css('height', (height-headerHeight)+'px')
				.css('width', '290px');
			this.scroller = this_el.find('.antiscroll-wrap').antiscroll().data('antiscroll');
		},
		onResizeWindow : function(){
			this._resizeScroller();
		},
		onChatBlur : function(){
			var msg = $.trim($(this.el).find('.chat-box').val());
			if(msg === ""){
				$(this.el).find('.chat-box').attr('placeholder', 'Say something...');
				$(this.el).find('.chat-form').removeClass('expanded');
				$(this.el).find('.chat-form').addClass('condensed');	
			}			
		},
		onHideResultsPanel : function(){			
			$(this.el).find('#results-panel').animate({top: "-1000px", bottom: "1000px"}, 600);					
			$(this.el).find('#results-panel .bg').animate({bottom: "1000px"}, 600);
			//$(this.el).find('#results-panel .bg').fadeOut(500, function(){$(this).hide()});
		},
		showResultsPanel : function(winner){			
			if(winner == 'B'){
				$(this.el).find('#results-panel img').attr('src', './assets/king-win.png');
			}else if(winner == 'W'){
				$(this.el).find('#results-panel img').attr('src', './assets/peasant-win.png');
			}else{				
				$(this.el).find('#results-panel img').attr('src', './assets/peasant-win.png');
				$(this.el).find('#results-panel figcaption').html('Stalemate...');
			}
			this.showWinnerBG(winner);
			$(this.el).find('#results-panel').css('top', '-1000px').animate({top: "0", bottom: "0"}, 600);					
			$(this.el).find('#results-panel .bg').css('bottom', '1000px').animate({bottom: "0"}, 600);
		},
		showResultSidebar : function(winner, moves){
			var winnerTxt = '';
			var message = '';
			if(winner == 'B'){
				winnerTxt = 'king';
				message = 'The Monarch Endures!';
			}else if(winner == 'W'){
				winnerTxt = 'peasant';
				message = 'The Rebellion has Succeeded!';
			}else{
				winnerTxt = 'draw';
				message = 'The War Dragged to a Stalemate';
			}
			var tmpl = this.resultTemplate({winner: winnerTxt, message: message});
			$(this.el).find('.content-slider-item').html(tmpl).hide().fadeIn();
			this.showMoves(moves);
		},
		showMoves : function(moves){
			for(var i in moves){
				var move = moves[i];
				this.createMoveElement(move);
			}	
		},
		showWinnerBG : function(winner){
			if(winner == 'B'){
				$(this.el).find('.winning-bg img').attr('src', './assets/king-shield-alpha.png');
			}else if(winner == 'W'){
				$(this.el).find('.winning-bg img').attr('src', './assets/peasant-shield-alpha.png');
			}else{
				$(this.el).find('.winning-bg img').attr('src', './assets/draw-shield-alpha.png');
			}
			$(this.el).find('.winning-bg').css('left', '-1000px').animate({"left": "-250px"}, 600);
			$(this.el).find('#turn-wrapper').html('');
			$('time').timeago();	
		},
		onChatFocus : function(){
			console.log('Chat form');
			$(this.el).find('.chat-box').attr('placeholder', 'Type "!usurp <passkey> <newpasskey>" to usurp the king. Otherwise, type whatever.');
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
				name : this.model.get('player').name,
				piece : piece.type,
				color : piece.color,
				from : {
					row : piece.row,
					col : piece.col,
				},
				to : move_to
			});
		},
		onTouch : function(piece){
			this._publishMessage('touch', {
				name : this.model.get('player').name,
				code : this.model.get('player').playerCode,
				piece : piece.type,
				color : piece.color,
				from : {
					row: piece.row,
					col : piece.col
				}
			});
		},
		_appendToFeed : function(tmpl){
			$(tmpl).hide().prependTo($(this.el).find('.feed-content-inner')).fadeIn("slow");
			this.scroller.refresh();
		},
		createAnnouncementElement : function(type, data){
			var timestring = $.timeago(new Date());
			var message = "";
			var status = 'king';
			if(data.color == 'B'){
				status = 'king';
			}else{
				status = 'peasant';
			}
			if(type == "disconnect"){
				if(data.color == 'B'){
					message = " has left the throne!"
				}else{
					message = " has left.";	
				}
				
			}else{
				if(data.color == 'B'){
					message = " is back!";
				}else{
					message = " has joined the Rebels!";
				}
			}
			
			var tmpl = this.announcementTemplate({type: type, color: data.color, name: data.player.name, timestamp: new Date(), timestring: timestring, message: message, status: status});
			this._appendToFeed(tmpl);
		},
		createChatElement : function(data){
			var timestring = $.timeago(data.timestamp);
			var tmpl = this.chatTemplate({color: data.player.color, name: data.player.name, message: data.message, timestamp : data.timestamp, timestring : timestring});
			this._appendToFeed(tmpl);
		},
		createStatusElement : function(data, msg){
			var timestring = $.timeago(new Date());
			if(data){
				msg = data.color + data.piece + " moved.";
				timestring = $.timeago(new Date());
			}
			
			var tmpl = this.statusTemplate({msg : msg, timestamp : new Date().toISOString(), timestring: timestring});					
			this._appendToFeed(tmpl);
		},
		createUsurpElement : function(status, data){
			var timestring = $.timeago(new Date());
			var kingName = this.model.get('king').name;
			var tmpl = this.usurpTemplate({timestamp: new Date().toISOString(), timestring: timestring, status : status, name : data.player.name, kingName: kingName});
			this._appendToFeed(tmpl);
		},
		createMoveElement : function(data){
			var date = new Date(data.time);
			var timestring = $.timeago(date);

			var piece = 'King';
			switch(data.piece){
				case 'K' : if(data.color == 'B')
								piece = 'King'; 
						   else
						   		piece = 'Leader'
						   break;
				case 'Q' : if(data.color == 'B')
							piece = 'Queen'; 
						   else
						   	piece = 'General';
						   break;
				case 'N' : piece = 'Knight';
						   break;
				case 'P' : if(data.color == 'B')
							piece = 'Pawn';
						   else
						   	piece = 'Peasant';
						   break;
			}

			if(data.type == 'promote'){
				
			}else if(data.type == 'stalemate'){

			}else if(data.type == 'checkmate'){

			}

			var cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
			var from = cols[data.from.col]+ ""+ (data.from.row + 1)

			var to = cols[data.to.col]+ ""+ (data.to.row + 1)				

			var tmpl = this.moveTemplate({data: data, result : "", from: from, to: to, piece: piece, timestamp: date.toISOString(), timestring: timestring});
			this._appendToFeed(tmpl);
		},
		updateColor : function(color){
			this.side = color;
			this.playChess.setColor(color);
		},
		updateTurn : function(currentTurn){
			var name = (this.side == 'W') ? 'Peasant' : 'King';
			console.log('Current Turn: ' + currentTurn);
			this.playChess.setTurn(currentTurn);
			this.model.set('turn', currentTurn);
			if(this.side == currentTurn){
				if(this.side == 'W'){
					$(this.el).find('#turn-wrapper').html('Our turn, Brother');	
				}else{
					$(this.el).find('#turn-wrapper').html('Your turn, Your Highness');	
				}
				
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
				case 'connection':
					console.log('Connected: ' + data.player.name);
					this.createAnnouncementElement('connect', data);
					break;
				case 'disconnection':
					console.log('Disconnected: ' + data.player.name);
					this.createAnnouncementElement('disconnect', data);
					break;
				case 'usurp':
					console.log('USURPATION!');
					$(this.el).find('.chat-box').removeAttr('disabled');
					if(data.success){
						console.log('All Hail the new King');
						if(this.model.get('player').playerCode == data.player.playerCode){													
							$.cookie(this.model.get('code') + '.auth_king', data.player.authId);
							console.log("Loading cookie: " + $.cookie(this.model.get('code') + '.auth_king'));
							this.updateColor('B');							
							this.updateTurn(this.model.get('turn'));	
							this.createUsurpElement('success', data);
							this.model.set('king', data.player);
						}else{
							if(this.side == 'B'){ //I was the former King								
								console.log('Goodbye, former king!');
								this.createUsurpElement('success-me', data);
								this.playChess.showGameOver('D');
								$(this.el).find('#turn-wrapper').html('You have been usurped...');
							}else{
								this.createUsurpElement('success', data);	
							}																					
						}	
					}else{
						//FAILED ATTEMPT!
						console.log('failed attempt');
						if(data.player.color == 'B'){
							this.createUsurpElement('mad', data);
						}else{
							this.createUsurpElement('failed', data);	
						}
						
					}
					
					break;
				case 'chat' : 
					console.log('CHAT:');
					if(data.player.name == this.model.get('player').name){
						$(this.el).find('.chat-box').removeAttr('disabled');
						$(this.el).find('.chat-box').val('');
					}
					this.createChatElement(data);
					break;
				case 'touch' : 
					console.log('TOUCH:');
					//check if the player code is the same as mine
					break;
				case 'move' :
					console.log('MOVE: ');
					this.createMoveElement(data);
					if(data.type == 'stalemate'){
						console.log('Stalemate');
						this.showResultsPanel('D');
						that.playChess.showGameOver('D');
					}else if(data.type == 'checkmate'){
						console.log('Checkmate!');
						var winner = '';
						if(data.turn == 'B'){
							winner = 'W';
						}else{
							winner = 'B';
						}
						this.showResultsPanel(winner);
						this.playChess.updatePiece(data);
						this.playChess.showGameOver(winner);						
					}else{
						this.updateTurn(data.turn);
						this.playChess.updatePiece(data);
					}
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
					var xrtmlMessage = xRTML.MessageManager.create({
						trigger : 'chat',
						action : '',
						data : message
					})
					xRTML.ConnectionManager.sendMessage({connections: ['Peasant-Chess-Connection'],
						channel : channel, content : xrtmlMessage});
					break;
				case 'touch' : 
					var message = {
						type : type,
						data : data
					}
					var xrtmlMessage = xRTML.MessageManager.create({
						trigger : 'touch',
						action : '',
						data : message
					});
					xRTML.ConnectionManager.sendMessage({connections: ['Peasant-Chess-Connection'],
						channel : channel, content : xrtmlMessage});
					break;
				case 'move' :
					var message = {
						type : type,
						data : data
					};
					var xrtmlMessage = xRTML.MessageManager.create({
						trigger : 'move',
						action : '',
						data : message
					})
					xRTML.ConnectionManager.sendMessage({connections: ['Peasant-Chess-Connection'],
						channel : channel, content : xrtmlMessage});
					break;
			}
		}
	});
 
	return GameView;
});