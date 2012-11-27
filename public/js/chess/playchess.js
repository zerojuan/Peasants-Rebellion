define('PlayChess', [
	'jquery',
	'Tilemap',
	'easel',
	'preload'
	
], function($, Tilemap){
	var PlayChess;

	var assetManifest = [
		{src : 'assets/tileset.png', id: 'tileset'}
	];

	PlayChess = function(){
		console.log('Starting Chess game');
	};

	PlayChess.prototype = {
		initialize : function(canvas){
			var that = this;
			this.assets = [];

			this.canvas = canvas;
			this.stage = new createjs.Stage(canvas);

			this.loader = new createjs.PreloadJS();
			this.loader.useXHR = false;			
			this.loader.onFileLoad = function(evt){
				that.assets.push(evt);
			};
			this.loader.onComplete = function(evt){
				var tilemap; 

				for(var i = 0; i < that.assets.length; i++){
					var item = that.assets[i];
					var id = item.id;
					var result = item.result;

					if(item.type == createjs.PreloadJS.IMAGE){
						var bmp = new createjs.Bitmap(result);
					}

					switch(id){
						case 'tileset' : 
							/* INITIALIZE TILEMAP */
							tilemap = new Tilemap({tileSheet : result});
					}
				}

				that.stage.addChild(tilemap);

				createjs.Ticker.setFPS(40);
				createjs.Ticker.addListener(that);
			};

			this.loader.loadManifest(assetManifest);
		},
		tick : function(){
			this.stage.update();
		}
	}

	return PlayChess;
});