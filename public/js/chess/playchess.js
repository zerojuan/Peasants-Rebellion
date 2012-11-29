define('PlayChess', [
	'jquery',
	'Tilemap',
	'ChessPiece',
	'PieceManager',
	'easel',
	'preload'
], function($, Tilemap, ChessPiece, PieceManager){
	var PlayChess;

	var assetManifest = [
		{src : 'assets/tileset.png', id: 'tileset'},
		{src : 'assets/white-piece.png', id: 'white'},
		{src : 'assets/black-piece.png', id: 'black'}
	];

	PlayChess = function(){
		console.log('Starting Chess game');
	};

	PlayChess.prototype = {
		initialize : function(canvas, gameData){
			var that = this;

			this.gameData = gameData;
			this.assets = [];

			this.canvas = canvas;
			this.stage = new createjs.Stage(canvas);

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

							borderMap.y = 64 * 3;
					}
				}

				that.stage.addChild(tileMap, borderMap, 
					that.whitePieceManager.graphics,
					that.blackPieceManager.graphics);

				createjs.Ticker.setFPS(40);
				createjs.Ticker.addListener(that);
			};

			this.loader.loadManifest(assetManifest);
		},
		extractPiece : function(tileData, color){
			if(tileData.charAt(0) == color){
				return tileData.charAt(1);
			}
			return null;
		},
		tick : function(){
			this.stage.update();
		}
	}

	return PlayChess;
});