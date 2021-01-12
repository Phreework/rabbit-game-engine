rabbit = {
	canvas: null,
	context: null,
	images: {},
	audio: {},
	world: null,
	mouse: {x: undefined, y: undefined, pressed: false},
	offset: [0, 0],
	fps: 60,
	audioChannels: [],
	keysPressed: [],
	maxFrameTime: 0.030,
}

rabbit.init = function(canvas_id) {
	canvas = document.getElementById(canvas_id) ;
	this.canvas = canvas ;
	this.context = canvas.getContext('2d'); 
	this.world = new rabbit.World() ;
	this.canvas.onmousedown = rabbit._canvasMouseDown ;
	document.onkeydown = rabbit.keyDown ;
	document.onkeyup = rabbit.keyUp ;
	this.canvas.onmousemove = rabbit.mouseMove ;
	this.canvas.onmouseout = rabbit.mouseOut ;

	if (document.defaultView && document.defaultView.getComputedStyle) {
		var paddingLeft = +(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'])      || 0 ;
		var paddingTop  = +(document.defaultView.getComputedStyle(canvas, null)['paddingTop'])       || 0 ;
		var borderLeft  = +(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'])  || 0 ;
		var borderTop   = +(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'])   || 0 ;
		rabbit.offset = [paddingLeft + borderLeft, paddingTop + borderTop] ;
	}

	rabbit.canvas.width = rabbit.canvas.clientWidth ;
	rabbit.canvas.height = rabbit.canvas.clientHeight ;

	this.camera = {x:0, y:0} ;
} ;

rabbit.imageError = function(url) {
	alert("Could not load " + url + ".") ;
} ;

rabbit.loadImage = function(url) {
	if(url in this.images)
		return this.images[url] ;
	var i = new Image() ;
	i.src = url ;
	i.onload = function() { i.valid = true ; }
	i.onerror = function() { i.valid = false ; rabbit.imageError(i.src) ; } ;
	this.images[url] = i ;
	return i ;
} ;

rabbit.loadAudio = function(url) {
	var channel = null ;
	for(var a = 0; a < this.audioChannels.length; ++a) {
		channel = this.audioChannels[a] ;
		if(channel.ended) {
			channel.pause() ;
			channel.currentTime = 0 ;
			channel.src = url ;
			return channel ;
		}
	}
	channel = new Audio(url) ;
	this.audioChannels.push(channel) ;
	return channel ;
} ;

rabbit._mousePosition = function(e) {
	var ox = 0 ;
	var oy = 0 ;
	var element = rabbit.canvas ;
	if (element.offsetParent) {
		do {
			ox += element.offsetLeft;
			oy += element.offsetTop;
		} while ((element = element.parent)) ;
	}
	var mp = [e.pageX - ox + rabbit.offset[0], e.pageY - oy + rabbit.offset[1]] ;
	return mp ;
} ;

rabbit._canvasMouseDown = function(event) {
	event.preventDefault() ;
	rabbit.mouseDown() ;
} ;

rabbit.keyDown = function(event) {
	if(!rabbit.keysPressed[event.keyCode]) {
		rabbit.keysPressed[event.keyCode] = true ;
		rabbit.world.keyDown(event.keyCode) ;
	}
} ;

rabbit.keyUp = function(event) {
	rabbit.keysPressed[event.keyCode] = false ;
	rabbit.world.keyUp(event.keyCode) ;
} ;

rabbit.mouseDown = function() {
	rabbit.world.mouseDown() ;
	rabbit.mouse.pressed = true ;
} ;

rabbit.mouseMove = function(event) {
	var mousePos = rabbit._mousePosition(event) ;
	rabbit.mouse.x = mousePos[0] ;
	rabbit.mouse.y = mousePos[1] ;
} ;

rabbit.mouseOut = function(event) {
	rabbit.mouse.x = undefined ;
	rabbit.mouse.y = undefined ;
};

rabbit.playSfx = function(url) {
	new rabbit.Sfx(url).play() ;
};

rabbit.run = function() {
	var dtime = 1000 / rabbit.fps ;
	rabbit.time = Date.now() ;
	setInterval(rabbit.update, dtime) ;
} ;

rabbit.setBackground = function(url) {
	rabbit.canvas.style.backgroundImage = 'url(' + url + ')' ;
	rabbit.context.clearRect(0, 0, rabbit.canvas.width, rabbit.canvas.height) ;
} ;

rabbit.setWorld = function(world) {
	rabbit._nextWorld = world;
};

rabbit.update = function() {
	var dtime = (Date.now() - rabbit.time) / 1000 ;
	if(dtime > rabbit.maxFrameTime)
		dtime = rabbit.maxFrameTime;
	rabbit.time = Date.now();
	rabbit.world.update(dtime);
	rabbit.context.clearRect(0, 0, rabbit.canvas.width, rabbit.canvas.height);
	rabbit.world.draw();
	rabbit.mouse.pressed = false;
	if(rabbit._nextWorld) {
		rabbit.world = rabbit._nextWorld;
		rabbit._nextWorld = null;
	}
};

rabbit.Object = function() {
	this.clone = function() {
		var f = function() {} ;
		f.prototype = this ;
		var o = new f() ;
		return o ;
	} ;

	this.extend = function(data) {
		var o = this.clone() ;
		for(var k in data) {
			o[k] = data[k] ;
		}
		return o ;
	} ;
} ;

rabbit.Collision = function(other, rect) {
	this.other = other;
	this.rect = rect;
} ;

rabbit.World = function() {
	rabbit.Object.apply(this) ;

	this.entities = [] ;
	this.removed = [] ;
	this.maxID = 0 ;

	this.add = function(e) {
		this.entities.push(e) ;
		e.id = this.maxID++ ;
		e.world = this ;
		e.added() ;
	} ;

	this.draw = function() {
		this.entities.sort(function(lhs, rhs) {
			if(!lhs.graphic)
				return -1 ;
			if(!rhs.graphic)
				return 1 ;
			if(lhs.graphic.z == rhs.graphic.z)
				return lhs.id - rhs.id ;
			return lhs.graphic.z - rhs.graphic.z ;
		}) ;
		for(var e = 0 ; e < this.entities.length; ++e) {
			this.entities[e].draw() ;
		}
	} ;

	this.filter = function(f) {
		var l = [] ;
		for(var e = 0; e < this.entities.length; ++e) {
			if(f(this.entities[e])) {
				l.push(this.entities[e]) ;
			}
		}
		return l ;
	} ;

	this.getType = function(type) {
		return this.filter(function(e) { return e.type == type ; }) ;
	} ;

	this.keyDown = function(key) {
		for(var e = this.entities.length-1; e >= 0; --e) {
			if(this.entities[e].keyDown(key))
				return ;
		}
	} ;

	this.keyUp = function(key) {
		for(var e = this.entities.length-1; e >= 0; --e) {
			if(this.entities[e].keyUp(key))
				return ;
		}
	} ;

	this.mouseDown = function() {
		for(var e = this.entities.length-1; e >= 0; --e) {
			if(this.entities[e].mouseDown())
				return ;
		}
	} ;

	this.remove = function(e) {
		e.removed() ;
		this.removed.push(e) ;
	} ;

	this._update = function(dtime) {
		for(var e = 0; e < this.entities.length; ++e) {
			if(this.entities[e].graphic)
				this.entities[e].graphic.update(dtime) ;
			this.entities[e].update(dtime) ;
		}
		for(var r = 0; r < this.removed.length; ++r) {
			for(var e = 0; e < this.entities.length; ++e) {
				if(this.entities[e] == this.removed[r])
					this.entities.splice(e, 1) ;
			}
		}
		this.removed = [] ;
	} ;

	this.update = function(dtime) { this._update(dtime) ; } ;

	this.collide = function(rect)  {

		var collisions = Array();

		for (var i = 0; i < this.entities.length; i++)
		{
			var e = this.entities[i];
			if (e.graphic == null)
				continue;
			var entRect = new rabbit.Rect(e.graphic.x,e.graphic.y,e.graphic.w,e.graphic.h);
			if (rect.collideRect(entRect))
				collisions.push(new rabbit.Collision(e,entRect));
		}

		return collisions;
	} ;
}

rabbit.Entity = function() {
	rabbit.Object.apply(this) ;

	this.graphic = null ;
	this.type = "entity" ;

	this.world = null ;

	this.added = function() {} ;

	this.collide = function(rect) {
		return false ;
	} ;

	this.draw = function() {
		if(this.graphic && this.graphic.visible != false)
			this.graphic.draw() ;
	} ;

	this.keyDown = function(key) {} ;

	this.keyUp = function(key) {} ;

	this.mouseDown = function() {} ;

	this.removed = function() {} ;

	this.update = function(dtime) {} ;
}

rabbit.Graphic = function() {
	this.x = 0 ;
	this.y = 0 ;
	this.z = 0 ;
	this.visible = true;

	this.draw = function() {} ;

	this.update = function(dtime) {} ;
} ;

rabbit.Rect = function(x, y, w, h) {
	rabbit.Object.apply(this) ;
	this.x = x ;
	this.y = y ;
	this.w = w ;
	this.h = h ;

	this.bottom = function() { return this.y + this.h ; } ;

	this.collidePoint = function(point) {
		return (
			point[0] >= this.x &&
			point[0] <  this.x + this.w &&
			point[1] >= this.y &&
			point[1] <  this.y + this.h
		) ;
	} ;

	this.collideRect = function(rect) {
		if(this.x > rect.x + rect.w)
			return false ;
		if(rect.x > this.x + this.w)
			return false ;
		if(this.y > rect.y + rect.h)
			return false ;
		if(rect.y > this.y + this.h)
			return false ;
		return true ;
	} ;
	
	this.intersects = function(rect) {
		return this.collideRect(rect);
	};

	this.left = function() { return this.x ; } ;

	this.place = function(pos) {
		this.x = pos[0] ;
		this.y = pos[1] ;
	} ;

	this.right = function() { return this.x + this.w ; } ;

	this.top = function() { return this.y ; } ;
}

rabbit.Circle = function(x, y, radius) {
	rabbit.Object.apply(this) ;

	this.x = x ;
	this.y = y ;
	this.radius = radius ;

	this.collideCircle = function(circle) {
		var dx = this.x - circle.x ;
		var dy = this.y - circle.y ;
		var sqDistance = dx*dx + dy*dy ;

		var r = this.radius + circle.radius ;
		var collide = (sqDistance <= r*r) ;
		return collide ;
	} ;

	this.collidePoint = function(point) {
		var d = [point[0] - this.x, point[1] - this.y] ;
		return (d[0]*d[0] + d[1]*d[1] <= this.radius*this.radius) ;
	} ;

	this.place = function(pos) {
		this.x = pos[0] ;
		this.y = pos[1] ;
	} ;
} ;

rabbit.Graphiclist = function(graphics) {
	rabbit.Graphic.apply(this) ;

	this.graphics = graphics || [] ;

	this.draw = function() {
		rabbit.context.save() ;
		rabbit.context.translate(this.x, this.y) ;
		for(var g = 0; g < this.graphics.length; ++g) {
			this.graphics[g].draw() ;
		}
		rabbit.context.restore() ;
	};

	this.pop = function() {
		this.graphics.pop() ;
	};

	this.push = function(graphic) {
		this.graphics.push(graphic) ;
	};
	
	this.move = function(dx, dy) {
		this.x += dx;
		this.y += dy;
		for(i=0;i<this.graphics.length;++i) {
			this.graphics[i].x += dx;
			this.graphics[i].y += dy;
		}
	};
	
	this.place = function(pos) {
		var dx = pos[0]-this.x;
		var dy = pos[1]-this.y;
		this.move(dx, dy);
	};

	this.remove = function(graphic) {
		for(var g = 0; g < this.graphics.length; ++g) {
			if(this.graphics[g] == graphic)
				this.graphics.slice(g) ;
		}
	};

	this.shift = function() {
		this.graphics.shift() ;
	};

	this.unshift = function(graphic) {
		this.graphics.unshift(graphic) ;
	};

	this.update = function(dtime) {
		for(var g = 0; g < this.graphics.length; ++g) {
			this.graphics[g].update(dtime) ;
		}
	};
};

rabbit.Canvas = function(x, y, w, h) {
	rabbit.Graphic.apply(this) ;

	this.x = x ;
	this.y = y ;
	this.w = w ;
	this.h = h  ;
	this.alpha = 1 ;

	this.canvas = document.createElement('canvas') ;
	this.canvas.width = w ;
	this.canvas.height = h ;
	this.context = this.canvas.getContext('2d') ;

	this.draw = function() {
		rabbit.context.save() ;
		rabbit.context.globalAlpha = this.alpha ;

		if(this.ignoreCamera)
			rabbit.context.translate(Math.floor(this.x), Math.floor(this.y)) ;
		else
			rabbit.context.translate(Math.floor(this.x + rabbit.camera.x), Math.floor(this.y + rabbit.camera.y)) ;

		rabbit.context.drawImage(this.canvas, 0, 0) ;
		rabbit.context.restore() ;
	};

	this.update = function(dtime) {
		rabbit.context.clearRect(Math.floor(this.x - 1), Math.floor(this.y - 1), Math.floor(this.width + 1), Math.floor(this.height + 1)) ;
	}
} ;

rabbit.Canvas.createRect = function(x, y, w, h, colour) {
	var c = new rabbit.Canvas(x, y, w, h) ;
	c.context.fillStyle = colour ;
	c.context.fillRect(0, 0, w, h) ;
	return c ;
};

rabbit.Image = function(x, y, image) {
	rabbit.Graphic.apply(this) ;

	this._x = x ;
	this._y = y ;
	this.x = x ;
	this.y = y ;
	this.alpha = 1 ;

	if(!image)
		throw 'Image not specified.' ;

	this.image = rabbit.loadImage(image) ;

	this.draw = function() {
		if(!this.image.valid) return ;

		rabbit.context.save() ;
		rabbit.context.globalAlpha = this.alpha ;
		if(this.ignoreCamera)
			rabbit.context.translate(Math.floor(this._x), Math.floor(this._y)) ;
		else
			rabbit.context.translate(Math.floor(this._x + rabbit.camera.x), Math.floor(this._y + rabbit.camera.y)) ;
		rabbit.context.drawImage(this.image, 0, 0) ;
		rabbit.context.globalAlpha = 1 ;
		rabbit.context.restore() ;
	};

	this.place = function(pos) {
		this.x = pos[0] ;
		this.y = pos[1] ;
	};

	this.update = function(dtime) {
		rabbit.context.save() ;
		if(this.ignoreCamera)
			rabbit.context.translate(Math.floor(this._x), Math.floor(this._y)) ;
		else
			rabbit.context.translate(Math.floor(this._x + rabbit.camera.x), Math.floor(this._y + rabbit.camera.y)) ;
		rabbit.context.clearRect(0, 0, Math.round(this.width), Math.round(this.height)) ;
		rabbit.context.restore() ;
		this._x = this.x ;
		this._y = this.y ;
		this.width = this.image.width ;
		this.height = this.image.height ;
	};
};

rabbit.Sprite = function(x, y, image, frameW, frameH) {
	rabbit.Graphic.apply(this) ;

	this._x = x ;
	this._y = y ;
	this.x = x ;
	this.y = y ;
	this.origin = [0, 0] ;
	this.scale = 1 ;
	this.image = rabbit.loadImage(image) ;
	this.frame = 0 ;
	this.animations = {} ;
	this.animation = null ;
	this.fps = 0 ;
	this.time = 0 ;
	this.frameWidth = frameW ;
	this.frameHeight = frameH ;
	this.flip = false ;
	this.alpha = 1 ;
	this.angle = 0;

	this.add = function(animation, frames) {
		this.animations[animation] = frames ;
	} ;

	this.draw = function() {
		if(this.image.valid) {
			var fx = 0 ;
			var fy = 0 ;
			var ox = 0 ;
			var oy = 0 ;
			if(this.animation) {
				var frame = this.animation[this.frame] ;
				var rowLength = Math.floor(this.image.width / this.frameWidth) ;
				fx = (frame % rowLength) * this.frameWidth ;
				fy = Math.floor(frame / rowLength) * this.frameHeight ;
			}
			rabbit.context.save() ;
			rabbit.context.globalAlpha = this.alpha ;			
		
			this._x = this.x; this._y = this.y;
			if(this.ignoreCamera)
				rabbit.context.translate(Math.floor(this._x), Math.floor(this._y)) ;
			else
				rabbit.context.translate(Math.floor(this._x + rabbit.camera.x), Math.floor(this._y + rabbit.camera.y)) ;
			
			var midPointX =  this.w*0.5;
			var midPointY =  this.h*0.5;				
				
			rabbit.context.translate(midPointX, midPointY);
			rabbit.context.rotate(this.angle);
			rabbit.context.translate(-midPointX, -midPointY);
			
			if(this.flip) {
				rabbit.context.scale(-1, 1) ;
				rabbit.context.translate(-this.frameWidth, 0) ;
			}
			rabbit.context.drawImage(this.image, fx, fy, this.frameWidth, this.frameHeight, ox, oy, Math.floor(this.frameWidth * this.scale), Math.floor(this.frameHeight * this.scale)) ;
			rabbit.context.globalAlpha = 1 ;
			rabbit.context.restore() ;
		}
	} ;

	this.place = function(pos) {
		this.x = pos[0] ;
		this.y = pos[1] ;
	} ;

	this.play = function(animation, fps, loop) {
		this.animation = this.animations[animation] ;
		this.playing = animation;
		this.fps = fps;
		this.frame = 0;
		this.time = 0;
		this.loop = loop;
		if(loop == undefined)
			this.loop = true;
	};

	this.update = function(dtime) {
		rabbit.context.save() ;
		if(this.ignoreCamera)
			rabbit.context.translate(Math.floor(this._x), Math.floor(this._y)) ;
		else
			rabbit.context.translate(Math.floor(this._x + rabbit.camera.x), Math.floor(this._y + rabbit.camera.y)) ;
		rabbit.context.clearRect(0, 0, Math.floor(this.w), Math.floor(this.h)) ;
		rabbit.context.restore() ;
		this._x = this.x ;
		this._y = this.y ;
		this.w = this.frameWidth;
		this.h = this.frameHeight;
		this.time += dtime ;

		if(this.fps > 0 && this.time > 1 / this.fps) {
			++this.frame ;
			while(this.time > 1 / this.fps)
				this.time -= 1 / this.fps ;
			if(this.frame >= this.animation.length) {
				if(this.loop)
					this.frame -= this.animation.length;
				else
					this.frame = this.animation.length-1;
			}
		}
	} ;
} ;

rabbit.Tilemap = function(x, y, image, tw, th, gw, gh) {
	rabbit.Graphic.apply(this) ;

	this.x = x ;
	this.y = y ;
	this.gridW = gw ;
	this.gridH = gh ;
	this.tileW = tw ;
	this.tileH = th ;

	this.image = rabbit.loadImage(image) ;
	this.canvas = null ;

	this.build = function() {
		this.canvas = new rabbit.Canvas(this.x, this.y, tw*gw, th*gh) ;
		//this.canvas = rabbit.Canvas.createRect(0, 0, tw*gw, th*gh, 'white') ;

		for(var y = 0; y < gh; ++y) {
			for(var x = 0; x < gw; ++x) {
				this.setTile(x, y, this.tile(x, y)) ;
			}
		}
	};

	this.draw = function() {
		if(this.canvas)
			this.canvas.draw() ;
	} ;

	this.tile = function(tx, ty) {
		if(tx < 0 || ty < 0 || tx >= this.gridW || ty >= this.gridH)
			return undefined ;
		return this.tiles[ty * this.gridW + tx] ;
	} ;

	this.setTile = function(tx, ty, tile) {
		if(tx < 0 || ty < 0 || tx >= this.gridW || ty >= this.gridH)
			return;
		this.tiles[ty * this.gridW + tx] = tile;
		
		var sheetW = Math.floor(this.image.width / this.tileW);
		var sheetH = Math.floor(this.image.height / this.tileH);
		var col = (tile-1) % (sheetW);
		var row = Math.floor((tile-1) / sheetW);

		if(this.canvas) {
			var sourceX = col * this.tileW;
			var sourceY = row * this.tileH;

			var destX = tx * this.tileW;
			var destY = ty * this.tileH;

			this.canvas.context.clearRect(destX, destY, this.tileW, this.tileH);
			this.canvas.context.drawImage(this.image, sourceX, sourceY, this.tileW, this.tileH, destX, destY, this.tileW, this.tileH);
		}
	};

	this.tiles = [] ;
	for(var y = 0; y < gh; ++y) {
		for(var x = 0; x < gw; ++x) {
			this.tiles.push(0) ;
		}
	}

	this.update = function(dtime) {
		rabbit.context.clearRect(Math.floor(this.x - 1), Math.floor(this.y - 1), Math.floor(this.width + 1), Math.floor(this.height + 1)) ;
		if(!this.canvas && this.image.valid) {
			this.build() ;
		}
	};
}

rabbit.Text = function(x, y, text, font, colour, size) {
	rabbit.Graphic.apply(this) ;
	this.x = x ;
	this.y = y ;
	this.text = text ;
	this.font = font || "sans" ;
	this.colour = colour || "white" ;
	this.size = size || 14 ;

	rabbit.context.textBaseline = 'top' ;
	rabbit.context.font = this.size + "px " + this.font ;
	rabbit.context.fillStyle = this.colour ;
	this.width = rabbit.context.measureText(text).width ;
	this.height = this.size ;

	this.draw = function() {
		this.width = rabbit.context.measureText(this.text).width ;
		rabbit.context.textBaseline = 'top' ;
		rabbit.context.font = this.size + "px " + this.font ;
		rabbit.context.fillStyle = this.colour ;
		rabbit.context.fillText(this.text, this.x, this.y) ;
	};

	this.update = function(time) {
		rabbit.context.clearRect(Math.floor(this.x - 1), Math.floor(this.y - 1), Math.floor(this.width + 1), Math.floor(this.height + 1)) ;

	};
} ;

rabbit.Sfx = function(sound) {
	rabbit.Object.apply(this) ;

	this.play = function() {
		this.sound = rabbit.loadAudio(sound) ;
		this.sound.play() ;
	}
};

rabbit.key = {
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	E: 69,
	F: 70,
	G: 71,
	H: 72,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	M: 77,
	N: 78,
	O: 79,
	P: 80,
	Q: 81,
	R: 82,
	S: 83,
	T: 84,
	U: 85,
	V: 86,
	W: 87,
	X: 88,
	Y: 89,
	Z: 90,

	ZERO:  48,
	ONE:   49,
	TWO:   50,
	THREE: 51,
	FOUR:  52,
	FIVE:  53,
	SIX:   54,
	SEVEN: 55,
	EIGHT: 56,
	NINE:  57,

	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	
	SPACE: 32
};
rabbit.version = 0.2 ;
