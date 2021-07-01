import { AudioSystem, Entity, EventType, Rabbit, RabbitMouseEvent, Sprite, Rect, Sfx, World } from "../ts/Core";

export function main(): World {
    const world = new World("demo2");
    world.init = () => {
        const entity = new Entity();
        entity.transform.setPosition(100, -200);
        const spr = entity.addComponent(Sprite);
        spr.visible = false;
        spr.setImageAsync("graphics/audio_test.png").then(() => {
            spr.visible = true;
            entity.transform.width = spr.w;
            entity.transform.height = spr.h;
            console.log("图片加载完成");
        })
        entity.listen(EventType.MOUSE_DOWN, (event:RabbitMouseEvent) => {
            const rect = entity.transform.getRect();
            if (rect.collidePoint([event.x, event.y])) {
                AudioSystem.play("audio/bell.ogg");
                console.log("play");
                entity.transform.x+=30;
            }
        });
        world.add(entity);
    };
    return world;
}