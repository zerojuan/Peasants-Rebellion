define('MovesHistory',[
	'ChessPiece',
	'easel',
	'tween'
], function(ChessPiece){
	var MovesHistory;

	MovesHistory = function(){
		this.graphics = new createjs.Container();

		this.whiteSpriteSheetData = {
				animations : {					
					K_up_awake : {
						frames : [2]
					},
					K_up_selected : {
						frames : [4, 3, 0, 1],
						frequency : 2
					},					
					Q_up_awake : {
						frames : [8]
					},
					Q_up_selected : {
						frames : [10, 9, 6, 7],
						frequency : 2
					},					
					P_up_awake : {
						frames : [20]
					},
					P_up_selected : {
						frames : [22, 19, 18, 21],
						frequency : 2
					},					
				},
				frames : {
					width : 56, height: 76
				},
				images : ['assets/white-piece.png']				
			};			
		this.blackSpriteSheetData = {
				animations : {					
					K_up_awake : {
						frames : [3]
					},
					K_up_selected : {
						frames : [5, 4, 1, 2],
						frequency : 2
					},					
					Q_up_awake : {
						frames : [8]
					},
					Q_up_selected : {
						frames : [10, 9, 6, 7],
						frequency : 2
					},					
					N_up_awake : {
						frames : [14]
					},
					N_up_selected : {
						frames : [16, 15, 17, 13],
						frequency : 2
					},					
					P_up_awake : {
						frames : [18]
					},
					P_up_selected : {						
						frames : [19, 20, 23, 22],
						frequency : 2
					}					
				},
				frames : {
					width : 56, height: 76
				},
				images : ['assets/black-piece.png']				
			};
		var greenG = new createjs.Graphics();
			greenG.beginFill('#0c0');
			greenG.drawRect(0, 0, 64, 64);
			greenG.endFill();
		this.checkerStart = new createjs.Shape(greenG);
		this.checkerStart.alpha = 0;
		this.checkerEnd = new createjs.Shape(greenG);
		this.checkerEnd.alpha = 0;					
	}

	MovesHistory.prototype = {
		_addPiece : function(piece, from, isMove, to){
			var color = piece.charAt(0);
			var ss = null;
			if(color == 'B'){
				ss = new createjs.SpriteSheet(this.blackSpriteSheetData);	
			}else{
				ss = new createjs.SpriteSheet(this.whiteSpriteSheetData);	
			}
			
			var piece = new ChessPiece({
				type : piece.charAt(1),
				row : from.row,
				col : from.col,
				color : piece.charAt(0),
				spriteSheet : ss
			});
			
			if(isMove){
				piece.activate();
				createjs.Tween.get(piece.graphics, {override: true, loop: true}).to({x: to.col * 64, y: to.row * 64}, 500).wait(500);
				this.checkerStart.alpha = .5;
				this.checkerStart.x = from.col * 64;
				this.checkerStart.y = from.row * 64 + 20;
				this.checkerEnd.alpha = .5;
				this.checkerEnd.x = to.col * 64;
				this.checkerEnd.y = to.row * 64 + 20;
				this.graphics.addChild(this.checkerStart);
				this.graphics.addChild(this.checkerEnd);
			}else{
				piece.deactivate();			
			}			
			this.graphics.addChild(piece.graphics);	
			piece.alpha = .5;
		},
		_createBoard : function(board, active, to){
			var isMove = false;
			this.checkerStart.alpha = 0;
			this.checkerEnd.alpha = 0;
			for(var row = 0; row < board.length; row++){
				for(var col = 0; col < board[row].length; col++){
					isMove = (col == active.col && row == active.row);
					var piece = board[row][col];
					if(piece != '0'){
						this._addPiece(piece, {row: row, col: col}, isMove, to);
					}
				}
			}
			this.graphics.alpha = .5;
		},
		hideMove : function(){
			this.graphics.removeAllChildren();
		},
		showMove : function(id, moves, board){	
			this.graphics.removeAllChildren();		
			for(var i = moves.length-1; i >= 0; i--){
				var move = moves[i];
				var pieceTo = board[move.to.row][move.to.col];
				if(move.moveType == 'promote'){
					pieceTo = pieceTo.charAt(0)+'P';
				}
				if(move.moveType == 'capture'){
					board[move.to.row][move.to.col] = move.captured;
				}else{
					board[move.to.row][move.to.col] = '0';
				}
				board[move.from.row][move.from.col] = pieceTo;
				if(move._id == id){										
					//create board graphics
					console.log("Move Found: ", move);
					this._createBoard(board, move.from, move.to);
					break;
				}
			}
		}
	}

	return MovesHistory;
});