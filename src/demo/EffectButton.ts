import { AudioSystem, Entity, EventType, Rabbit, RabbitMouseEvent, Sprite, Rect, Sfx, World, SpriteFrame,Text } from "../ts/Core";

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
        const entity2 = new Entity();
        entity2.transform.setPosition(100,-300);
        const text = entity2.addComponent(Text);
        text.text = "lalala";
        text.setAlign(Text.TextAlignType.center);
        entity.listen(EventType.MOUSE_DOWN, (event: RabbitMouseEvent) => {
            const rect = entity.transform.getRect();
            if (rect.collidePoint([event.x, event.y])) {
                AudioSystem.play("audio/bell.ogg");
                console.log("play");
                entity.transform.x += 30;
                entity.transform.angle+=15;
                entity2.transform.angle+=15;
            }
        });
        
        world.add(entity);
        world.add(entity2);
    };
    return world;
}