define('PlayChess', [
	'jquery',
	'Tilemap',
	'ChessPiece',
	'PieceManager',
	'MovesLayer',
	'easel',
	'preload'
], function($, Tilemap, ChessPiece, PieceManager, MovesLayer){
	var PlayChess;

	var assetManifest = [
		{src : 'assets/tileset.png', id: 'tileset'},
		{src : 'assets/white-piece.png', id: 'white'},
		{src : 'assets/black-piece.png', id: 'black'}
	];

	PlayChess = function(color){
		console.log('Starting Chess game');
		this.color = color;
		this.activePiece = null;
	};

	PlayChess.prototype = {
		initialize : function(canvas, gameData){
			var that = this;

			this.gameData = gameData;
			this.assets = [];
			this.boardData = that.gameData.board;

			this.canvas = canvas;
			this.stage = new createjs.Stage(canvas);

			createjs.Touch.enable(this.stage);

			this.stage.onMouseUp = function(evt){
				that.handleInput(evt);
			}

			this.offset = {
				x : 20,
				y : 20
			}

			this.loader = new createjs.PreloadJS();
			this.loader.useXHR = false;			
			this.loader.onFileLoad = function(evt){
				that.assets.push(evt);
			};
			this.loader.onComplete = function(evt){
				var boardMap, dividerMap;
				var boardData = that.gameData.board; 

				for(var i = 0; i < that.assets.length; i++){
					var item = that.assets[i];
					var id = item.id;
					var result = item.result;

					if(item.type == createjs.PreloadJS.IMAGE){
						var bmp = new createjs.Bitmap(result);
					}

					switch(id){
						case 'black' :
							/*LOAD BLACK PIECES*/
							console.log('BLACK pieces loaded');
							that.blackPieceManager = new PieceManager({
								color : 'B',
								bitmap : result
							});
							//get all black pieces on board
							for(var row = 0; row < boardData.length; row++){
								for(var col = 0; col < boardData[row].length; col++){
									var blackPiece = that.extractPiece(boardData[row][col], 'B');
									if(blackPiece){
										//add piece to black piece manager
										that.blackPieceManager.addPiece(blackPiece, row, col);
									}
								}
							}
							break;
						case 'white' :
							/*LOAD WHITE PIECES*/
							console.log('WHITE pieces loaded');
							that.whitePieceManager = new PieceManager({
								color : 'W',
								bitmap : result
							});
							for(var row = 0; row < boardData.length; row++){
								for(var col = 0; col < boardData[row].length; col++){
									var whitePiece = that.extractPiece(boardData[row][col], 'W');
									if(whitePiece){
										//add piece to white piece manager
										that.whitePieceManager.addPiece(whitePiece, row, col);
									}
								}
							}
							break;
						case 'tileset' : 
							/* INITIALIZE TILEMAP */
							var map = [
								[0, 1, 0, 1, 0, 1, 0, 1],
								[1, 0, 1, 0, 1, 0, 1, 0],
								[0, 1, 0, 1, 0, 1, 0, 1],
								[1, 0, 1, 0, 1, 0, 1, 0],
								[2, 3, 2, 3, 2, 3, 2, 3],
								[3, 2, 3, 2, 3, 2, 3, 2],
								[2, 3, 2, 3, 2, 3, 2, 3],
								[3, 2, 3, 2, 3, 2, 3, 2]
							];
							var border = [
								[4, 4, 4, 4, 4, 4, 4, 4],
								[5, 5, 5, 5, 5, 5, 5, 5]
							];
							tileMap = new Tilemap({tileSheet : result, map : map});
							borderMap = new Tilemap({tileSheet : result, map : border});
							tileMap.y = that.offset.y;
							borderMap.y = 64 * 3 + that.offset.y;
					}
				}

				that.movesLayer = new MovesLayer();
				that.movesLayer.graphics.y = that.offset.y;

				that.stage.addChild(tileMap, that.movesLayer.graphics, borderMap, 
					that.whitePieceManager.graphics,
					that.blackPieceManager.graphics);

				createjs.Ticker.setFPS(40);
				createjs.Ticker.addListener(that);
			};

			this.loader.loadManifest(assetManifest);
		},
		handleInput : function(evt){
			var mouseX = this.stage.mouseX;
			var mouseY = this.stage.mouseY - this.offset.y;

			if(mouseX < 0 || mouseY < 0){
				console.log('Out of bounds');
				return;
			}

			if(mouseX > 64 * 8 || mouseY > 64 * 8){
				console.log('Out of bounds');
				return;
			}

			var col = Math.floor(mouseX / 64);
			var row = Math.floor(mouseY / 64);

			//find item that was selected in our array
			var piece;
			var pieceManager;
			if(this.color == 'W'){
				piece = this.whitePieceManager.findSelectedGamePiece(row, col);
			}else if(this.color == 'B'){
				piece = this.blackPieceManager.findSelectedGamePiece(row, col);
			}

			if(this.activePiece){
				if(piece){
					//check if different piece
					if(this.activePiece.col == piece.col && this.activePiece.row == piece.row){
						//the same piece, deactivate
						this.activatePiece(null);
					}else{
						console.log('Selected Piece: ' + piece.type);
						this.activatePiece(piece);
					}
				}else{
					//blank space/black space, check if this move is legal
					if(this.movesLayer.isPossibleMove(row, col)){
						//do move
						console.log('DO MOvE!');
					}else{
						//cancel
						this.activatePiece(null);
					}
				}
			}else{
				//make this as selected
				if(piece){
					console.log('Piece selected: ' + piece.type);
					this.activatePiece(piece);	
				}
				
			}
			
			console.log('Tapped: [' + row + ', ' + col +']');
		},
		activatePiece : function(piece){
			if(piece == null){
				console.log('Deactivating piece');
				this.activePiece.deactivate();
				this.movesLayer.deactivate();
			}else{
				console.log('Activating piece');
				piece.activate();
				this.movesLayer.setPossibleMoves(
						this.getPossibleMoves(piece)
					);
			}
			this.activePiece = piece;
		},
		extractPiece : function(tileData, color){
			if(tileData.charAt(0) == color){
				return tileData.charAt(1);
			}
			return null;
		},
		getPossibleMoves : function(piece){
			//TODO: Get all possible moves
			//Build board data
			var boardData = [
				['0', '0', '0', '0', '0', '0', '0', '0'],
				['0', '0', '0', '0', '0', '0', '0', '0'],
				['0', '0', '0', '0', '0', '0', '0', '0'],
				['0', '0', '0', '0', '0', '0', '0', '0'],
				['0', '0', '0', '0', '0', '0', '0', '0'],
				['0', '0', '0', '0', '0', '0', '0', '0'],
				['0', '0', '0', '0', '0', '0', '0', '0'],
				['0', '0', '0', '0', '0', '0', '0', '0'],
			];
			for(var i in this.blackPieceManager.pieces){
				var p1 = this.blackPieceManager.pieces[i];
				boardData[p1.row][p1.col] = 'B'+p1.type;
			}
			for(var i in this.whitePieceManager.pieces){
				var p1 = this.whitePieceManager.pieces[i];
				boardData[p1.row][p1.col] = 'W'+p1.type;
			}
			console.log(boardData);
			//SWITCH BY TYPE  
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
		canMoveHere : function(boardData, row, col, piece){
			return boardData[row][col].charAt(0) != piece.color;	
		},
		tick : function(){
			this.stage.update();
		}
	}

	return PlayChess;
});