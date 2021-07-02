import { AudioSystem, Entity, EventType, Rabbit, RabbitMouseEvent, Sprite, Rect, Sfx, World, SpriteFrame } from "../ts/Core";

export function main(): World {
    const world = new World("demo2");
    world.init = async () => {
        const entity = new Entity();
        entity.transform.setPosition(100, -200);
        const spr = entity.addComponent(Sprite);
        const sprFrame = new SpriteFrame();
        await sprFrame.setImageAsync("graphics/audio_test.png")
        spr.spriteFrame = sprFrame;
        console.log("图片加载完成");
        entity.listen(EventType.MOUSE_DOWN, (event: RabbitMouseEvent) => {
            const rect = entity.transform.getRect();
            if (rect.collidePoint([event.x, event.y])) {
                AudioSystem.play("audio/bell.ogg");
                console.log("play");
                entity.transform.x += 30;
            }
        });
        world.add(entity);
    };
    return world;
}