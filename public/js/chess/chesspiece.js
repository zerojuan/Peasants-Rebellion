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
			console.log(this.type+"_up_promote");
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
			if(this.animation.currentAnimation == 'P_up_promote'){
				return;
			}
			if(isMyTurn){
				this.animation.gotoAndPlay(this.type+"_up"+"_awake");
			}else{
				this.animation.gotoAndPlay(this.type+"_up"+"_idle");
			}
		},
		updateWinner : function(winner){
			if(winner == 'D'){
				this.animation.gotoAndPlay(this.type+"_up_idle");
			}else if(winner == this.color){
				this.animation.gotoAndPlay(this.type+"_up_selected");
			}else{
				this.animation.gotoAndPlay(this.type+"_up_idle");
			}
		},
		move : function(row, col){
			var that = this;			
			this.row = row;
			this.col = col;
			createjs.Tween.get(this.graphics).to({x: this.col * 64, y: this.row * 64}, 800, createjs.Ease.cubicOut)
				.call(function(){
					if(that.type == 'P'){
						console.log('CHANGING PROMOTION:  ' + this.type);
						console.log('Row: ' + row);
						console.log('Color: ' + this.color);
						//promote to queen
						if((that.color == 'W' && row == 0) ||
							(that.color == 'B' && row == 7)){
							this.promote();									
						}
					}		
					that.graphics.x = that.col * 64;
					that.graphics.y = that.row * 64;
				});
			//this.graphics.x = this.col * 64;
			//this.graphics.y = this.row * 64;
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