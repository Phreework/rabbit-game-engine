import { Component, Entity, GraphicComponent, GraphicList, Rabbit, RabImage, World } from "../ts/Core.js";
const TILE_W = 64;
const TILE_H = 32;

class IsoTilemap extends GraphicComponent {
  constructor(...args) {
    super(...args);
    this.gridW = void 0;
    this.gridH = void 0;
    this.tileW = void 0;
    this.tileH = void 0;
    this.image = void 0;
    this.tiles = void 0;
  }

  init(x, y, gw, gh, tw, th, image) {
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
    if (tx < 0 || ty < 0 || tx >= this.gridW || ty >= this.gridH) return undefined;
    return this.tiles[ty * this.gridW + tx];
  }

  setTile(tx, ty, tile) {
    if (tx < 0 || ty < 0 || tx >= this.gridW || ty >= this.gridH) return;
    this.tiles[ty * this.gridW + tx] = tile;
  }

  update(dtime) {}

}

class Terrain extends Component {
  constructor(...args) {
    super(...args);
    this.graphic = void 0;
  }

  init() {
    this.graphic = this.entity.addComponent(IsoTilemap);
    const imageUrl = 'graphics/isometric/tiles.png';
    this.graphic.init(0, 0, 12, 12, TILE_W, TILE_H, imageUrl);
    ;
  }

  setTile(tx, ty, tile) {
    this.graphic.setTile(tx, ty, tile);
  }

}

class Town extends Component {
  constructor(...args) {
    super(...args);
    this.gridX = void 0;
    this.gridY = void 0;
  }

  init(gx, gy) {
    this.gridX = gx;
    this.gridY = gy;
    this.entity.x = (gx - gy) * TILE_W / 2;
    this.entity.y = (gx + gy) * TILE_H / 2 - TILE_H / 4;
    const image = this.entity.addComponent(RabImage);
    image.x = this.entity.x;
    image.y = this.entity.y;
    image.imageUrl = 'graphics/isometric/town.png';
  }

}

class Unit extends Component {
  constructor(...args) {
    super(...args);
    this.gridX = void 0;
    this.gridY = void 0;
    this.image = void 0;
    this.banner = void 0;
  }

  init(gx, gy, banner) {
    this.gridX = gx;
    this.gridY = gy;
    this.entity.x = (gx - gy) * TILE_W / 2 + 16;
    this.entity.y = (gx + gy) * TILE_H / 2 - 32;
    const imageEntity = new Entity();
    this.image = imageEntity.addComponent(RabImage);
    this.image.x = this.entity.x;
    this.image.y = this.entity.y;
    this.image.imageUrl = 'graphics/isometric/warchap.png';
    const bannerEntity = new Entity();
    this.banner = bannerEntity.addComponent(RabImage);
    this.banner.x = this.entity.x;
    this.banner.y = this.entity.y;
    this.banner.imageUrl = 'graphics/isometric/' + banner + '.png';
    const list = this.entity.addComponent(GraphicList);
    list.setGraphics([this.banner, this.image]);
  }

}

class City extends Component {
  constructor(...args) {
    super(...args);
    this.gridX = void 0;
    this.gridY = void 0;
    this.image = void 0;
  }

  init(gx, gy) {
    this.gridX = gx;
    this.gridY = gy;
    let width = 128;
    let height = 80;
    this.entity.x = (gx - gy) * TILE_W / 2 - width / 2 + TILE_W / 2;
    this.entity.y = (gx + gy) * TILE_H / 2 - height + TILE_H * 2;
    this.image = this.entity.addComponent(RabImage);
    this.image.imageUrl = 'graphics/isometric/city.png';
    this.image.x = this.entity.x;
    this.image.y = this.entity.y;
  }

}

export function main() {
  const world = new World("demo3");

  world.init = () => {
    console.log("执行");
    Rabbit.Instance.camera = {
      x: 12 * TILE_W / 2,
      y: 0
    };
    const terrainNode = new Entity();
    const terrain = terrainNode.addComponent(Terrain);
    terrain.init();
    terrain.setTile(0, 5, 0);
    world.add(terrainNode);
    const townNode1 = new Entity();
    const town1 = townNode1.addComponent(Town);
    town1.init(0, 5);
    world.add(townNode1);
    const unitNode1 = new Entity();
    const unit1 = unitNode1.addComponent(Unit);
    unit1.init(0, 5, 'banner_red');
    world.add(unitNode1);
    terrain.setTile(11, 6, 0);
    const townNode2 = new Entity();
    const town2 = townNode2.addComponent(Town);
    town2.init(11, 6);
    world.add(townNode2);
    const unitNode2 = new Entity();
    const unit2 = unitNode2.addComponent(Unit);
    unit2.init(11, 6, 'banner_blue');
    world.add(unitNode2);
    const cityNode = new Entity();
    const city = cityNode.addComponent(City);
    city.init(0, 0);
    world.add(cityNode);
  };

  return world;
}