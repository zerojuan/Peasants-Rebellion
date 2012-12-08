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
					K_up : {
						frames : [0, 1],
						frequency: 2
					},
					K_down : {
						frames : [2, 3],
						frequency: 2,
					},
					Q_up : {
						frames : [4, 5],
						frequency : 2
					},
					Q_down : {
						frames : [6, 7],
						frequency : 2
					},
					B_up : {
						frames : [8, 9],
						frequency : 2
					},
					B_down : {
						frames : [10, 11],
						frequency : 2
					},
					N_up : {
						frames : [12, 13],
						frequency : 2
					},
					N_down : {
						frames : [14, 15],
						frequency : 2
					},
					R_up : {
						frames : [16, 17],
						frequency : 2
					},
					R_down : {
						frames : [18, 19],
						frequency : 2
					},
					P_up : {
						frames : [20, 21],
						frequency : 2
					},
					P_down : {
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
			if(piece)
				piece.move(to.row, to.col);
		},
		removePiece : function(from){
			var piece = this.findSelectedGamePiece(from.row, from.col);
			if(piece)
				piece.remove();
		}
	}

	return PieceManager;
});