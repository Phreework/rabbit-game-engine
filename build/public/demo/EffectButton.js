import { Entity, Rabbit, RabImage, Rect, Sfx, World } from "../ts/Core.js";
export class EffectButton extends Entity {
  constructor(x, y, image, sound) {
    super();
    this.image = void 0;
    this.sound = void 0;
    this.rect = void 0;
    this.x = x;
    this.y = y;
    this.image = new RabImage(x, y, image);
    this.graphic = this.image;
    this.sound = new Sfx(sound);
    this.rect = new Rect(x, y, 1, 1);
  }

  mouseDown() {
    if (this.rect.collidePoint([Rabbit.Instance.mouse.x, Rabbit.Instance.mouse.y])) {
      this.sound.play();
    }
  }

  update(dtime) {
    this.rect.w = this.image.w;
    this.rect.h = this.image.h;
  }

}
export function main() {
  const world = new World("demo2");

  world.init = () => {
    world.add(new EffectButton(0, 0, "graphics/audio_test.png", "audio/bell.ogg"));
  };

  return world;
}