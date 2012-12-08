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
	canMoveHere : function(boardData, row, col, piece){
		return boardData[row][col].charAt(0) != piece.color;
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
	}
}