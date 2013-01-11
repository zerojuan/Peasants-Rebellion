(function(module){
	module.exports = {
		parseChatMessage : function(chatMessage){
			//just get the bang
			var args = chatMessage.split(" ");
			if(args[0] == '!usurp'){
				if(args.length == 3){
					return {
						command: 'usurp',
						passcode : args[1],
						newPasscode : args[2]
					};	
				}				
			}
			return null;
		},
		doUsurp : function(game, usurper, passcode, newPasscode){
			var peasantList = game.peasants;
			
			for(var i = peasantList.length - 1; i >= 0; i--){
				var peasant = peasantList[i];
				//check if the peasant is officially on the list			
				if(peasant.playerCode == usurper.playerCode){
					if(game.king.passkey == passcode){
						//oust the king
						game.king = usurper;
						game.king.passkey = newPasscode;
						game.king.authId = game.generateAuthKey();
						game.peasants.splice(i, 1);
						return true;
					}else{
						console.log('King: ' + game.king.passkey + " vs " + passcode);
						return false;
					}
					continue;
				}
			}

			return false;
		}
	}

}(typeof module === 'undefined' ? this.chatCommands = {} : module));