import { Entity, Rabbit, RabImage, Rect, Sfx } from "../ts/Core";

class EffectButton extends Entity {
    image:RabImage;
    sound:Sfx;
    rect:Rect;
    constructor(x, y, image, sound) {
        super();
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

function main() {
    const rabbit = new Rabbit();
    rabbit.init('rabbit-canvas');
    rabbit.world.add(new EffectButton(0, 0, "graphics/audio_test.png", "audio/bell.ogg"));
    rabbit.run();
}