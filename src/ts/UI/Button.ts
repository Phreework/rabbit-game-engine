import { Entity, EventDisPatcher, Sprite, SpriteFrame } from "../Core";
import { Debug } from "../Debug";
import { rClass } from "../Decorator";
import { UIComponent } from "./UIComponent";

/**
 * @interface 按钮事件接口 
 */
interface IButtonEvent {
    target: Entity;
    scriptName: string;
    funcName: string;
    params: any[];
}
/**
 * @enum 按钮视觉模式，1none（不使用变换），2Sprite（使用多张精灵图），3scale（自动缩放）
 */
enum ButtonTransMode {
    none = 1,
    sprite = 2,
    scale = 3
}
/**
 * @class 按钮组件
 */
@rClass
export class Button extends UIComponent {
    /**
     * targetEntity
     */
    target: Entity;
    /**
     * defaultImage
     */
    defaultImage: SpriteFrame;
    /**
     * pressedImage
     */
    pressedImage: SpriteFrame;
    /**
     * hoverImage
     */
    hoverImage: SpriteFrame;
    /**
     * disableImage
     */
    disableImage: SpriteFrame;
    /**
     * 变换模式：1none（不使用变换），2Sprite（使用多张精灵图），3scale（自动缩放）
     */
    mode: ButtonTransMode = ButtonTransMode.none;
    /**
     * 事件组  
     */
    events: IButtonEvent[];
    onLoad() {
        try {
            if (this.entity)this.target = this.entity;
        } catch (e) {
            Debug.error(e, "按钮可能没有实体");
        }
    }
}