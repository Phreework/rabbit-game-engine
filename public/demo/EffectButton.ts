import { AudioSystem, Entity, Rabbit, RabImage, Rect, Sfx, World } from "../ts/Core.js";

export class EffectButton extends Entity {
    image: RabImage;
    sound: Sfx;
    rect: Rect;
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

export function main(): World {
    const world = new World("demo2");
    world.init = () => {
        const entity = new Entity();
        entity.setPosition(100, 200);
        const image = entity.addComponent(RabImage);
        image.visible = false;
        image.setImageAsync("graphics/audio_test.png").then(() => {
            image.visible = true;
            entity.rect.w = image.w;
            entity.rect.h = image.h;
        })
        entity.mouseDown = () => {
            if (entity.rect.collidePoint([Rabbit.Instance.mouse.x, Rabbit.Instance.mouse.y])) {
                AudioSystem.play("audio/bell.ogg");
                console.log("play");
            }
        }
        world.add(entity);
    };
    return world;
}