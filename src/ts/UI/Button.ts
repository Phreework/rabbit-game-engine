import { Entity, EventDisPatcher, EventType, Rabbit, RabbitMouseEvent, Sprite, SpriteFrame } from "../Core";
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

@rClass
export class ButtonEvent {
    target: Entity;
    scriptName: string;
    funcName: string;
    params: any[];
    constructor(target:Entity,scriptName:string,funcName:string,params?:any[]){
        this.target = target;
        this.scriptName = scriptName;
        this.funcName = funcName;
        this.params = params;
    }
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
    events: IButtonEvent[]=[];
    onLoad() {
        try {
            if (this.entity && !this.target) this.target = this.entity;
            this.target.listen(EventType.MOUSE_DOWN, (event: RabbitMouseEvent) => {
                const rect = this.target.transform.getRect();
                if (rect.collidePoint([event.x, event.y])) {
                    this.emitEvents();
                }
            })
        } catch (e) {
            Debug.error(e, "按钮可能没有实体");
        }
    }
    /**
     * 触发按钮所有绑定事件
     */
    emitEvents() {
        this.events.forEach((event) => {
            Debug.log("触发成功",event,event.target.getComponent(event.scriptName));
            event.target.getComponent(event.scriptName)[event.funcName](...event.params);
        })
    }
    /**
     * 添加事件
     * @param event 事件
     */
    addEvent(event:IButtonEvent):void{
        this.events.push(event);
    }
    /**
     * 删除已添加的事件
     * @param funcname 事件函数名
     */
    deleteEvent(funcname:string):void{
        this.events.filter((event)=>{return event.funcName!=funcname});
    }
}