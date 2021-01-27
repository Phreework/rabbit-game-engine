import { AudioSystem, Entity, Rabbit, RabImage, World } from "../ts/Core.js";
export function main() {
  const world = new World("demo2");

  world.init = () => {
    const entity = new Entity();
    entity.transform.setPosition(100, 200);
    const image = entity.addComponent(RabImage);
    image.visible = false;
    image.setImageAsync("graphics/audio_test.png").then(() => {
      image.visible = true;
      entity.transform.width = image.w;
      entity.transform.height = image.h;
    });

    entity.mouseDown = () => {
      const rect = entity.transform.getRect();

      if (rect.collidePoint([Rabbit.Instance.mouse.x, Rabbit.Instance.mouse.y])) {
        AudioSystem.play("audio/bell.ogg");
        console.log("play");
      }
    };

    world.add(entity);
  };

  return world;
}