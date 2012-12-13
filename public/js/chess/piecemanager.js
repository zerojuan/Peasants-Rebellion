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
			imgSrc = 'assets/white-piece.png';
		}else{
			imgSrc = 'assets/black-piece.png';
		}

		//spritesheet data
		this.spriteSheetData = {
				animations : {
					K_up_idle : {
						frames : [0],
						frequency: 2
					},
					K_up_awake : {
						frames : [1]
					},
					K_up_selected : {
						frames : [0, 1],
						frequency: 2	
					},
					K_down_idle : {
						frames : [2],
						frequency: 2,
					},
					K_down_awake : {
						frames : [3],
						frequency: 2,
					},
					K_down_selected : {
						frames : [2, 3],
						frequency: 2,
					},
					Q_up_idle : {
						frames : [4],
						frequency : 2
					},
					Q_up_awake : {
						frames : [5],
						frequency : 2
					},
					Q_up_selected : {
						frames : [4, 5],
						frequency : 2
					},
					Q_down_idle : {
						frames : [6],
						frequency : 2
					},
					Q_down_awake : {
						frames : [7],
						frequency : 2
					},
					Q_down_selected : {
						frames : [6, 7],
						frequency : 2
					},
					B_up_idle : {
						frames : [8],
						frequency : 2
					},
					B_up_awake : {
						frames : [9],
						frequency : 2
					},
					B_up_selected : {
						frames : [8, 9],
						frequency : 2
					},
					B_down_idle : {
						frames : [10],
						frequency : 2
					},
					B_down_awake : {
						frames : [11],
						frequency : 2
					},
					B_down_selected : {
						frames : [10, 11],
						frequency : 2
					},
					N_up_idle : {
						frames : [12],
						frequency : 2
					},
					N_up_awake : {
						frames : [13],
						frequency : 2
					},
					N_up_selected : {
						frames : [12, 13],
						frequency : 2
					},
					N_down_idle : {
						frames : [14],
						frequency : 2
					},
					N_down_awake : {
						frames : [15],
						frequency : 2
					},
					N_down_selected : {
						frames : [14, 15],
						frequency : 2
					},
					R_up_idle : {
						frames : [16],
						frequency : 2
					},
					R_up_awake : {
						frames : [17],
						frequency : 2
					},
					R_up_selected : {
						frames : [16, 17],
						frequency : 2
					},
					R_down_idle : {
						frames : [18],
						frequency : 2
					},
					R_down_awake : {
						frames : [19],
						frequency : 2
					},
					R_down_selected : {
						frames : [18, 19],
						frequency : 2
					},
					P_up_idle : {
						frames : [20],
						frequency : 2
					},
					P_up_awake : {
						frames : [21],
						frequency : 2
					},
					P_up_selected : {
						frames : [20, 21],
						frequency : 2
					},
					P_down_idle : {
						frames : [22],
						frequency : 2
					},
					P_down_awake : {
						frames : [23],
						frequency : 2
					},
					P_down_selected : {
						frames : [22, 23],
						frequency : 2
					}
				},
				frames : {
					width : 64, height: 64
				},
			images : [imgSrc]
		};		

		this.graphics = new createjs.Container();
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
			for(var i in this.pieces){
				var piece = this.pieces[i];
				piece.updateTurn(turn == this.color);
			}			
		}
	}

	return PieceManager;
});