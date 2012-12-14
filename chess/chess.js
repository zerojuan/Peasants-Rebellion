module.exports = {
	isValidMove : function(board, type, from, to, color){		
		var possibleMoves = this._getPossibleMoves(board, {
			type : type,
			row : from.row,
			col : from.col,
			color : color
		});

		for(var i in possibleMoves){
			var move = possibleMoves[i];
			if(move.col == to.col && move.row == to.row){
				return true;
			}
		}

		return false;
	},
	endGameCheck : function(board, type, from, to, color){
		//get all possible moves

		//get all enemy moves

		//if checked
			//if I kill the checker, am I still in check?
				//yes, does my king have legal moves?
					//no, checkmate
		//else
			//do i have other possible moves?
				//no, stalemate
	},
	canMoveHere : function(boardData, row, col, piece){
		return boardData[row][col].charAt(0) != piece.color;
	},
	isOccupied : function(boardData, row, col){
		return boardData[row][col] != '0';
	},
	isEnemyOwned : function(boardData, row, col, piece){
		return boardData[row][col].charAt(0) != piece.color &&
				boardData[row][col].charAt(0) != '0';
	},
	_getPossibleMoves : function(boardData, piece){
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
				
				if(piece.color == 'W'){
					//search 2 space up
					if(piece.col != 0 && piece.row != 0 && this.isEnemyOwned(boardData, piece.row-1, piece.col-1, piece)){
						possibleMoves.push({
							row : piece.row-1,
							col : piece.col-1
						});
					}
					if(piece.col != 7 && piece.row != 0 && this.isEnemyOwned(boardData, piece.row-1, piece.col+1, piece)){
						possibleMoves.push({
							row : piece.row-1,
							col : piece.col+1
						});
					}
					if(piece.row != 0 && !this.isOccupied(boardData, piece.row - 1, piece.col)){
						possibleMoves.push({
							row : piece.row - 1,
							col : piece.col
						});
						if(piece.row == 6 && !this.isOccupied(boardData, piece.row - 2, piece.col)){
							possibleMoves.push({
								row : piece.row - 2,
								col : piece.col
							});
						}	
					}
				}else if(piece.color == 'B'){
					//search 2 space down
					if(piece.col != 0 && piece.row != 7 && this.isEnemyOwned(boardData, piece.row+1, piece.col-1, piece)){
						possibleMoves.push({
							row : piece.row+1,
							col : piece.col-1
						});
					}
					if(piece.col != 7 && piece.row != 7 && this.isEnemyOwned(boardData, piece.row+1, piece.col+1, piece)){
						possibleMoves.push({
							row : piece.row+1,
							col : piece.col+1
						});
					}
					if(piece.row != 7 && !this.isOccupied(boardData, piece.row+1, piece.col)){
						possibleMoves.push({
							row : piece.row + 1,
							col : piece.col
						});
						if(piece.row == 1 && !this.isOccupied(boardData, piece.row+2, piece.col)){
							possibleMoves.push({
								row : piece.row + 2,
								col : piece.col
							});
						}
					}
					
							//diagonal
				}

				break;
		}

		return possibleMoves;	
	}
}