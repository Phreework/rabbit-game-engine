import { AudioSystem, Entity, EventType, Rabbit, RabbitMouseEvent, Sprite, Rect, Sfx, World, SpriteFrame,Text, Component } from "../ts/Core";
import { Button, ButtonEvent } from "../ts/UI/Button";

class EffectButton extends Component{
    playMyFx(){
            AudioSystem.play("audio/bell.ogg");
            console.log("play");
            this.entity.transform.x += 30;
            this.entity.transform.angle+=15;
    }
}
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
        console.log("transform",entity.getComponent("Transform"));
        entity.addComponent(EffectButton);
        const btn = entity.addComponent(Button);
        const event = new ButtonEvent(entity,"EffectButton", "playMyFx");
        btn.addEvent(event);
        world.add(entity);
        world.add(entity2);
    };
    return world;
}