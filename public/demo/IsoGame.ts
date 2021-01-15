import { Entity, Graphic, GraphicList, Rabbit, RabImage, World } from "../ts/Core";

const TILE_W = 64;
const TILE_H = 32;

class IsoTilemap extends Graphic {

	gridW: number;
	gridH: number;
	tileW: number;
	tileH: number;
	image: HTMLImageElement;
	tiles: any[];
	constructor(x, y, gw, gh, tw, th, image) {
		super();
		this.x = x;
		this.y = y;
		this.gridW = gw;
		this.gridH = gh;
		this.tileW = tw;
		this.tileH = th;

		this.image = Rabbit.loadImage(image);

		this.tiles = [];

		for (let i = 0; i < gh; ++i) {
			for (let j = 0; j < gw; ++j) {
				this.tiles.push(Math.floor(Math.random() * 2));
			}
		}

	}



	draw() {
		for (let y = 0; y < this.gridH; ++y) {
			for (let x = 0; x < this.gridW; ++x) {
				let tileX = this.tile(x, y) * this.tileW;
				let tileY = 0;

				let destX = (x - y) * this.tileW / 2 + this.x + Rabbit.Instance.camera.x;
				let destY = (x + y) * this.tileH / 2 + this.y;
				Rabbit.Instance.context.drawImage(this.image, tileX, tileY, this.tileW, this.tileH, destX, destY, this.tileW, this.tileH);
			}
		}
	}

	tile(tx, ty) {
		if (tx < 0 || ty < 0 || tx >= this.gridW || ty >= this.gridH)
			return undefined;
		return this.tiles[ty * this.gridW + tx];
	}

	setTile(tx, ty, tile) {
		if (tx < 0 || ty < 0 || tx >= this.gridW || ty >= this.gridH)
			return;
		this.tiles[ty * this.gridW + tx] = tile;
	}

	update(dtime) { };
}

class Terrain extends Entity {
	graphic: IsoTilemap;
	constructor() {
		super();
		let imageUrl = 'graphics/isometric/tiles.png';
		this.graphic = new IsoTilemap(0, 0, 12, 12, TILE_W, TILE_H, imageUrl);

	}

	setTile(tx, ty, tile) {
		this.graphic.setTile(tx, ty, tile);
	}
}

class Town extends Entity {
	gridX: number;
	gridY: number;
	constructor(gx, gy) {
		super();
		this.gridX = gx;
		this.gridY = gy;

		this.x = (gx - gy) * TILE_W / 2;
		this.y = (gx + gy) * TILE_H / 2 - TILE_H / 4;

		this.graphic = new RabImage(this.x, this.y, 'graphics/isometric/town.png');
	}

}

class Unit extends Entity {
	gridX: number;
	gridY: number;
	image: RabImage;
	banner: RabImage;

	constructor(gx, gy, banner) {
		super();
		this.gridX = gx;
		this.gridY = gy;

		this.x = (gx - gy) * TILE_W / 2 + 16;
		this.y = (gx + gy) * TILE_H / 2 - 32;

		this.image = new RabImage(this.x, this.y, 'graphics/isometric/warchap.png');
		this.banner = new RabImage(this.x, this.y, 'graphics/isometric/' + banner + '.png');

		this.graphic = new GraphicList([this.banner, this.image]);
	}
}

class IsoWorld extends World {
	terrain: Terrain;
	constructor() {
		super();
		this.terrain = new Terrain();
		this.add(this.terrain);
		Rabbit.Instance.camera = { x: (12 * TILE_W / 2), y: 0 };
	}
}

class City extends Entity {
	gridX:number;
	gridY:number;
	image:RabImage;
	constructor(gx, gy) {
		super();
		this.gridX = gx;
		this.gridY = gy;

		let width = 128;
		let height = 80;

		this.x = (gx - gy) * TILE_W / 2 - width / 2 + TILE_W / 2;
		this.y = (gx + gy) * TILE_H / 2 - height + TILE_H * 2;

		this.image = new RabImage(this.x, this.y, 'graphics/isometric/city.png');

		this.graphic = this.image;
	}
}

function main() {
	const rabbit = new Rabbit();
	rabbit.init('rabbit-canvas');
	rabbit.world = new IsoWorld();
	const world = rabbit.world as IsoWorld;
	world.terrain.setTile(0, 5, 0);
	world.add(new Town(0, 5));
	world.add(new Unit(0, 5, 'banner_red'));
	world.terrain.setTile(11, 6, 0);
	world.add(new Town(11, 6));
	world.add(new Unit(11, 6, 'banner_blue'));
	world.add(new City(0, 0));
	rabbit.run();
}
// export {City,IsoTilemap,IsoWorld,Terrain,Town,Unit,main};