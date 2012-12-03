define('MovesLayer',[
	'easel'
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
				graphics : null,
				visible : false,
				setPosition : function(row, col){
					console.log('Setting Position: ' + row + ', ' + col);
					this.row = row;
					this.col = col;
					this.graphics.y = row * 64;
					this.graphics.x = col * 64;
				},
				setVisible : function(visible){
					this.visible = visible;
					if(this.visible){
						this.graphics.alpha = .5;
					}else{
						this.graphics.alpha = 0;
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
		setPossibleMoves : function(possibles){
			this.possibles = possibles;
			for(var i  = 0; i < this.tiles.length; i++){
				var tile = this.tiles[i];
				if(possibles != null && i < possibles.length){
					var possible = possibles[i];					
					console.log('Printing: ' + possible.row + ',' + possible.col);
					tile.setPosition(possible.row, possible.col);
					tile.setVisible(true);	
				}else{
					tile.setVisible(false);
				}
			}
		},
		canMoveHere : function(boardData, row, col, piece){
			return boardData[row][col].charAt(0) != piece.color;	
		},
		getPossibleMoves : function(piece, boardData){
			var possibleMoves = [];
			switch(piece.type){
				case 'K' :
					//search one space around

					var pos = {
						col : piece.col,
						row : piece.row
					};

					console.log(pos);
					for(var row_i = pos.row - 1; row_i <= pos.row+1; row_i++){
						if(row_i >= 0 && row_i < 8){
							for(var col_i = pos.col - 1; col_i <= pos.col+1; col_i++){
								if(col_i >= 0 && col_i < 8){
									if(this.canMoveHere(boardData, row_i, col_i, piece)){
										if(col_i != pos.col || row_i != pos.row){
											possibleMoves.push({
												col : col_i,
												row : row_i
											});
										}	
									}
								}
							}	
						}
					}
					break;
				case 'Q' :
					//search diagonally
					//search rook
					break;
				case 'B' :
					//search diagonally
					break;
				case 'N' :
					//search horse
					console.log('Search KNIGHT');
					var pos = {
						col : piece.col,
						row : piece.row
					};

					//search top
					
						//search diagonal left/right
						if(pos.row - 2 >= 0){
							if(pos.col-1 >= 0 && this.canMoveHere(boardData, pos.row-2, pos.col-1, piece)){
								possibleMoves.push({
									row : pos.row - 2,
									col : pos.col - 1
								});
							}
							if(pos.col+1 < 8 && this.canMoveHere(boardData, pos.row-2, pos.col+1, piece)){
								possibleMoves.push({
									row : pos.row - 2,
									col : pos.col + 1
								});
							}
						}
					

					//search down
					
						//search diagonal left/right
						if(pos.row + 2 < 8){
							if(pos.col-1 >= 0 && this.canMoveHere(boardData, pos.row+2, pos.col-1, piece)){
								possibleMoves.push({
									row : pos.row + 2,
									col : pos.col - 1
								});
							}
							if(pos.col+1 < 8 && this.canMoveHere(boardData, pos.row+2, pos.col+1, piece)){
								possibleMoves.push({
									row : pos.row + 2,
									col : pos.col + 1
								});
							}	
						}	
					

					//search left
					
						//search diagonal up/down
						if(pos.col - 2 >= 0){
							if(pos.row-1 >= 0 && this.canMoveHere(boardData, pos.row-1, pos.col-2, piece)){
								possibleMoves.push({
									row : pos.row - 1,
									col : pos.col - 2
								})
							}
							if(pos.row+1 < 8 && this.canMoveHere(boardData, pos.row+1, pos.col-2, piece)){
								possibleMoves.push({
									row : pos.row + 1,
									col : pos.col - 2
								})
							}
						}
					

					//search right
						if(pos.col + 2 < 8){
							if(pos.row-1 >= 0 && this.canMoveHere(boardData, pos.row-1, pos.col+2, piece)){
								possibleMoves.push({
									row : pos.row - 1,
									col : pos.col + 2
								})
							}
							if(pos.row+1 < 8 && this.canMoveHere(boardData, pos.row+1, pos.col+2, piece)){
								possibleMoves.push({
									row : pos.row + 1,
									col : pos.col + 2
								})
							}
						}					
					break;
				case 'R' :
					//search rook
					break;
				case 'P' :
					//search 2 space forward
					if(piece.color == 'W'){
						if(piece.row == 6){
							possibleMoves.push({
								row : piece.row - 2,
								col : piece.col
							});
						}
						if(piece.row != 0){
							possibleMoves.push({
								row : piece.row - 1,
								col : piece.col
							});	
						}
						//diagonal
					}else if(piece.color == 'B'){
						if(piece.row == 1){
							possibleMoves.push({
								row : piece.row + 2,
								col : piece.col
							});
						}
						if(piece.row != 7){
							possibleMoves.push({
								row : piece.row + 1,
								col : piece.col
							});
						}
						//diagonal
					}

					break;
			}

			return possibleMoves;
		},
		isPossibleMove : function(row, col){
			for(var i in this.possibles){
				var possible = this.possibles[i];
				if(possible.row == row && possible.col == col){
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