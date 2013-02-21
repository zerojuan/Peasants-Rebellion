define('TouchMovesLayer',[
	'easel',
	'tween'
], function(){
	var TouchMovesLayer;

	TouchMovesLayer = function(){
		this.tiles = [];
		this.possibles = [];
		this.graphics = new createjs.Container();

		for(var i = 0; i < 64; i++){
			var tile = {
				row : 0,
				col : 0,
				piece : null,
				graphics : null,
				visible : false,
				setPosition : function(row, col){					
					this.row = row;
					this.col = col;
				},
				setVisible : function(piece, visible){
					this.visible = visible;
					if(this.visible){
						//this.graphics.alpha = .5;
						this.piece = piece;
						this.glow(piece);
					}else{						
						this.fadeOut();						
						//this.piece = null;
					}
				},
				glow : function(){					
					var that = this;
					this.graphics.alpha = .3;
					this.graphics.y = this.piece.row * 64;
					this.graphics.x = this.piece.col * 64;
					createjs.Tween.get(this.graphics, {override: true}).to({x: this.col * 64, y: this.row * 64}, 150).call(onComplete);					
					function onComplete(){
						// console.log("TWEEN COMPLETED");
						createjs.Tween.get(that.graphics, {override: true}).to({alpha: 0}, 3000).call(function(){
							that.piece = null;
						});					
					}
					//createjs.Tween.get(this.graphics, {override: true, loop: true}).to({alpha:.5}, 300).to({alpha:.2}, 300);
				},
				fadeOut : function(){					
					//createjs.Tween.get(this.graphics, {override: true}).to({alpha:0}, 200);
					if(this.piece){
						createjs.Tween.get(this.graphics, {override: true}).to({x: this.piece.col * 64, y: this.piece.row * 64, alpha: 0}, 300);//.to({alpha:.2}, 300);
						this.piece = null;
					}else{
						this.graphics.alpha = 0;
						this.piece = null;
					}											
					
				}
			};
			var graphics = new createjs.Graphics();
			graphics.beginFill('#0c0');
			graphics.drawRect(0, 0, 64, 64);
			graphics.endFill();

			tile.graphics = new createjs.Shape(graphics);
			tile.graphics.x = i * 5;
			tile.graphics.alpha = 0;
			this.tiles.push(tile);
			this.graphics.addChild(tile.graphics);
		}
	}

	TouchMovesLayer.prototype = {
		initialize : function(){

		},
		onTouch : function(boardData, touchMove){
			console.log("Touched!", touchMove);
			var piece = {
				type : touchMove.piece,
				row : touchMove.from.row,
				col : touchMove.from.col,
				color : touchMove.color,				
			};
			var possibleMoves = chessLogic.exports.getPossibleMoves(boardData, piece);
			console.log("PossibleMoves: " + possibleMoves.length);
			this.setPossibleMoves(piece, possibleMoves);
		},
		setPossibleMoves : function(piece, possibles){
			for(var i = 0, j = 0; i < this.tiles.length; i++){
				var tile = this.tiles[i];
				if(tile.piece){					
				 	continue;
				}
				if(possibles != null && j < possibles.length){
					var possible = possibles[j];
					tile.setPosition(possible.to.row, possible.to.col);
					tile.setVisible(piece, true);
					j++;
				}else{
					tile.setVisible(null, false);
				}
			}
		}
	}

	return TouchMovesLayer;
})