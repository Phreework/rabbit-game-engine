import { EventDisPatcher, Sprite, SpriteFrame } from "../Core";
import { Debug } from "../Debug";
import { rClass } from "../Decorator";
import { UIComponent } from "./UIComponent";

@rClass
export class Button extends UIComponent{
    /**
     * defaultSprite
     */
    defaultImage:SpriteFrame;
    /**
     * pressedSprite
     */
    pressedImage:SpriteFrame;
    /**
     * 事件
     */
    event:EventDisPatcher;
    onLoad(){
        try{
            const spr = this.entity.getComponent(Sprite);
            spr.spriteFrame = this.defaultImage;
        }catch(e){
            Debug.error(e,"按钮可能没有实体，或实体上没有Sprite组件");
        }
    }
}