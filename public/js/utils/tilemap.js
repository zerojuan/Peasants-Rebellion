define('Tilemap',[	
	'easel',
	'sound',
	'preload'
	], function(easel){
	var Tilemap  = function(opts){
		this.initialize(opts);
	}

	var p = Tilemap.prototype = new createjs.DisplayObject();

	//override the initialize function of DisplayObject
	p.DisplayObject_initialize = p.initialize;

	p.initialize = function(opts){
		this.DisplayObject_initialize();
		this.tileWidth = 64;
		if(opts.tileSheet){
			this.tileSheet = opts.tileSheet;
		}
		if(opts.map){
			this.map = opts.map;			
		}else{
			this.map = [
				[0, 1, 0, 1, 0, 1, 0, 1],
				[1, 0, 1, 0, 1, 0, 1, 0],
				[0, 1, 0, 1, 0, 1, 0, 1],
				[1, 0, 1, 0, 1, 0, 1, 0],
				[2, 3, 2, 3, 2, 3, 2, 3],
				[3, 2, 3, 2, 3, 2, 3, 2],
				[2, 3, 2, 3, 2, 3, 2, 3],
				[3, 2, 3, 2, 3, 2, 3, 2]
			];
		}		
	}

	//override the initialize function of DisplayObject
	p.DisplayObject_draw = p.draw;

	p.draw = function(ctx, ignoreCache){
		//this is where you draw				
		var img = this.tileSheet;		
		for(var x = 0; x < this.map.length; x++){
				for(var y = 0; y < this.map[x].length; y++){
					ctx.drawImage(img, this.map[x][y] * this.tileWidth, 0, this.tileWidth, this.tileWidth, 
						y * this.tileWidth, x * this.tileWidth, this.tileWidth, this.tileWidth );						
				}
		}

	
		return true;
	}

	return Tilemap;

});