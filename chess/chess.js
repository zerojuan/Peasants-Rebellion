module.exports = {
	isValidMove : function(board, type, from, to, color){		
		var endGame = this.endGameCheck(board, type, from, to, color);
		var allPossibleMoves = endGame.allPossibleMoves;

		

		for(var i in allPossibleMoves){
			var move = allPossibleMoves[i];			
			if(this._moveEqual(move, { type : type, from : from, to : to, color : color})){				
				//move was possible, check if it results to an open check
				var nextBoard = [];
				for(var k = 0; k < board.length; k++){
					nextBoard[k] = [];
					for(var j = 0; j < board[k].length; j++){
						nextBoard[k][j] = board[k][j];
					}
				}
				nextBoard[from.row][from.col] = '0';
				nextBoard[to.row][to.col] = color+''+type;
				var enemyMoves = this._getAllPossibleMoves(nextBoard, (color == 'W' ? 'B' : 'W'), false);
				var checkers = this.getChecker(nextBoard, enemyMoves, color);
				if(checkers){
					return false;
				}
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
			staleMate : staleMate,
			checkers : checkers
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
	_willCaptureChecker : function(checker, move){
		if(checker.from.row == move.row && checker.from.col == move.col){
			return true;
		}
		return false;
	},
	_willBlockChecker : function(checker, move){
		//check if it's a Q, R, B
		if(checker.type == 'Q' || 
			checker.type == 'R' ||
			checker.type == 'B'){
			
			//check for ray blocks
			var x3 = move.col,
				y3 = move.row,
				x1 = checker.from.col,
				y1 = checker.from.row,
				x2 = checker.to.col,
				y2 = checker.to.row;

			var slopeA = (x3 - x1) * (y2 - y1);
			var slopeB = (y3 - y1) * (x2 - x1);
			if(slopeA == slopeB){
				return true;
			}
		}
		return false;
	},
	_testMove : function(board, move){
		board[move.from.row][move.from.col] = '0';
		board[move.to.row][move.to.col] = move.color+''+move.type;

		return board;
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
	_nextTile : function(boardData, currPos, direction){
		var nextPos = {
			row : currPos.row + direction.row,
			col : currPos.col + direction.col
		};

		if(nextPos.row >= 0 && nextPos.row < 8 &&
			nextPos.col >= 0 && nextPos.col < 8){
			var data = boardData[nextPos.row][nextPos.col];
			return {
				data : data,
				row : nextPos.row,
				col : nextPos.col 
			};
		}else{
			return null;
		}
	},
	_castRay : function(boardData, direction, piece, myTurn, enemyMoves, moveConstructor, checker){
		var currPos = this._nextTile(boardData, piece, direction);
		var possibleMoves = [];
		var rayHit = false;
		while(currPos){		
			if(checker){ //if checked
				//this move captures or blocks?
				if(boardData[currPos.row][currPos.col] != piece.color+'K'){
					if(this._willBlockChecker(checker, currPos) || this._willCaptureChecker(checker, currPos)){
						possibleMoves.push(moveConstructor({
							row : currPos.row,
							col : currPos.col
						}));			
					} 
				}				
			}else{
				if(currPos.data == '0'){
					possibleMoves.push(moveConstructor({
						row : currPos.row,
						col : currPos.col
					}));
				}else{
					rayHit = true;
					var color = boardData[currPos.row][currPos.col].charAt(0);
					if(color != piece.color || !myTurn){
						possibleMoves.push(moveConstructor({
							row : currPos.row,
							col : currPos.col
						}));
					}
					break;
				}
				
			}			
			//get next position
			currPos = this._nextTile(boardData, currPos, direction);
		}

		return possibleMoves;
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
				var rayNE = this._castRay(boardData, { row: -1, col: 1}, piece, myTurn, enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, rayNE);
				var rayNW= this._castRay(boardData, { row: -1, col: -1}, piece, myTurn,
					enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, rayNW);
				var raySE = this._castRay(boardData, {row : 1, col: 1}, piece, myTurn,
					enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, raySE);
				var raySW = this._castRay(boardData, {row: 1, col: -1}, piece, myTurn,
					enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, raySW);
				//search rook
				var rayEast = this._castRay(boardData, {row: 0, col: 1}, piece, myTurn, enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, rayEast);
				var rayWest = this._castRay(boardData, {row: 0, col: -1}, piece, myTurn,
					enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, rayWest);
				var rayNorth = this._castRay(boardData, {row: -1, col: 0}, piece, myTurn,
					enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, rayNorth);
				var raySouth = this._castRay(boardData, {row: 1, col: 0}, piece, myTurn,
					enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, raySouth);
				break;
			case 'B' :
				//search diagonally
				var rayNE = this._castRay(boardData, { row: -1, col: 1}, piece, myTurn, enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, rayNE);
				var rayNW= this._castRay(boardData, { row: -1, col: -1}, piece, myTurn,
					enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, rayNW);
				var raySE = this._castRay(boardData, {row : 1, col: 1}, piece, myTurn,
					enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, raySE);
				var raySW = this._castRay(boardData, {row: 1, col: -1}, piece, myTurn,
					enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, raySW);
				break;
			case 'R' :
				//search rook
				var rayEast = this._castRay(boardData, {row: 0, col: 1}, piece, myTurn, enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, rayEast);
				var rayWest = this._castRay(boardData, {row: 0, col: -1}, piece, myTurn,
					enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, rayWest);
				var rayNorth = this._castRay(boardData, {row: -1, col: 0}, piece, myTurn,
					enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, rayNorth);
				var raySouth = this._castRay(boardData, {row: 1, col: 0}, piece, myTurn,
					enemyMoves, constructMove, checker);
				possibleMoves.push.apply(possibleMoves, raySouth);
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
			case 'P' :
				
				if(piece.color == 'W'){					
					if(piece.col != 0 && piece.row != 0){
						if(myTurn && this.isEnemyOwned(boardData, piece.row-1, piece.col-1, piece)){
							if(checker){
								//only push as valid, if this move will capture the checker
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
						if(checker){
							if(this._willBlockChecker(checker, {row : piece.row - 1, col: piece.col})){
								possibleMoves.push(constructMove({
									row : piece.row - 1,
									col : piece.col
								}));	
							}
						}else{
							possibleMoves.push(constructMove({
								row : piece.row - 1,
								col : piece.col
							}));
						} 						
						if(piece.row == 6 && !this.isOccupied(boardData, piece.row - 2, piece.col)){
							if(checker){
								if(this._willBlockChecker(checker, {row : piece.row - 2, col : piece.col})){
									possibleMoves.push(constructMove({
										row : piece.row - 2,
										col : piece.col
									}));
								}
							}else{
								possibleMoves.push(constructMove({
									row : piece.row - 2,
									col : piece.col
								}));	
							}							
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
						if(checker){
							if(this._willBlockChecker(checker, {row : piece.row+1, col: piece.col})){
								possibleMoves.push(constructMove({
									row : piece.row + 1,
									col : piece.col
								})); 	
							}								
						}else{
							possibleMoves.push(constructMove({
									row : piece.row + 1,
									col : piece.col
								}));
						}						
						if(piece.row == 1 && !this.isOccupied(boardData, piece.row+2, piece.col)){
							if(checker){
								if(this._willBlockChecker(checker, {row : piece.row + 2, col: piece.col})){
									possibleMoves.push(constructMove({
										row : piece.row + 2,
										col : piece.col
									}));
								}
							}else{
								possibleMoves.push(constructMove({
										row : piece.row + 2,
										col : piece.col
									}));
							}						
						}
					}
					
				}

				break;
		}

		return possibleMoves;	
	}
}