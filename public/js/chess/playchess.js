define('PlayChess', [
	'jquery',
	'Tilemap',
	'ChessPiece',
	'PieceManager',
	'MovesLayer',
	'TouchMovesLayer',
	'easel',
	'preload'
], function($, Tilemap, ChessPiece, PieceManager, MovesLayer, TouchMovesLayer){
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
		dispatchTouchEvent : function(piece){
			for(var i in this.listeners){
				var listener = this.listeners[i];
				listener.onTouch(piece);
			}
		},
		setColor : function(team){
			this.color = team;
		},
		setTurn : function(turn){
			if(this.gameOver){
				return;
			}
			console.log('Changing turn from ' + this.turn + " to " + turn);
			this.turn = turn;
			this.whitePieceManager.updateTurn(turn);
			this.blackPieceManager.updateTurn(turn);
		},
		showGameOver : function(winner){
			this.gameOver = true;
			this.stage.onMouseUp = null;
			this.whitePieceManager.updateWinner(winner);
			this.blackPieceManager.updateWinner(winner);						
		},
		onTouch : function(touchData){
			if(this.touchMovesLayer){

				this.touchMovesLayer.onTouch(this.getBoardData(), touchData);
			}
				
		},
		initialize : function(canvas, gameData, onReady){
			var that = this;

			this.gameOver = false;

			this.gameData = gameData;
			this.assets = [];
			this.boardData = that.gameData.board;

			this.canvas = canvas;
			this.stage = new createjs.Stage(canvas);

			createjs.Touch.enable(this.stage);

			this.stage.onMouseUp = function(evt){
				that.handleInput(evt);
			}

			this.stage.onMouseDown = function(evt){
				that.handleMouseDown(evt);
			}

			this.offset = {
				x : 32,
				y : 32
			}

			var tileDownG = new createjs.Graphics();
			tileDownG.beginFill('#cc0');
			tileDownG.drawRect(0, 0, 64, 64);
			tileDownG.endFill();


			this.tileDown = new createjs.Shape(tileDownG);
			this.tileDown.alpha = 0;			

			this.loader = new createjs.PreloadJS();
			this.loader.useXHR = false;			
			this.loader.onFileLoad = function(evt){
				that.assets.push(evt);
			};
			this.loader.onComplete = function(evt){
				var boardMap, dividerMap;
				var boardData = that.gameData.board;
				that.piecesLayer = new createjs.Container(); 

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
								bitmap : result,
								container : that.piecesLayer
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
								bitmap : result,
								container : that.piecesLayer
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

				that.touchMovesLayer = new TouchMovesLayer();
				that.touchMovesLayer.graphics.x = that.offset.x;
				that.touchMovesLayer.graphics.y = that.offset.y;

				that.piecesLayer.x = that.offset.x;
				that.piecesLayer.y = that.offset.y - 20;				

				that.stage.addChild(tileMap, that.touchMovesLayer.graphics, that.movesLayer.graphics,
					that.tileDown, 
					that.piecesLayer);

				that.setTurn(that.turn);

				that.restackPieceLayers();

				createjs.Ticker.setFPS(40);
				createjs.Ticker.addListener(that);

				onReady();
			};

			this.loader.loadManifest(assetManifest);
		},
		handleMouseDown : function(evt){
			console.log("Handle Mousedown");
			var mouseX = evt.rawX - this.offset.x;
			var mouseY = evt.rawY - this.offset.y;
			console.log(evt);
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
			console.log(col, row);
			this.tileDown.x = col * 64 + this.offset.x;
			this.tileDown.y = row * 64 + this.offset.y;
			createjs.Tween.get(this.tileDown, {override: true}).to({alpha: .6}, 500);
		},
		handleInput : function(evt){
			console.log("Handling input");			
			var mouseX = evt.rawX - this.offset.x;
			var mouseY = evt.rawY - this.offset.y;
			console.log(evt);
			if(mouseX < 0 || mouseY < 0){
				console.log('Out of bounds');				
				return;
			}

			if(mouseX > 64 * 8 || mouseY > 64 * 8){
				console.log('Out of bounds');				
				return;
			}
			this.tileDown.alpha = .6;
			createjs.Tween.get(this.tileDown, {override: true}).to({alpha: 0}, 500);
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
				if(this.activePiece)
					this.activePiece.deactivate();
				this.movesLayer.deactivate();
			}else{				
				console.log('Activating piece');
				if(this.activePiece)
					this.activePiece.deactivate();
				piece.activate();
				this.dispatchTouchEvent(piece);
				//touch
				this.movesLayer.setPossibleMoves(piece,
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
		getBoardData : function(){
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
			return boardData;
		},
		getPossibleMoves : function(piece){
			var boardData = this.getBoardData();
			
			var possibleMoves = chessLogic.exports.getPossibleMoves(boardData, piece);

			return possibleMoves;
		},
		updatePiece : function(data){
			console.log('Updating Piece');
			if(data.color == 'B'){
				this.blackPieceManager.movePiece(data.from, data.to);
				this.whitePieceManager.removePiece(data.to);
			}else if(data.color == 'W'){
				this.whitePieceManager.movePiece(data.from, data.to);
				this.blackPieceManager.removePiece(data.to);
			}
			this.activatePiece(null);
			this.restackPieceLayers();
			this.setTurn(data.turn);
			this.movesLayer.deactivate();
		},
		restackPieceLayers : function(){
			var sortFunction = function(a, b){
				if(a.y < b.y){
					return -1;
				}else if(a.y > b.y){
					return 1;
				}
				return 0;
			}

			this.piecesLayer.sortChildren(sortFunction);
		},		
		tick : function(){
			this.stage.update();
		}
	}

	return PlayChess;
});