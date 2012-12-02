define("ChessPiece",[
	'easel'
], function(){
	var ChessPiece;

	ChessPiece = function(opts){
		this.type = opts.type;
		this.row = opts.row;
		this.col = opts.col;
		this.color = opts.color;
		this.spriteSheet = opts.spriteSheet;

		this.alive = true;
		
		this.animation = new createjs.BitmapAnimation(this.spriteSheet);
		this.animation.gotoAndPlay(this.type+"_up");

		this.graphics = new createjs.Container();
		this.graphics.addChild(this.animation);
		this.graphics.x = this.col * 64;
		this.graphics.y = this.row * 64;
	};

	ChessPiece.prototype = {
		initialize : function(){

		},
		getPossibleMoves : function(){
			//array of row cols;
		},
		activate : function(){

		},
		deactivate : function(){
			
		}
	};

	return ChessPiece;
});