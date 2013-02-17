define('TouchMovesLayer',[
	'easel'
], function(){
	var TouchMovesLayer;

	TouchMovesLayer = function(){
		this.graphics = new createjs.Container();
	}

	TouchMovesLayer.prototype = {
		onTouch : function(touchMove){
			
		}
	}

	return TouchMovesLayer;
})