module.exports = {
	isValidMove : function(board, type, from, to, color){		
		var endGame = this.endGameCheck(board, type, from, to, color);
		var allPossibleMoves = endGame.allPossibleMoves;

		for(var i in allPossibleMoves){
			var move = allPossibleMoves[i];
			if(this._moveEqual(move, { type : type, from : from, to : to, color : color})){
				return true;
			}
		}

		return false;
	},
	endGameCheck : function(board, type, from, to, color){
		//get all possible moves
		var turn = color;
		var enemyMoves = this._getAllPossibleMoves(board, (color == 'W' ? 'B' : 'W'), false);
		var checkers = this.getChecker(board, enemyMoves, turn);
		
		//checked
		var allPossibleMoves = this._getAllPossibleMoves(board, color, true, enemyMoves, checkers);
		var checkMate = false;
		var staleMate = false;
		if(checkers){
			checkMate = (checkers.length > 0 && allPossibleMoves.length == 0);
			staleMate = (checkers.length == 0 && allPossibleMoves.length == 0);
		}else{
			staleMate = allPossibleMoves.length == 0;
		}
			
		return {
			allPossibleMoves : allPossibleMoves,
			checkMate : checkMate,
			staleMate : staleMate
		};
	},
	canMoveHere : function(boardData, row, col, piece, myTurn){
		if(myTurn){
			return boardData[row][col].charAt(0) != piece.color;
		}else{
			return true;
		}
		 
	},
	isOccupied : function(boardData, row, col){
		return boardData[row][col] != '0';
	},
	isEnemyOwned : function(boardData, row, col, piece){
		return boardData[row][col].charAt(0) != piece.color &&
				boardData[row][col].charAt(0) != '0';
	},
	isEnemyControlled : function(row, col, enemyMoves){
		if(!enemyMoves) return false;
		for(var i in enemyMoves){
			var move = enemyMoves[i];
			if(move.to.row == row && move.to.col == col){
				return true;
			}
		}
		return false;
	},
	getChecker : function(boardData, enemyMoves, turn){
		var checkers = [];
		for(var i in enemyMoves){
			var move = enemyMoves[i];
			if(boardData[move.to.row][move.to.col] == turn +'K'){
				 checkers.push(move);
			}
		}
		if(checkers.length == 0){
			return null;
		}else{
			return checkers;
		}
	},
	_moveEqual : function(generatedMove, actualMove){
		return generatedMove.from.row == actualMove.from.row &&
			generatedMove.from.col == actualMove.from.col &&
			generatedMove.to.row == actualMove.to.row &&
			generatedMove.to.col == actualMove.to.col &&
			generatedMove.type == actualMove.type &&
			generatedMove.color == actualMove.color;
	},
	_getAllPossibleMoves : function(boardData, color, myTurn, enemyMoves, checkers){
		var allPossibleMoves = [];
		for(var row = 0; row < boardData.length; row++){
			for(var col = 0; col < boardData[row].length; col++){
				if(boardData[row][col].charAt(0) == color){
					//double check, King must move
					var checker = null;
					if(checkers){
						if(checkers.length > 1){
							if(boardData[row][col].charAt(1) != 'K'){
								continue;
							}
						}else{
							checker = checkers[0];
						}
					}
					var possibleMove = this._getPossibleMoves(boardData, {
						type : boardData[row][col].charAt(1),
						row : row,
						col : col,
						color : color
					}, myTurn, enemyMoves, checker);			
					allPossibleMoves.push.apply(allPossibleMoves, possibleMove);		
				}
			}
		}
		return allPossibleMoves;
	},
	_getPossibleMoves : function(boardData, piece, myTurn, enemyMoves, checker){
		var possibleMoves = [];
		var constructMove = function(to){
			return {
				type : piece.type,
				from : {
					row : piece.row,
					col : piece.col
				},
				to : {
					row : to.row,
					col : to.col
				},
				color : piece.color
			};
		};
		switch(piece.type){
			case 'K' :
				//search one space around
				var pos = {
					col : piece.col,
					row : piece.row
				};

				for(var row_i = pos.row - 1; row_i <= pos.row+1; row_i++){
					if(row_i >= 0 && row_i < 8){
						for(var col_i = pos.col - 1; col_i <= pos.col+1; col_i++){
							if(col_i >= 0 && col_i < 8){
								if(this.canMoveHere(boardData, row_i, col_i, piece, myTurn)){
									if(!this.isEnemyControlled(row_i, col_i, enemyMoves)){
										if(col_i != pos.col || row_i != pos.row){
											possibleMoves.push(constructMove({
												row : row_i,
												col : col_i											
											}));
										}	
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
				//search knight
				var pos = {
					col : piece.col,
					row : piece.row
				};

				//search top
						
				//search diagonal left/right
				if(pos.row - 2 >= 0){
					if(pos.col-1 >= 0 && this.canMoveHere(boardData, pos.row-2, pos.col-1, piece, myTurn)){
						possibleMoves.push(constructMove({
								row : pos.row - 2,
								col : pos.col - 1
						}));
					}
					if(pos.col+1 < 8 && this.canMoveHere(boardData, pos.row-2, pos.col+1, piece, myTurn)){
						possibleMoves.push(constructMove({
								row : pos.row - 2,
								col : pos.col + 1
						}));
					}
				}
						

				//search down
						
				//search diagonal left/right
				if(pos.row + 2 < 8){
					if(pos.col-1 >= 0 && this.canMoveHere(boardData, pos.row+2, pos.col-1, piece, myTurn)){
						possibleMoves.push(constructMove({
							row : pos.row + 2,
							col : pos.col - 1
						}));
					}
					if(pos.col+1 < 8 && this.canMoveHere(boardData, pos.row+2, pos.col+1, piece, myTurn)){
						possibleMoves.push(constructMove({
							row : pos.row + 2,
							col : pos.col + 1
						}));
					}	
				}	
						

				//search left
						
				//search diagonal up/down
				if(pos.col - 2 >= 0){
					if(pos.row-1 >= 0 && this.canMoveHere(boardData, pos.row-1, pos.col-2, piece, myTurn)){
						possibleMoves.push(constructMove({
							row : pos.row - 1,
							col : pos.col - 2
						}));
					}
					if(pos.row+1 < 8 && this.canMoveHere(boardData, pos.row+1, pos.col-2, piece, myTurn)){
						possibleMoves.push(constructMove({
							row : pos.row + 1,
							col : pos.col - 2
						}));
					}
				}
						

				//search right
				if(pos.col + 2 < 8){
					if(pos.row-1 >= 0 && this.canMoveHere(boardData, pos.row-1, pos.col+2, piece, myTurn)){
						possibleMoves.push(constructMove({
							row : pos.row - 1,
							col : pos.col + 2
						}));
					}
					if(pos.row+1 < 8 && this.canMoveHere(boardData, pos.row+1, pos.col+2, piece, myTurn)){
						possibleMoves.push(constructMove({
							row : pos.row + 1,
							col : pos.col + 2
						}));
					}
				}					
				break;
			case 'R' :
				//search rook
				break;
			case 'P' :
				
				if(piece.color == 'W'){					
					if(piece.col != 0 && piece.row != 0){
						if(myTurn && this.isEnemyOwned(boardData, piece.row-1, piece.col-1, piece)){
							if(checker){
								if(checker.from.row == row-1 && checker.from.col == col-1){
									possibleMoves.push(constructMove({
										row : piece.row-1,
										col : piece.col-1
									}));			
								}
							}else{
								possibleMoves.push(constructMove({
									row : piece.row-1,
									col : piece.col-1
								}));	
							}
								
						}else if(!myTurn){
							possibleMoves.push(constructMove({
								row : piece.row-1,
								col : piece.col-1
							}));
						}
						
					}
					if(piece.col != 7 && piece.row != 0 ){
						if(myTurn && this.isEnemyOwned(boardData, piece.row-1, piece.col+1, piece)){
							if(checker){
								if(checker.from.row == piece.row-1 && checker.from.col == piece.from.col+1){
									possibleMoves.push(constructMove({
										row : piece.row-1,
										col : piece.col+1
									}));		
								}
							}else{
								possibleMoves.push(constructMove({
									row : piece.row-1,
									col : piece.col+1
								}));
							}
								
						}else if(!myTurn){
							possibleMoves.push(constructMove({
								row : piece.row-1,
								col : piece.col+1
							}));
						}
						
					}
					//search 2 space up
					if(piece.row != 0 && !this.isOccupied(boardData, piece.row - 1, piece.col)){
						possibleMoves.push(constructMove({
							row : piece.row - 1,
							col : piece.col
						}));
						if(piece.row == 6 && !this.isOccupied(boardData, piece.row - 2, piece.col)){
							possibleMoves.push(constructMove({
								row : piece.row - 2,
								col : piece.col
							}));
						}	
					}
				}else if(piece.color == 'B'){
					//search 2 space down
					if(piece.col != 0 && piece.row != 7 && this.isEnemyOwned(boardData, piece.row+1, piece.col-1, piece)){
						if(myTurn && this.isEnemyOwned(boardData, piece.row+1, piece.col-1, piece)){
							if(checker){
								if(checker.from.row == piece.row+1 && checker.from.col == piece.col-1){
									possibleMoves.push(constructMove({
										row : piece.row+1,
										col : piece.col-1
									}));
								}
							}else{
								possibleMoves.push(constructMove({
									row : piece.row+1,
									col : piece.col-1
								}));	
							}								
						}else if(!myTurn){
							possibleMoves.push(constructMove({
								row : piece.row+1,
								col : piece.col-1
							}));
						}
						
					}
					if(piece.col != 7 && piece.row != 7 ){
						if(myTurn && this.isEnemyOwned(boardData, piece.row+1, piece.col+1, piece)){
							if(checker){
								if(checker.from.row == piece.row+1 && checker.from.col == piece.col+1){
									possibleMoves.push(constructMove({
										row : piece.row+1,
										col : piece.col+1
									}));	
								}
							}else{
								possibleMoves.push(constructMove({
									row : piece.row+1,
									col : piece.col+1
								}));	
							}

						}else if(!myTurn){
							possibleMoves.push(constructMove({
								row : piece.row+1,
								col : piece.col+1
							}));
						}
						
					}
					if(piece.row != 7 && !this.isOccupied(boardData, piece.row+1, piece.col)){
						possibleMoves.push(constructMove({
							row : piece.row + 1,
							col : piece.col
						}));
						if(piece.row == 1 && !this.isOccupied(boardData, piece.row+2, piece.col)){
							possibleMoves.push(constructMove({
								row : piece.row + 2,
								col : piece.col
							}));
						}
					}
					
							//diagonal
				}

				break;
		}

		return possibleMoves;	
	}
}