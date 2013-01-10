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

	PlayChess = function(opts){
		console.log('Starting Chess game');
		this.color = opts.color;
		this.turn = opts.turn;
		this.listeners = [];
		this.activePiece = null;
	};

	PlayChess.prototype = {
		addMoveListener : function(listener){
			this.listeners.push(listener);
		},
		dispatchMoveEvent : function(piece, move_to){
			for(var i in this.listeners){
				var listener = this.listeners[i];
				listener.onMove(piece, move_to);
			}
		},
		setTurn : function(turn){
			this.turn = turn;
			this.whitePieceManager.updateTurn(turn);
			this.blackPieceManager.updateTurn(turn);
		},
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
				x : 32,
				y : 32
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
								[0, 1, 0, 1, 0, 1, 0, 1],
								[1, 0, 1, 0, 1, 0, 1, 0],
								[0, 1, 0, 1, 0, 1, 0, 1],
								[1, 0, 1, 0, 1, 0, 1, 0]
							];
							var border = [
								[4, 4, 4, 4, 4, 4, 4, 4],
								[5, 5, 5, 5, 5, 5, 5, 5]
							];
							tileMap = new Tilemap({tileSheet : result, map : map});
							borderMap = new Tilemap({tileSheet : result, map : border});
							tileMap.y = that.offset.y;
							tileMap.x = that.offset.x;
							borderMap.y = 64 * 3 + that.offset.y;
					}
				}

				that.movesLayer = new MovesLayer();
				that.movesLayer.graphics.y = that.offset.y;
				that.movesLayer.graphics.x = that.offset.x;

				that.whitePieceManager.graphics.x = that.offset.x;
				that.whitePieceManager.graphics.y = that.offset.y - 20;
				that.blackPieceManager.graphics.x = that.offset.x;
				that.blackPieceManager.graphics.y = that.offset.y - 20;

				that.stage.addChild(tileMap, that.movesLayer.graphics, 
					that.whitePieceManager.graphics,
					that.blackPieceManager.graphics);

				that.setTurn(that.turn);

				createjs.Ticker.setFPS(40);
				createjs.Ticker.addListener(that);
			};

			this.loader.loadManifest(assetManifest);
		},
		handleInput : function(evt){
			var mouseX = this.stage.mouseX - this.offset.x;
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

			if(this.color == this.turn){
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
							this.dispatchMoveEvent(this.activePiece, {
								row : row,
								col : col
							});
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
			}else{
				console.log('Its not your turn');
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
				if(this.activePiece)
					this.activePiece.deactivate();
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
				if(p1.alive){
					boardData[p1.row][p1.col] = 'B'+p1.type;	
				}
				
			}
			for(var i in this.whitePieceManager.pieces){
				var p1 = this.whitePieceManager.pieces[i];
				if(p1.alive){
					boardData[p1.row][p1.col] = 'W'+p1.type;	
				}
			}
			
			var possibleMoves = chessLogic.exports.getPossibleMoves(boardData, piece);

			return possibleMoves;
		},
		updatePiece : function(data){
			if(data.color == 'B'){
				this.blackPieceManager.movePiece(data.from, data.to);
				this.whitePieceManager.removePiece(data.to);
			}else if(data.color == 'W'){
				this.whitePieceManager.movePiece(data.from, data.to);
				this.blackPieceManager.removePiece(data.to);
			}
			this.setTurn(data.turn);
			this.movesLayer.deactivate();
		},
		tick : function(){
			this.stage.update();
		}
	}

	return PlayChess;
});