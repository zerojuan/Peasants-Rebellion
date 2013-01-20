define('PieceManager', [
	'ChessPiece'
], function(ChessPiece){
	var PieceManager;

	PieceManager = function(opts){
		this.color = opts.color;
		this.pieces = [];
		this.bitmap = opts.bitmap;

		var imgSrc;
		if(this.color == 'W'){
			this.spriteSheetData = {
				animations : {
					K_up_idle : {
						frames : [5]
					},
					K_up_awake : {
						frames : [2]
					},
					K_up_selected : {
						frames : [4, 3, 0, 1],
						frequency : 2
					},
					Q_up_idle : {
						frames : [11]
					},
					Q_up_awake : {
						frames : [8]
					},
					Q_up_selected : {
						frames : [10, 9, 6, 7],
						frequency : 2
					},
					P_up_idle : {
						frames : [23]
					},
					P_up_awake : {
						frames : [20]
					},
					P_up_selected : {
						frames : [22, 19, 18, 21],
						frequency : 2
					},
					P_up_promote : {
						frames : [20, 8, 20, 8, 20, 8, 20, 8],
						frequency : 4,
						next : "Q_up_awake"
					},
					Q_up_promote : {
						frames : [20, 8, 20, 8, 20, 8, 20, 8],
						frequency : 4,
						next : "Q_up_awake"
					}
				},
				frames : {
					width : 56, height: 76
				},
				images : ['assets/white-piece.png']				
			};
			//imgSrc = 'assets/white-piece.png';
		}else{
			this.spriteSheetData = {
				animations : {
					K_up_idle : {
						frames : [0]
					},
					K_up_awake : {
						frames : [3]
					},
					K_up_selected : {
						frames : [5, 4, 1, 2],
						frequency : 2
					},
					Q_up_idle : {
						frames : [11]
					},
					Q_up_awake : {
						frames : [8]
					},
					Q_up_selected : {
						frames : [10, 9, 6, 7],
						frequency : 2
					},
					N_up_idle : {
						frames : [12]
					},
					N_up_awake : {
						frames : [14]
					},
					N_up_selected : {
						frames : [16, 15, 17, 13],
						frequency : 2
					},
					P_up_idle : {
						frames : [21]
					},
					P_up_awake : {
						frames : [18]
					},
					P_up_selected : {						
						frames : [19, 20, 23, 22],
						frequency : 2
					},
					P_up_promote : {
						frames : [18, 8, 18, 8, 18, 8, 18, 8],
						frequency : 4,
						next : "Q_up_awake"
					},
					Q_up_promote : {
						frames : [18, 8, 18, 8, 18, 8, 18, 8],
						frequency : 4,
						next : "Q_up_awake"
					}
				},
				frames : {
					width : 56, height: 76
				},
				images : ['assets/black-piece.png']				
			};
			imgSrc = 'assets/black-piece.png';
		}

		this.graphics = opts.container;
	};

	PieceManager.prototype = {
		initialize : function(){

		},
		addPiece : function(type, row, col){
			var ss = new createjs.SpriteSheet(this.spriteSheetData);
			var piece = new ChessPiece({
				type : type,
				row : row,
				col : col,
				color : this.color,
				spriteSheet : ss
			});

			this.graphics.addChild(piece.graphics);
			this.pieces.push(piece);
		},
		findSelectedGamePiece : function(row, col){
			for(var i in this.pieces){
				var piece = this.pieces[i];
				if(piece.row == row && piece.col == col){
					return piece;
				}
			}
			return null;
		},
		movePiece : function(from, to){
			var piece = this.findSelectedGamePiece(from.row, from.col);
			if(piece){
				console.log('Piece moved');
				piece.move(to.row, to.col);
			}else{
				console.log('Piece not found');
			}
				
		},
		removePiece : function(from){
			var piece = this.findSelectedGamePiece(from.row, from.col);
			if(piece)
				piece.remove();
		},
		updateTurn : function(turn){
			console.log("My Turn: " + turn + " " + this.color);
			for(var i in this.pieces){
				var piece = this.pieces[i];

				piece.updateTurn(turn == this.color);
			}			
		},
		updateWinner : function(winner){
			console.log("Result: " + winner + " " + this.color);
			for(var i in this.pieces){
				var piece = this.pieces[i];

				piece.updateWinner(winner);
			}	
		}
	}

	return PieceManager;
});