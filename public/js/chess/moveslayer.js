define('MovesLayer',[
	'easel',
	'tween'
], function(){
	var MovesLayer;

	MovesLayer = function(){
		this.tiles = [];

		this.possibles = [];

		this.graphics = new createjs.Container();

		for(var i = 0; i < 32; i++){
			var tile = {
				row : 0,
				col : 0,
				piece : null,
				graphics : null,
				visible : false,
				setPosition : function(row, col){
					//console.log('Setting Position: ' + row + ', ' + col);
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
					createjs.Tween.get(this.graphics, {override: true}).to({x: this.col * 64, y: this.row * 64}, 150);					
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
			graphics.beginFill('#cc0');
			graphics.drawRect(0, 0, 64, 64);
			graphics.endFill();

			tile.graphics = new createjs.Shape(graphics);
			tile.graphics.x = i * 5;
			tile.graphics.alpha = 0;
			this.tiles.push(tile);
			this.graphics.addChild(tile.graphics);
		}
	}

	MovesLayer.prototype = {
		initialize : function(){

		},
		setPossibleMoves : function(piece, possibles){
			this.possibles = possibles;
			for(var i  = 0, j = 0; i < this.tiles.length; i++){
				var tile = this.tiles[i];
				if(possibles != null && j < possibles.length){
					var possible = possibles[j];					
					//console.log('Printing: ' + possible.to.row + ',' + possible.to.col);
					tile.setPosition(possible.to.row, possible.to.col);
					tile.setVisible(piece, true);
					j++;
				}else{
					tile.setVisible(piece, false);
				}
		 	}
		},
		canMoveHere : function(boardData, row, col, piece){
			return boardData[row][col].charAt(0) != piece.color;	
		},
		isPossibleMove : function(row, col){
			for(var i in this.possibles){
				var possible = this.possibles[i];
				if(possible.to.row == row && possible.to.col == col){
					return true;
				}
			}
			return false;
		},
		activate : function(){
			//tween possible moves

		},
		deactivate : function(){			
			this.setPossibleMoves(null);
		}
	}

	return MovesLayer;
});