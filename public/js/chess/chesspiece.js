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
		promote : function(){			
			this.animation.gotoAndPlay(this.type+"_up_promote");
			this.type = 'Q';
		},
		activate : function(){
			this.animation.gotoAndPlay(this.type+"_up"+"_selected");
		},
		deactivate : function(){
			this.animation.gotoAndPlay(this.type+"_up"+"_awake");	
		},
		updateTurn : function(isMyTurn){
			console.log('Is My Turn: ' + isMyTurn);
			if(isMyTurn){
				this.animation.gotoAndPlay(this.type+"_up"+"_awake");
			}else{
				this.animation.gotoAndPlay(this.type+"_up"+"_idle");
			}
		},
		move : function(row, col){
			if(this.type == 'P'){
				//promote to queen
				if((this.color == 'W' && row == 0) ||
					(this.color == 'B' && row == 7)){
					this.promote();									
				}
			}			
			this.row = row;
			this.col = col;
			this.graphics.x = this.col * 64;
			this.graphics.y = this.row * 64;
		},
		remove : function(row, col){
			this.row = -1;
			this.col = -1;
			this.alive = false;
			this.graphics.alpha = 0;
		}
	};

	return ChessPiece;
});