/** 
 * --------------------------------------------------------
 * ###en
 * The core script of Rabbit engine
 * main author: PhreeSoda
 * GitHub: https://github.com/Phreework/rabbit-game-engine
 * description: Rabbit engine is a quick and fast H5 game engine whitch have a Entity-Component-Pipeline design.
 * ###zh
 * Rabbit 引擎的核心代码 
 * 主要作者：PhreeSoda
 * 代码仓库：https://github.com/Phreework/rabbit-game-engine
 * 描述：rabbit 引擎是一个极易上手且功能强大的H5游戏引擎，具有 实体-组件-管线 的特色开发架构。
 * --------------------------------------------------------
*/

import { rClass } from "../ts/Decorator.js";
import { Debug } from "./Debug.js";
import Tween from "./tweens/Tween.js";

/**
 * 记录了所有Engine Class的map
 */
export const rabbitClass = {};

/**
 * 记录当前引擎版本
 */
export const rabbitVersion: string = "0.2";

/**
 * ###en
 * 
 * ###zh
 * 键盘按键枚举（需补齐其他不常用键）
 */
export enum KeyType {
    A = 65,
    B = 66,
    C = 67,
    D = 68,
    E = 69,
    F = 70,
    G = 71,
    H = 72,
    I = 73,
    J = 74,
    K = 75,
    L = 76,
    M = 77,
    N = 78,
    O = 79,
    P = 80,
    Q = 81,
    R = 82,
    S = 83,
    T = 84,
    U = 85,
    V = 86,
    W = 87,
    X = 88,
    Y = 89,
    Z = 90,

    ZERO = 48,
    ONE = 49,
    TWO = 50,
    THREE = 51,
    FOUR = 52,
    FIVE = 53,
    SIX = 54,
    SEVEN = 55,
    EIGHT = 56,
    NINE = 57,

    LEFT = 37,
    UP = 38,
    RIGHT = 39,
    DOWN = 40,

    SPACE = 32
}
export class RabbitMouseEvent {
    constructor(e: MouseEvent) {
        this.x = e.x;
        this.y = e.y;
    }
    x: number;
    y: number;
    getLocation() {
        return new Vec2(this.x, this.y);
    }
}
/**
 * ###en
 * 
 * ###zh
 * 游戏实例
 */
@rClass
export class Rabbit {

    /**
     * Rabbit运行环境唯一实例
     */
    public static Instance: Rabbit = null;


    /**
     * 返回Canvas的矩形框
     */
    get winSize(): Rect {
        return new Rect(0, 0, this.htmlCanvas.width, this.htmlCanvas.height);
    }

    /**
     * 游戏的Html画布
     */
    htmlCanvas: HTMLCanvasElement = null;

    /**
     * Rabbit画布对象
     */
    canvas: Canvas = null;

    /**
     * 游戏摄像机,存储了camera的位置
     */
    camera: { x: number, y: number } = null;

    /**
     * Canvas绘制上下文对象
     */
    context: CanvasRenderingContext2D = null;

    /**
     * 存储图片的map
     */
    static images: Map<string, HTMLImageElement> = new Map();

    /**
     * 音频存储Map
     */
    audio: any = {};

    /**
     * 选定的游戏场景对象
     */
    world: World = null;

    /**
     * 鼠标对象，包含位置信息和按键状态
     */
    mouse: { x: number, y: number, pressed: boolean } = { x: undefined, y: undefined, pressed: false };

    /**
     * 由于左右上下的html - bounding，需对鼠标可触发区域做修正
     */
    offset: number[] = [0, 0];

    /**
     * 游戏帧数，影响每秒draw以及update多少次
     */
    fps: number = 60;

    /**
     * html音响频道对象池，播放时创建，可复用，暂未做最高限制
     */
    static audioChannels: HTMLAudioElement[] = [];

    /**
     * 按键状态数组，储存了所有按键的按下状态布尔值
     */
    keysPressed: boolean[] = [];

    /**
     * 最高单帧时长,在游戏中会记录最慢帧时长
     */
    maxFrameTime: number = 0.030;

    /**
     * 记录每帧时间点
     */
    time: number = undefined;
    /**
     * 记录游戏进行了多少帧
     */
    frameCacul: number = 0;
    /**
     * @deprecated
     * 记录即将切换的场景
     */
    private _nextWorld: World = null;

    /**
     * 当前引擎版本
     */
    static version: string = rabbitVersion;

    /**
     * 存储所有注册的游戏场景的map
     */
    worldMap: Map<string, World> = new Map();

    /**
     * 可判断rabbit是否有场景处在运行状态
     */
    isRabbitRun: boolean = false;

    /**
     * 记录当前更新函数的id
     * 类型应为NodeJs.Timeout
     */
    updateId: any = null;

    /**
     * 实体处理系统类
     */
    entitySystem: EntitySystem;

    /**
     * 组件处理系统类
     */
    compSystem: CompSystem;

    /**
     * 事件处理系统类
     */
    eventSystem: EventSystem;

    /**
     * Tween处理系统类
     */
    tweenSystem: TweenSystem;

    /**
     * debugMode 调试模式
     */
    debugMode: boolean = false;
    debugTools: DebugTools;
    /**
     * Rabbit运行环境构造器函数
     */
    constructor() {
        if (Rabbit.Instance) return;
        Rabbit.Instance = this;
        rabbit = Rabbit.Instance;
        this.entitySystem = new EntitySystem();
        this.compSystem = new CompSystem();
        this.eventSystem = new EventSystem();
        this.tweenSystem = new TweenSystem();
    }

    /**
     * 初始化游戏
     * @param canvasid 传入canvas的html id 
     */
    init(canvasid?: string): void {
        canvasid = canvasid ? canvasid : 'rabbit-canvas';
        const htmlCanvas: HTMLCanvasElement = document.getElementById(canvasid) as HTMLCanvasElement;
        this.htmlCanvas = htmlCanvas;
        this.context = htmlCanvas.getContext('2d');

        this.eventSystem.initEventRegister();

        if (document.defaultView && document.defaultView.getComputedStyle) {
            const paddingLeft: number = +(document.defaultView.getComputedStyle(htmlCanvas, null)['paddingLeft']) || 0;
            const paddingTop: number = +(document.defaultView.getComputedStyle(htmlCanvas, null)['paddingTop']) || 0;
            const borderLeft: number = +(document.defaultView.getComputedStyle(htmlCanvas, null)['borderLeftWidth']) || 0;
            const borderTop: number = +(document.defaultView.getComputedStyle(htmlCanvas, null)['borderTopWidth']) || 0;
            this.offset = [paddingLeft + borderLeft, paddingTop + borderTop];
        }

        this.htmlCanvas.width = this.htmlCanvas.clientWidth;
        this.htmlCanvas.height = this.htmlCanvas.clientHeight;

        this.resetCamera();
        Debug.log("rabbit 初始化完成")
    }

    /**
     * 重设摄像机
     */
    private resetCamera() {
        this.camera = { x: 0, y: 0 };
    }

    /**
     * 输出图片错误
     * @param url 图片地址
     */
    imageError(url: string): void {
        alert("Could not load " + url + ".");
    }

    /**
     * 加载图片
     * @param url 图片地址
     */
    static loadImage(url: string): HTMLImageElement {
        if (url in this.images) return this.images[url];
        const img: HTMLImageElement = new Image();
        img.src = url;
        img.onload = () => {
            (img as any).valid = true;
        }
        img.onerror = () => {
            (img as any).valid = false; Rabbit.Instance.imageError(img.src);
        };
        this.images[url] = img;
        return img;
    }

    /**
     * 异步加载图片
     * @param url 图片地址
     */
    static loadImageAsync(url: string): Promise<HTMLImageElement> {
        return new Promise((success, fail) => {
            if (url in this.images) {
                success(this.images[url]);
            }
            const img: HTMLImageElement = new Image();
            img.src = url;
            img.onload = () => {
                (img as any).valid = true;
                this.images[url] = img;
                success(img);
            }
            img.onerror = () => {
                (img as any).valid = false;
                Rabbit.Instance.imageError(img.src);
                fail();
            };
        })
    }

    /**
     * 加载音乐
     * @param url 音乐地址
     */
    static loadAudio(url: string): HTMLAudioElement {
        let channel: HTMLAudioElement = null;
        for (var a = 0; a < this.audioChannels.length; ++a) {
            channel = this.audioChannels[a];
            if (channel.ended) {
                channel.pause();
                channel.currentTime = 0;
                channel.src = url;
                return channel;
            }
        }
        channel = new Audio(url);
        this.audioChannels.push(channel);
        return channel;
    }

    /**
     * 获取鼠标位置
     * @param e
     */
    _mousePosition(e) {
        let ox: number = 0, oy: number = 0;
        const element: HTMLCanvasElement = this.htmlCanvas;
        if (element.offsetParent) {
            do {
                ox += element.offsetLeft;
                oy += element.offsetTop;
            } while ((element == element.parentElement));
        }
        return [e.pageX - ox + this.offset[0], e.pageY - oy + this.offset[1]];
    }

    /**
     * 鼠标按下
     * @param event 事件
     */
    _canvasMouseDown(event: MouseEvent): void {
        event.preventDefault();
        this.mouseDown(event);
    }

    /**
     * 键盘下键按下
     * @param event 
     */
    keyDown(event: KeyboardEvent): void {
        // Debug.log("event", event);
        if (this.keysPressed[event.keyCode]) return;
        this.keysPressed[event.keyCode] = true;
        this.world.keyDown(event.keyCode);
    }

    /**
     * 键盘上键按下
     * @param event 
     */
    keyUp(event: KeyboardEvent): void {
        this.keysPressed[event.keyCode] = false;
        this.world.keyUp(event.keyCode);
    }

    /**
     * 鼠标是否按下
     */
    isMouseDown: boolean = false;
    /**
     * 鼠标下键按下
     */
    mouseDown(e: MouseEvent): void {
        this.isMouseDown = true;
        this.world.mouseDown(e);
        this.mouse.pressed = true;
    }
    /**
     * 鼠标下键按下
     * @param event
     */
    mouseUp(e: MouseEvent): void {
        this.isMouseDown = false;
        this.world.mouseUp(e);
        this.mouse.pressed = true;
    }
    /**
     * 鼠标移动
     * @param event 
     */
    mousePress(event: MouseEvent): void {
        if (!this.isMouseDown) return;
        var mousePos = Rabbit.Instance._mousePosition(event);
        this.mouse.x = mousePos[0];
        this.mouse.y = mousePos[1];
        this.world.mousePress(event);
    }

    /**
     * 鼠标出绘制屏幕
     * @param event 
     */
    mouseOut(event: MouseEvent): void {
        this.isMouseDown = false;
        this.mouse.x = undefined;
        this.mouse.y = undefined;
    }

    /**
     * 播放网络音效
     * @param url 
     */
    playSfx(url: string): void {
        new Sfx(url).play();
    }

    /**
     * 开始update
     * @param url 
     */
    run() {
        const dtime: number = 1000 / this.fps;
        this.time = Date.now();
        this.start();
        this.updateId = setInterval(() => { this.update() }, dtime);
    }

    /**
     * 设置背景图片
     * @param url 背景图片地址
     */
    setBackground(url: string) {
        this.htmlCanvas.style.backgroundImage = 'url(' + url + ')';
        this.context.clearRect(0, 0, this.htmlCanvas.width, this.htmlCanvas.height);
    }

    /**
     * 设置场景为下次运行的场景
     * @deprecated 该方法已弃用
     * @param world 
     */
    setWorld(world: World) {
        this._nextWorld = world;
    }

    /**
     * 添加一个场景实例
     * @param world 添加场景实例
     */
    addWorld(world: World) {
        this.worldMap.set(world.name, world);
    }

    /**
     * 运行游戏场景
     * @param worldname 游戏场景名
     */
    runWorld(worldname: string) {
        if (this.isRabbitRun) this.stop();
        this.world = this.worldMap.get(worldname);
        if (this.world) {
            this.resetCamera();
            this.world.init();
            this.run();
            this.isRabbitRun = true;
        } else {
            Debug.error("runWorld world不存在");
        }
        // Debug.log("this.world", this.world)
    }

    /**
     * 停止游戏主循环
     */
    stop(): boolean {
        if (this.updateId) clearInterval(this.updateId);
        else return false;
        this.world.stop();
        this.updateId = null;
        this.isRabbitRun = false;
        return true;
    }

    /**
     * 触发world的start函数
     */
    start() {
        this.world.start();
    }

    /**
     * update主循环函数
     */
    update() {
        let dtime: number = (Date.now() - this.time) / 1000;
        if (dtime > this.maxFrameTime) dtime = this.maxFrameTime;
        this.time = Date.now();
        this.frameCacul++;
        this.world.update(dtime);
        this.context.clearRect(0, 0, this.htmlCanvas.width, this.htmlCanvas.height);
        this.world.draw();
        this.mouse.pressed = false;
        if (this._nextWorld) {
            this.world = this._nextWorld;
            this._nextWorld = null;
        }
    }
    /**
     * 发送事件广播
     */
    message(event: EventType | string, ...params) {
        Rabbit.Instance.eventSystem.sendMessage(new EventDisPatcher(event, params));
    }
}

export let rabbit: Rabbit = null;


/**
 * @class 管理所有的实体
 */
@rClass
export class EntitySystem {


    /**
     * @instance EntitySystem的唯一静态实例
     */
    static Instance: EntitySystem;

    /**
     * @constructor EntitySystem的构造器函数
     */
    constructor() {
        EntitySystem.Instance = this;
    }

    /**
     * 在场景中添加实体
     * @param e 要添加的实体
     */
    add(e: Entity) {
        const world = Rabbit.Instance.world;
        world.entities.push(e);
        e.id = world.maxId++;
        e.world = world;
        if (e.isRemoved == true) e.isRemoved = false;
        e.onAdd();
    }

    /**
     * 为场景中所有实体派发绘制事件
     */
    draw() {
        const entities = Rabbit.Instance.world.entities;
        entities.sort((lhs, rhs) => {
            if (!lhs.graphic)
                return -1;
            if (!rhs.graphic)
                return 1;
            if (lhs.graphic.z == rhs.graphic.z)
                return lhs.id - rhs.id;
            return lhs.graphic.z - rhs.graphic.z;
        });
        for (let i = 0; i < entities.length; ++i) {
            entities[i].draw();
        }
    }

    /**
     * 在该帧结束时删除该实体
     * @param e 要删除的实体
     */
    destroyEntity(e: Entity) {
        e.onDestroy();
        Rabbit.Instance.world.preDestroys.push(e);
    }
    /**
     * 在该帧结束时移除该实体
     * @param e 要移除的实体
     */
    removeEntity(e: Entity) {
        e.isRemoved = true;
        e.parent = null;
        Rabbit.Instance.world.removes.push(e);
    }
}
/**
 * 管理所有的组件
 * 单例
 */
@rClass
export class CompSystem {

    static Instance: CompSystem;

    constructor() {
        CompSystem.Instance = this;
    }
}
/**
 * 管理所有的事件
 * 单例
 */
@rClass
export class EventSystem {

    initEventRegister() {
        Rabbit.Instance.htmlCanvas.onmousedown = (e) => { Rabbit.Instance._canvasMouseDown(e); };
        document.onkeydown = (e) => { Rabbit.Instance.keyDown(e); };
        document.onkeyup = (e) => { Rabbit.Instance.keyUp(e); };
        Rabbit.Instance.htmlCanvas.onmousemove = (e) => { Rabbit.Instance.mousePress(e); };
        Rabbit.Instance.htmlCanvas.onmouseup = (e) => { Rabbit.Instance.mouseUp(e); };
        Rabbit.Instance.htmlCanvas.onmouseout = (e) => { Rabbit.Instance.mouseOut(e); };
    }

    static Instance: EventSystem;

    constructor() {
        EventSystem.Instance = this;
    }

    start() {
        const entities = Rabbit.Instance.world.entities;
        for (let i = 0; i < entities.length; ++i) {
            const entity = entities[i];
            if (entity.active) entity.start();
        }
    }

    update(dtime: number) {
        const entities = Rabbit.Instance.world.entities;
        const preDestroys = Rabbit.Instance.world.preDestroys;
        for (let i = 0; i < entities.length; ++i) {
            const entity = entities[i];
            if (!entity.active) continue;
            entity.update(dtime);
        }

        //可能开销比较大？
        for (let j = 0; j < preDestroys.length; ++j) {
            for (let i = 0; i < entities.length; ++i) {
                if (entities[i] == preDestroys[j]) entities.splice(i, 1);
            }
        }
        Rabbit.Instance.world.preDestroys = [];
    }

    keyDown(key: number) {
        this.sendMessage(new EventDisPatcher("keyDown", key));
    }

    keyPress(key: number) {
        this.sendMessage(new EventDisPatcher("keyPress", key));
    }

    keyUp(key: number) {
        this.sendMessage(new EventDisPatcher("keyUp", key));
    }

    mouseDown(event: RabbitMouseEvent) {
        console.log("mouseEvent", event);
        this.sendMessage(new EventDisPatcher("mouseDown", event));
    }

    mousePress(event: RabbitMouseEvent) {
        this.sendMessage(new EventDisPatcher("mousePress", event));
    }

    mouseUp(event: RabbitMouseEvent) {
        this.sendMessage(new EventDisPatcher("mouseUp", event));
    }

    mouseOut(event: RabbitMouseEvent) {
        this.sendMessage(new EventDisPatcher("mouseOut", event));
    }

    removeListener(event: string, func?: Function, bind?: Object) {
        const listeners = Rabbit.Instance.world.eventListeners;
        const deleteListeners: EventListener[] = [];
        for (let i = listeners.length - 1; i >= 0; --i) {
            const listener = listeners[i];
            if (func) {
                if (listener.eventType == event && listener.func == func) {
                    deleteListeners.push(listener);
                }
            } else if (func && bind) {
                if (listener.eventType == event && listener.func == func && listener.entity == bind) {
                    deleteListeners.push(listener);
                }
            } else {
                if (listener.eventType == event) {
                    deleteListeners.push(listener);
                }
            }
        }
        deleteListeners.forEach((item) => {
            EngineTools.deleteItemFromList(item, listeners);
        });
    }

    addListener(listener: EventListener) {
        Rabbit.Instance.world.eventListeners.push(listener);
    }

    sendMessage(dispatcher: EventDisPatcher) {
        const listeners = Rabbit.Instance.world.eventListeners;
        const deleteListeners: EventListener[] = [];
        for (let i = listeners.length - 1; i >= 0; --i) {
            const listener: EventListener = listeners[i];
            const isEmit: boolean = listener.checkEmit(dispatcher);
            if (isEmit && listener.isOnce) {
                deleteListeners.push(listener);
            }
        }
        deleteListeners.forEach((item) => {
            EngineTools.deleteItemFromList(item, listeners);
        });
    }

}
export class TweenSystem {
    update(dtime: number) {
        const tweens = Rabbit.Instance.world.tweens;
        const deleteTweens: Tween<any>[] = [];
        for (let i = tweens.length - 1; i >= 0; --i) {
            const tween: Tween<any> = tweens[i];
            if (tween.isPlaying()) tween.update(Rabbit.Instance.time);
            else deleteTweens.push(tween);
        }
        deleteTweens.forEach((item) => {
            EngineTools.deleteItemFromList(item, tweens);
        });
    }
    addTween(tween: Tween<any>) {
        Rabbit.Instance.world.tweens.push(tween);
    }
    static Instance: TweenSystem;

    constructor() {
        TweenSystem.Instance = this;
    }
}
export class EventListener {

    entity: Entity;
    eventType: string;
    func: Function;
    isOnce: boolean = true;
    bind: Object;
    constructor(event: EventType | string, func: Function, bind: Object, entity: Entity, isonce: boolean) {
        this.eventType = event;
        this.func = func;
        this.bind = bind;
        this.entity = entity;
        this.isOnce = isonce;
    }
    checkEmit(dispatcher: EventDisPatcher): boolean {
        if (!this.entity || !this.entity.active || !this.func) return;
        if (dispatcher.eventType == this.eventType) {
            if (this.eventType == EventType.POSITION_CHANGED) {
                if (dispatcher.args[0] != this.entity) return false;
            } else if (this.eventType == EventType.MOUSE_DOWN) {
                const mouse = [(dispatcher.args[0] as MouseEvent).x, (dispatcher.args[0] as MouseEvent).y];
                // console.log("rect", this.entity.transform.getRect());
                // console.log("mouse", mouse);
                if (this.entity.transform.getRect().collidePoint(mouse)) {
                    (this.entity as any)._isMouseDown = true;
                    this.entity.listenOnce(EventType.MOUSE_UP, () => (this.entity as any)._isMouseDown = false);
                    console.log("点击成功");
                } else {
                    console.log("点击失败");
                    return false;
                }
            } else if (this.eventType == EventType.MOUSE_PRESS || this.eventType == EventType.MOUSE_UP || this.eventType == EventType.MOUSE_OUT) {
                if (!(this.entity as any)._isMouseDown) return false;
            }
            this.func.apply(this.bind, dispatcher.args);
            return true;
        }
        return false;
    }
}
export class EventDisPatcher {
    eventType: EventType | string;
    args: any[];
    constructor(event: EventType | string, ...args) {
        this.eventType = event;
        this.args = args;
    }
}
export enum EventType {
    MOUSE_DOWN = "mouseDown",
    MOUSE_UP = "mouseUp",
    MOUSE_PRESS = "mousePress",
    MOUSE_OUT = "mouseOut",
    KEY_DOWN = "keyDown",
    KEY_PRESS = "keyPress",
    KEY_UP = "keyUp",
    POSITION_CHANGED = "positionChanged"
}
@rClass
export class RabObject {

    clone() {
        let f = function () { };
        f.prototype = this;
        let o = new f();
        return o;
    }

    extend(data) {
        let o = this.clone();
        for (let k in data) {
            o[k] = data[k];
        }
        return o;
    }
}
@rClass
export class Component extends RabObject {

    entity: Entity;
    enabled: boolean;

    _onLoad() {
        this.onLoad();
        this.start();
    }

    onLoad() {

    }

    start() {

    }

    lateUpdate() {

    }

    onEnable() {

    }

    onDestroy() {

    }

    update(dtime) {

    }

    addComponent(className: string): Component;

    addComponent<T extends Component>(com: { new(): T }): T;

    addComponent<T extends Component>(com: string | { new(): T }): any {
        if (typeof com == "string")
            return this.entity.addComponent(com);
        else
            return this.entity.addComponent(com);
    }

    getComponent(className: string): Component;

    getComponent<T extends Component>(type: { prototype: T }): T;

    getComponent<T extends Component>(type: string | { prototype: T }): any {
        if (typeof type == "string")
            return this.entity.getComponent(type);
        else
            return this.entity.getComponent(type);
    }

}
@rClass
export class TestComponent extends Component {
}
@rClass
export class Vec2 {
    _x: number;
    get x(): number {
        return this._x;
    }
    set x(x: number) {
        this._x = x;
    }
    get width(): number {
        return this._x;
    }
    set width(width: number) {
        this._x = width;
    }
    _y: number;
    get y(): number {
        return this._y;
    }
    set y(y: number) {
        this._y = y;
    }
    get height(): number {
        return this._y;
    }
    set height(height: number) {
        this._y = height;
    }
    constructor(x: number, y: number);
    constructor(width: number, height: number);
    constructor(x?: number, y?: number) {
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }
    sub(other: Vec2) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }
}
@rClass
export class Vec3 {
    _x: number;
    _y: number;
    _z: number;
    get x(): number {
        return this._x;
    }
    set x(x: number) {
        this._x = x;
    }
    get y(): number {
        return this._y;
    }
    set y(y: number) {
        this._y = y;
    }
    get z(): number {
        return this._z;
    }
    set z(z: number) {
        this._z = z;
    }
    constructor(x?: number, y?: number, z?: number) {
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.z = z ? z : 0;
    }
}

export interface IVec3 {
    x?: number;
    y?: number;
    z?: number;
}
export interface IVec2 {
    x?: number;
    y?: number;
}

@rClass
export class TransformChangeSign {
    isAngleChange: boolean = false;

}
@rClass
export class Transform extends Component {

    changeSign: TransformChangeSign = new TransformChangeSign();
    /**
     * 世界坐标
     */
    private _worldPosition: Vec3 = new Vec3();
    /**
     * 本地坐标
     */
    private _position: Vec3 = new Vec3();
    /**
     * 世界坐标系角度
     */
    private _worldAngle: number = 0;
    /**
     * 本地坐标系角度
     */
    private _angle: number = 0;
    /**
     * 2d模式锚点
     */
    private _anchor: Vec2 = new Vec2(0.5, 0.5);
    /**
     * @description 本地缩放尺寸
     */
    private _scale: Vec2 = new Vec2(1, 1);
    /**
     * @description 世界缩放尺寸
     */
    private _worldScale: Vec2 = new Vec2(1, 1);
    /**
     * 颜色
     */
    private _color: Color = Color.BLACK;
    /**
     * 宽高对象
     */
    private _rect: Rect = new Rect(0, 0, 0, 0);

    constructor(x?: number, y?: number, width?: number, height?: number, scalex?: number, scaley?: number) {
        super();
        this.x = x ? x : this.x;
        this.y = y ? y : this.y;
        this.width = width ? width : this.width;
        this.height = height ? height : this.height;
        this._scale.x = scalex ? scalex : this._scale.x;
        this._scale.y = scaley ? scaley : this._scale.y;
    }

    init(x?: number, y?: number, width?: number, height?: number, scalex?: number, scaley?: number) {
        this.x = x ? x : this.x;
        this.y = y ? y : this.y;
        this.width = width ? width : this.width;
        this.height = height ? height : this.height;
        this.scaleX = scalex ? scalex : this.scaleX;
        this.scaleY = scaley ? scaley : this.scaleY;
    }

    /**
     *  @get 返回世界坐标
     */
    get worldPosition(): Vec3 {
        return this._worldPosition;
    }

    /**
     * @set 设置世界坐标
     */
    set worldPosition(position: Vec3) {
        this._worldPosition = position;
        this.updateLocalPosition();
    }

    /**
     * @get 获得世界坐标下x的值
     */
    get worldX(): number {
        return this._worldPosition.x;
    }

    /**
     * @set 设置世界坐标下x的值
     */
    set worldX(value: number) {
        this._worldPosition.x = value;
        this.updateLocalPosition();
    }

    /**
     * @get 获得世界坐标下y的值
     */
    get worldY(): number {
        return this._worldPosition.y;
    }

    /**
     * @set 设置世界坐标下y的值
     */
    set worldY(value: number) {
        this._worldPosition.y = value;
        this.updateLocalPosition();
    }

    /**
     * @get 获得世界坐标下z的值
     */
    get worldZ(): number {
        return this._worldPosition.z;
    }

    /**
     * @set 设置世界坐标下z的值
     */
    set worldZ(value: number) {
        this._worldPosition.z = value;
        this.updateLocalPosition();
    }



    /**
     *  @get 返回本地坐标
     */
    get position(): Vec3 {
        return this._position;
    }

    /**
     * @set 设置本地坐标
     */
    set position(position: Vec3) {
        this._position = position;
        this.updateWorldPosition();
    }

    /**
     * @get 获得本地坐标下x的值
     */
    get x(): number {
        return this._position.x;
    }

    /**
     * @set 设置本地坐标下x的值
     */
    set x(x: number) {
        console.log("坐标改变");
        this._position.x = x;
        this.updateWorldPosition();
    }

    /**
     * @get 获得本地坐标下y的值
     */
    get y(): number {
        return this._position.y;
    }

    /**
     * @set 设置本地坐标下y的值
     */
    set y(y: number) {
        this._position.y = y;
        this.updateWorldPosition();
    }

    /**
     * @get 获得本地坐标下z的值
     */
    get z(): number {
        return this._position.z;
    }

    /**
     * @set 设置本地坐标下z的值
     */
    set z(z: number) {
        this._position.z = z;
        this.updateWorldPosition();
    }



    /**
     * @get 获得世界坐标系角度
     * @readonly
     */
    get worldAngle() {
        return this._worldAngle;
    }

    // /**
    //  * @set 设置世界坐标系角度
    //  */
    // set worldAngle(angle: number) {
    //     this._worldAngle = angle;
    //     this.updateLocalAngle();
    // }




    /**
     * @get 获得本地坐标系角度
     */
    get angle() {
        return this._angle;
    }

    /**
     * @set 设置本地坐标系角度
     */
    set angle(angle: number) {
        this._angle = angle;
        this.updateWorldAngle();
    }



    /**
     * @get 获得锚点
     */
    get anchor(): Vec2 {
        return this._anchor;
    }

    /**
     * @set 设置锚点
     */
    set anchor(anchor: Vec2) {
        this._anchor = anchor;
        this.updateAnchor();
    }



    /**
     * 返回宽高对象
     */
    get size(): Vec2 {
        return new Vec2(this._rect.w, this._rect.h);
    }

    /**
     * 设置宽高对象
     */
    set size(size: Vec2) {
        this._rect.w = size.width;
        this._rect.h = size.height;
        this.updateSize();
    }

    /**
     * 返回width
     */
    get width(): number {
        return this._rect.width;
    }

    /**
     * 设置width
     */
    set width(width: number) {
        this._rect.w = width;
        this.updateSize();
    }

    /**
     * 返回height
     */
    get height(): number {
        return this._rect.height;
    }

    /**
     * 设置height
     */
    set height(height: number) {
        this._rect.height = height;
        this.updateSize();
    }

    /**
     * @description transform的右边界框
     * @readonly
     */
    get right(): number {
        return this.position.x + this.width / 2;
    }

    /**
     * @description transform的上边界框
     */
    get top(): number {
        return this.position.y + this.height / 2;
    }

    /**
     * @description transform的左边界框
     */
    get left(): number {
        return this.position.x - this.width / 2;
    }

    /**
     * @description transform的下边界框
     */
    get down() {
        return this.position.y - this.height / 2;
    }

    /**
     * @description 获得世界缩放尺寸
     */
    get scale(): Vec2 {
        return this._scale;
    }

    /**
     * @description 设置世界缩放尺寸
     */
    setScale(scale: Vec2) {
        this._scale = scale;
        this.updateWorldScale();
        this.updateForChildrenAndGraphic();
    }

    /**
     * @description 获得x轴缩放值
     */
    get scaleX(): number {
        return this._scale.x;
    }

    /**
     * @description 设置x轴缩放值
     */
    set scaleX(scalex: number) {
        this._scale.x = scalex;
        this.updateWorldScale();
        this.updateForChildrenAndGraphic();
    }

    /**
     * @description 获得y轴缩放值
     */
    get scaleY(): number {
        return this._scale.y;
    }

    /**
     * @description 获得y轴缩放值
     */
    set scaleY(scaley: number) {
        this._scale.y = scaley;
        this.updateWorldScale();
        this.updateForChildrenAndGraphic();
    }


    /**
     * @description 获得世界缩放尺寸
     */
    get worldScale(): Vec2 {
        return this._worldScale;
    }

    // /**
    //  * @description 设置世界缩放尺寸
    //  */
    // set worldScale(scale: Vec2) {
    //     this._worldScale = scale;
    //     this.updateLocalScale();
    // }

    /**
     * @description 获得世界x轴缩放值
     */
    get worldScaleX(): number {
        return this._worldScale.x;
    }

    // /**
    //  * @description 设置世界x轴缩放值
    //  */
    // set worldScaleX(scalex: number) {
    //     this._worldScale.x = scalex;
    //     this.updateLocalScale();
    // }

    /**
     * @description 获得世界y轴缩放值
     */
    get worldScaleY(): number {
        return this._worldScale.y;
    }

    // /**
    //  * @description 设置世界y轴缩放值
    //  */
    // set worldScaleY(scaley: number) {
    //     this._worldScale.y = scaley;
    //     this.updateLocalScale();
    // }
    get parent(): Transform {
        if (!this.entity) return null;
        return (!this.entity.parent) ? null : this.entity.parent.transform;
    }
    get children(): Transform[] {
        if (!this.entity) return [];
        return this.entity.children.map((child) => { return child.transform });
    }

    get color() {
        return this._color;
    }
    set color(color: Color) {
        this._color = color;
        this.updateColorGraphic();
    }
    /**
     * @description 对transform做tween补间动画
     * @todo
     */
    tween() {

    }

    getRect(): Rect {
        return this._rect;
    }

    updateForParent() {
        const parent = this.parent;
        if (!parent) return;
        this.updateScaleGraphic();
        this.updateWorldPosition();
        this.updateWorldScale();
    }

    updateChildren() {
        const children = this.children;
        if (!children || children.length == 0) return;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            child.updateForParent();
        }
    }

    updateForChildrenAndGraphic() {
        this.updateScaleGraphic();
        this.updateChildren();
    }
    updateScaleGraphic() {
        if (!this.entity || !this.entity.graphic) return;
        this.entity.graphic.updateScale();
    }
    /**
 * @todo 如果绑定的entity上的graphic组件实现transformColor接口，则通过updateRenderColor更新颜色
 */
    updateColorGraphic() {
        this.entity.graphic.updateNormalColor();
    }
    // updateLocalScale() {

    // }
    updateWorldScale() {
        if (this.parent && this.parent.parent) {
            this._worldScale = new Vec2(this.parent.worldScaleX * this.parent.scaleX, this.parent.worldScaleY * this.parent.scaleY);
            console.log("entity3", this.entity.name);
        } else if (this.parent && !this.parent.parent) {
            this._worldScale = new Vec2(this.parent.worldScaleX, this.parent.worldScaleY);
            console.log("entity2", this.entity.name);
        } else {
            this._worldScale = new Vec2(this.scale.x, this.scale.y);
            console.log("entity1", this._worldScale);
        }
    }
    updateSize() {

    }
    updateAnchor() {

    }
    // updateLocalAngle() {
    //     this._angle = this.parent ? this._worldAngle - this.parent.worldAngle : this._worldAngle;
    //     this.updateChildren();
    // }
    updateWorldAngle() {
        this._worldAngle = this.parent ? this.parent.worldAngle + this._angle : this._angle;
        this.updateChildren();
    }
    setPosition(x: number);
    setPosition(x: number, y: number);
    setPosition(vec2: IVec2);
    setPosition(vec3: IVec3);
    setPosition(value1?: IVec3 | IVec2 | number, value2?: number) {
        if (typeof value1 === "number") {
            this._position.x = value1;
            this._position.y = (value2 || value2 == 0) ? value2 : this._position.y;
        } else {
            this._position.x = value1.x;
            this._position.y = value1.y;
            if (value1["z"]) {
                this._position.z = (value1 as IVec3).z;
            }
        }
        this.updateWorldPosition();
    }
    /**
     * @todo 感觉parent为空的时候对坐标的处理还有些问题
     */
    updateWorldPosition() {
        this._worldPosition.x = this.parent ? this.parent.worldPosition.x + this.x : this.x;
        this._worldPosition.y = this.parent ? this.parent.worldPosition.y + this.y : this.y;
        this._worldPosition.z = this.parent ? this.parent.worldPosition.z + this.z : this.z;
        if (this.entity) {

            console.log("parentPosX", this.parent && this.parent.worldPosition.x);
            console.log("localX", this.x);
            console.log(this.entity.name, this._worldPosition.x);
        }
        if (this.entity) Rabbit.Instance.world.eventSystem.sendMessage(new EventDisPatcher(EventType.POSITION_CHANGED, this.entity));
        this.updateRect();
        this.updateChildren();
    }
    updateLocalPosition() {
        this._position.x = this.parent ? (this.worldPosition.x - this.parent.worldPosition.x) : this.worldX;
        this._position.y = this.parent ? (this.worldPosition.y - this.parent.worldPosition.y) : this.worldY;
        this._position.z = this.parent ? this.worldPosition.z - this.parent.worldPosition.z : this.worldZ;
        if (this.entity) Rabbit.Instance.world.eventSystem.sendMessage(new EventDisPatcher(EventType.POSITION_CHANGED, this.entity));
        this.updateRect();
        this.updateChildren();
    }
    updateRect() {
        this._rect.x = this.worldPosition.x;
        this._rect.y = this.worldPosition.y;
    }
    static calcNewPoint(p: IVec2, pCenter: IVec2, angle: number): Vec2 {
        // calc arc 
        let l: number = ((angle * Math.PI) / 180);

        //sin/cos value
        let cosv: number = Math.cos(l);
        let sinv: number = Math.sin(l);

        // calc new point
        const newX: number = ((p.x - pCenter.x) * cosv - (p.y - pCenter.y) * sinv + pCenter.x);
        const newY: number = ((p.x - pCenter.x) * sinv + (p.y - pCenter.y) * cosv + pCenter.y);
        return new Vec2(newX, newY);
    }
}
@rClass
export class Entity extends RabObject {

    /**
     * 系统事件类型
     */
    static EventType = EventType;
    /**
     * 实体的变换组件
     */
    transform: Transform;

    /**
     * 实体的渲染组件
     */
    graphic: GraphicComponent;

    /**
     * 实体的类型字符串
     */
    type: string;

    /**
     * 实体所属场景
     */
    world: World;

    /**
     * 实体的名称
     */
    name: string;

    /**
     * 实体的id
     */
    id: number;

    /**
     * 实体是否激活
     */
    private _active: boolean = true;
    get active() {
        return this._active;
    }
    set active(value: boolean) {
        this._active = value;
    }
    private _isActiveOnRemoved: boolean = true;
    private _isRemoved: boolean = false;
    get isRemoved() {
        return this._isRemoved;
    }
    set isRemoved(value: boolean) {
        this._isRemoved = value;
        if (this._isRemoved) {
            this._isActiveOnRemoved = this.active;
            this.active = false;
        } else {
            this.active = this._isActiveOnRemoved;
        }
    }
    /**
     * 实体拥有的所有组件
     */
    components: Component[] = [];

    /**
     * 实体拥有的所有子实体
     */
    children: Entity[] = [];

    /**
     * 实体的父实体
     */
    private _parent: Entity = null;
    get parent() {
        return this._parent;
    }
    set parent(parent: Entity) {
        this.setParent(parent);
    }

    /**
     * @constructor 实体的构造器函数
     * @param x 实体x坐标（可选）
     * @param y 实体y坐标（可选）
     * @todo name的命名制定一套规则
     */
    constructor(name?: string, x?: number, y?: number, width?: number, height?: number, scalex?: number, scaley?: number) {
        super();
        this.name = name ? name : "entity" + Math.floor(Math.random() * 100000);
        this.transform = this.addComponent(Transform);
        this.transform.init(x, y, width, height, scalex, scaley);
        this.type = "entity";
        this.world = null;
    }

    onDestroy() { };

    onAdd() {

    }

    collide(rect: Rect) {
        return false;
    }

    draw() {
        // Debug.log("进来了draw")
        if (this.active && this.graphic && this.graphic.visible) {
            this.graphic.draw();
        }
    }

    start() {
        Debug.log(this.name + " start执行");
        const len: number = this.components.length;
        if (len == 0) return;
        for (let i = 0; i < len; i++) {
            this.components[i]._onLoad();
        }
    }

    update(dtime) {
        const len: number = this.components.length;
        if (len == 0) return;
        for (let i = 0; i < len; i++) {
            this.components[i].update(dtime);
        }
    }

    addComponent(className: string): Component;
    addComponent<T extends Component>(com: { new(): T }): T;
    addComponent<T extends Component>(com: string | { new(): T }): any {
        let newCom: Component = null;
        if (typeof com == "string") {
            try {
                if (rabbitClass[com]) {
                    newCom = new rabbitClass[com].prototype.constructor();
                } else {
                    Debug.log("不存在此component", com);
                }
            } catch (e) {
                Debug.error("通过string字符串addComponent出错", e);
            }
        } else {
            try {
                newCom = new com();
            } catch (e) {
                Debug.error("通过传入类addComponent错误，可能原因为类实现有误");
            }
        }
        if (newCom) {
            this.components.push(newCom);
            newCom.entity = this;
            if (newCom["draw"]) {
                this.graphic = newCom as GraphicComponent;
            }
            if (Rabbit.Instance.isRabbitRun) {
                newCom._onLoad();
            }
        }
        return newCom as T;
    }

    getComponent(className: string): Component;
    getComponent<T extends Component>(type: { prototype: T }): T;
    getComponent<T extends Component>(type: string | { prototype: T }): any {
        // Debug.log("test",new TestPro().__proto__.constructor.name);
        // Debug.log("test",TestPro.prototype.constructor.name);
        if (typeof type == "string") {
            for (let i = 0; i < this.components.length; i++) {
                const com = this.components[i];
                if ((com as any).__proto__.constructor.name == type) {
                    return (com as T);
                }
            }
        } else {
            for (let i = 0; i < this.components.length; i++) {
                const com = this.components[i];
                if ((com as any).__proto__.constructor.name == (type as any).prototype.constructor.name) {
                    return (com as T);
                }
            }
        }
        return null;
    }

    /**
     * 在当前实体下增加子实体
     * @param child 
     */
    addChild(child: Entity) {
        if (!child) return Debug.warn("要添加的子节点不存在");
        if (child.parent) child.parent.removeChild(this);
        child._parent = this;
        // child.transform.parent = this.transform;
        this.children.push(child);
        this.world.add(child);
        child.transform.updateWorldPosition();
    }

    /**
     * 移除一个子实体
     * @param child 要移除的子实体
     */
    removeChild(child: Entity) {
        EngineTools.deleteItemFromList(child, this.children);
    }

    /**
     * 摧毁自己
     */
    destroy() {
        this.world.destroyEntity(this);
    }

    /**
     * 移除自己
     */
    remove() {
        this.world.removeEntity(this);
    }

    /**
     * 设置当前实体的父实体
     * @param parent 
     */
    setParent(parent: Entity) {
        if (!parent) {
            if (this.parent) this.parent.removeChild(this);
            this._parent = null;
        } else {
            parent.addChild(this);
        }
    }

    listen(event: EventType | string, func: Function, bind?: Object) {
        Rabbit.Instance.eventSystem.addListener(new EventListener(event, func, bind, this, false));
    }
    listenOnce(event: EventType | string, func: Function, bind?: Object) {
        Rabbit.Instance.eventSystem.addListener(new EventListener(event, func, bind, this, true));
    }
    listenOff(event: EventType | string, func?: Function, bind?: Object) {
        Rabbit.Instance.eventSystem.removeListener(event, func, bind);
    }
}

@rClass
export class Sfx extends RabObject {

    soundUrl: string;
    audio: HTMLAudioElement;
    constructor(soundurl) {
        super();
        this.soundUrl = soundurl;
    }

    play() {
        this.audio = Rabbit.loadAudio(this.soundUrl);
        this.audio.play();
    }
}

/**
 * 音频系统类
 * @description 可调用静态方法直接播放音乐
 * @todo 区分音效和背景音乐播放功能
 * @todo 暂定功能
 * @todo 停止功能
 */
@rClass
export class AudioSystem extends RabObject {

    static play(soundurl) {
        const audio = Rabbit.loadAudio(soundurl);
        audio.play();
    }
}

/**
 * 游戏场景类
 * @todo 加载完成依赖的本地资源后再启动
 */
@rClass
export class World extends RabObject {


    /**
     * 游戏场景的名称，具有唯一性
     */
    name: string;

    /**
     * 游戏中所有实体的索引集合
     */
    entities: Entity[] = [];

    /**
     * 游戏中所有要移除的实体集合，在update事件时移除
     */
    preDestroys: Entity[] = [];

    /**
     * 移除贮存的实体集合
     */
    removes: Entity[] = [];
    /**
     * 简单的实体id区分，每增加一个实体id增加
     */
    maxId: number = 0;

    /**
     * 实体管理系统唯一实例
     */
    entitySystem: EntitySystem = Rabbit.Instance.entitySystem;

    /**
     * 事件管理系统唯一实例
     */
    eventSystem: EventSystem = Rabbit.Instance.eventSystem;

    /**
     * 补间动画管理系统唯一实例
     */
    tweenSystem: TweenSystem = Rabbit.Instance.tweenSystem;
    /**
     * 事件监听器集合
     */
    eventListeners: EventListener[] = [];

    /**
     * tween动画集合
     */
    tweens: Tween<any>[] = [];
    /**
     * 构造器函数，调用创建一个场景
     * @param name 游戏场景的名称
     */
    constructor(name: string) {
        super();
        this.name = name;
    }

    /**
     * 世界初始化方法，应在其中做Entity实例化等场景构建操作
     */
    init: () => void;

    /**
     * 在世界中增加实体
     * @param e 要增加的实体
     */
    add(e: Entity) {
        this.entitySystem.add(e);
    }

    /**
     * 在世界中删除实体
     * @param e 要删除的实体
     */
    destroyEntity(e: Entity) {
        this.entitySystem.destroyEntity(e);
    }
    /**
     * 在世界中移除实体，移除实体并不会清理实体，而是被贮存等待恢复
     * @param e 要删除的实体
     */
    removeEntity(e: Entity) {
        this.entitySystem.removeEntity(e);
    }
    /**
     * 排序并派发世界中所有有渲染组件的实体执行渲染任务
     */
    draw() {
        this.entitySystem.draw();
    }

    /**
     * 使用过滤器函数得到相应的实体数组
     * @param filtfunc 过滤器函数
     * @return 实体数组
     */
    filter(filtfunc: (e: Entity) => boolean): Entity[] {
        let entities: Entity[] = [];
        for (let i = 0; i < this.entities.length; ++i) {
            if (filtfunc(this.entities[i])) {
                entities.push(this.entities[i]);
            }
        }
        return entities;
    }

    /**
     * 从场景中所有实体中筛选获得被标记为同一type的实体集合
     * @param type 实体类型
     */
    getType(type: string) {
        return this.filter((e) => { return e.type == type; });
    }

    /**
     * 按键按下事件
     */
    keyDown(key: number) {
        this.eventSystem.keyDown(key);
    }

    /**
     * 按键弹起事件
     */
    keyUp(key: number) {
        this.eventSystem.keyUp(key);
    }
    /**
     * 按键按住事件
     */
    keyPress(key: number) {
        this.eventSystem.keyPress(key);
    }
    /**
     * 鼠标按下事件
     */
    mouseDown(event: MouseEvent) {
        const mouseEvent = new RabbitMouseEvent(event);
        this.eventSystem.mouseDown(mouseEvent);
    }
    /**
     * 鼠标按住事件
     */
    mousePress(event: MouseEvent) {
        const mouseEvent = new RabbitMouseEvent(event);
        this.eventSystem.mousePress(mouseEvent);
    }
    /**
     * 鼠标抬起事件
     */
    mouseUp(event: MouseEvent) {
        const mouseEvent = new RabbitMouseEvent(event);
        this.eventSystem.mouseUp(mouseEvent);
    }
    /**
     * 鼠标出屏事件
     */
    mouseOut(event: MouseEvent) {
        const mouseEvent = new RabbitMouseEvent(event);
        this.eventSystem.mouseOut(mouseEvent);
    }
    /**
     * 按键按下事件，无需手动调用
     */
    update(dtime: number) {
        this.eventSystem.update(dtime);
        this.tweenSystem.update(dtime);
    }

    /**
     * start事件，无需手动调用
     */
    start() {
        Debug.log("start事件总线执行")
        this.eventSystem.start();
    }

    /**
     * stop事件，无需手动调用
     */
    stop() {
        this.entities = [];
        this.preDestroys = [];
        this.eventListeners = [];
        this.tweens = [];
        this.maxId = 0;
    }

    /**
     * 碰撞事件，无需手动调用
     */
    collide(rect: Rect) {
        let collisions: Collision[] = [];
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (entity.graphic == null) continue;
            const entRect = new Rect(entity.graphic.x, entity.graphic.y, entity.graphic.w, entity.graphic.h);
            if (rect.collideRect(entRect)) collisions.push(new Collision(entity, entRect));
        }
        return collisions;
    }
}

/**
 * 碰撞类
 * @todo 这个类需编写测试用例来完成
 * @todo 继承Component
 */
@rClass
export class Collision {
    other: Collision;
    rect: Rect;
    constructor(other, rect) {
        this.other = other;
        this.rect = rect;
    }
}

/**
 * 图形组件
 * @description 所有渲染组件都需继承该组件
 */
@rClass
export class GraphicComponent extends Component {
    x: number = 0;
    y: number = 0;
    z: number = 0;
    w: number = 0;
    h: number = 0;
    visible: boolean = true;
    updateNormalColor() {

    }
    updateScale() {

    }
    draw() {

    }
}

/**
 * 文字锚点位置枚举
 * @enum 
 */
export enum TextAlignType {
    left = "left",
    right = "right",
    center = "center",
    start = "start",
    end = "end",
}
/**
 * @rClass 颜色类
 */
@rClass
export class Color {

    static isNumberAndAToZ(str): boolean {
        return /^[\da-z]+$/i.test(str);
    }
    static isHex(hexlike: string): boolean {
        if ((hexlike.length != 7) || (hexlike[0] != "#") || !this.isNumberAndAToZ(hexlike.substring(1, hexlike.length))) return false;
        return true;
    }
    static hexToRgb(hex: string) {
        return { r: parseInt("0x" + hex.slice(1, 3)), g: parseInt("0x" + hex.slice(3, 5)), b: parseInt("0x" + hex.slice(5, 7)) };
    }
    static rgbToHex(r: number, g: number, b: number) {
        return ((r << 16) | (g << 8) | b).toString(16);
    }
    _r: number;
    get r(): number {
        return this._r;
    }
    set r(r: number) {
        this._r = r;
    }
    _g: number;
    get g(): number {
        return this._g;
    }
    set g(g: number) {
        this._g = g;
    }
    _b: number;
    get b(): number {
        return this._b;
    }
    set b(b: number) {
        this._b = b;
    }
    _alpha: number = 1;
    get alpha() {
        return this._alpha;
    }
    set alpha(alpha: number) {
        this._alpha = alpha;
    }

    constructor(hex: string);
    constructor(r: number, g: number, b: number);
    constructor(r: number, g: number, b: number, a: number);
    constructor(rorhex: number | string, g?: number, b?: number, a?: number) {
        if (typeof rorhex === "string") {
            if (Color.isHex(rorhex)) {
                const rgbData = Color.hexToRgb(rorhex);
                this.r = rgbData.r;
                this.g = rgbData.g;
                this.b = rgbData.b;
            } else {
                Debug.warn("通过hex码初始化颜色错误");
                this.r = 0;
                this.g = 0;
                this.b = 0;
                this.alpha = a ? a : 1;
            }
        } else {
            this.r = rorhex;
            this.g = g;
            this.b = b;
        }
    }

    static get BLACK() {
        return new Color("#000000");
    }
    static get WHITE() {

        return new Color("#FFFFFF");
    }
    static get RED() {
        return new Color("#FF0000");
    }
    static get YELLOW() {
        return new Color("FFFF00");
    }
    static get BLUE() {
        return new Color("#0000FF");
    }
    static get GREEN() {
        return new Color("#008000");
    }
    static get ORANGE() {
        return new Color("#FFA500");
    }
    static get PINK() {
        return new Color("#FFC0CB");
    }
}
/**
 * @rClass 文本组件
 */
@rClass
export class Text extends GraphicComponent {
    static TextAlignType: typeof TextAlignType = TextAlignType;
    private _text: string;
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
        this.updateSize();
    }
    font: string;
    colour: string;
    textSize: number;
    align: TextAlignType;

    /**
     * @todo
     */
    lineHeight: number;

    constructor(x?, y?, text?, font?, colour?, size?, align?) {
        super();
        // this.x = x || 0;
        // this.y = y || 0;
        this.text = text || "";
        this.font = font || "sans";
        this.colour = colour || "white";
        this.textSize = size || 14;
        this.align = align || "left";
        Rabbit.Instance.context.textBaseline = 'top';
        Rabbit.Instance.context.textAlign = this.align;
        Rabbit.Instance.context.font = this.textSize + "px " + this.font;
        Rabbit.Instance.context.fillStyle = this.colour;
        this.w = Rabbit.Instance.context.measureText(text).width;
        this.h = this.textSize;

        // Debug.log("x", this.x);
        // Debug.log("y", this.y);
        // Debug.log("width", this.w);
        // Debug.log("height", this.h);
        // Debug.log("text", this.text);
        // Debug.log("font", this.font);
        // Debug.log("colour", this.colour);
        // Debug.log("size", this.size);

        // Debug.log("textBaseline", Rabbit.Instance.context.textBaseline);
        // Debug.log("font", Rabbit.Instance.context.font);
        // Debug.log("fillStyle", Rabbit.Instance.context.fillStyle);
        // Debug.log("context", Rabbit.Instance.context);

    }

    setAlign(align: TextAlignType) {
        this.align = align;
    }
    updateNormalColor() {

    }
    updateScale() {
    }
    draw() {
        const ctx = Rabbit.Instance.context;
        const transform = this.entity.transform;

        ctx.save();
        ctx.textBaseline = 'top';
        ctx.textAlign = this.align;
        ctx.font = this.textSize + "px " + this.font;
        ctx.fillStyle = this.colour;


        const selfAngle: number = transform.worldAngle * Math.PI / 180;


        ctx.translate(transform.worldX, transform.worldY);
        ctx.rotate(selfAngle);
        ctx.scale(transform.scaleX, transform.scaleY);
        /**
         * @todo 放大后是否需要对translate做处理？
         */
        ctx.translate(-transform.worldX, -transform.worldY);


        if (transform.parent) {
            const parentAngle = transform.parent.worldAngle * Math.PI / 180;
            ctx.translate(transform.parent.worldX, transform.parent.worldY);
            ctx.scale(transform.worldScaleX, transform.worldScaleY);
            ctx.rotate(parentAngle);
            this.renderText(this.text, transform.x, transform.y);
        } else {
            ctx.translate(transform.worldX, transform.worldY);
            ctx.scale(transform.worldScaleX, transform.worldScaleY);
            this.renderText(this.text, 0, 0);
        }

        ctx.restore();

        if (Rabbit.Instance.debugMode) {
            ctx.save();
            const rect = transform.getRect();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            ctx.strokeRect(rect.x - rect.width / 2, rect.y - rect.height / 2, rect.width, rect.height);
            ctx.restore();
        }
    }

    renderText(origintext: string, x: number, y: number, isupdatesize?: boolean) {
        y -= this.h / 2;
        const textArr: string[] = origintext.split("\n");
        const ctx = Rabbit.Instance.context;
        for (let i = 0; i < textArr.length; i++) {
            const text: string = textArr[i];
            ctx.fillText(text, x, y);
            y += this.textSize;
        }

    }
    updateSize() {
        this.h = 0;
        this.w = 0;
        const textArr: string[] = this.text.split("\n");
        for (let i = 0; i < textArr.length; i++) {
            const text: string = textArr[i];
            this.h += this.textSize;
            const nowWidth = Rabbit.Instance.context.measureText(text).width;
            this.w = nowWidth > this.w ? nowWidth : this.w;
        }
        if (this.entity) {
            this.entity.transform.size = new Vec2(this.w, this.h);
        }
    }
    update(time) {

    }
}
function writeTextOnCanvas(cns, lh, rw, text) {
    cns = document.getElementById(cns);
    var ctx = cns.getContext("2d");
    var lineheight = lh;
    var text = text;

    ctx.width = cns.width;
    ctx.height = cns.height;

    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.font = "16px 微软雅黑";
    ctx.fillStyle = "#f00";

    function getTrueLength(str) { //获取字符串的真实长度（字节长度）
        var len = str.length,
            truelen = 0;
        for (var x = 0; x < len; x++) {
            if (str.charCodeAt(x) > 128) {
                truelen += 2;
            } else {
                truelen += 1;
            }
        }
        return truelen;
    }

    function cutString(str, leng) { //按字节长度截取字符串，返回substr截取位置
        var len = str.length,
            tlen = len,
            nlen = 0;
        for (var x = 0; x < len; x++) {
            if (str.charCodeAt(x) > 128) {
                if (nlen + 2 < leng) {
                    nlen += 2;
                } else {
                    tlen = x;
                    break;
                }
            } else {
                if (nlen + 1 < leng) {
                    nlen += 1;
                } else {
                    tlen = x;
                    break;
                }
            }
        }
        return tlen;
    }
    for (var i = 1; getTrueLength(text) > 0; i++) {
        var tl = cutString(text, rw);
        ctx.fillText(text.substr(0, tl).replace(/^\s+|\s+$/, ""), 10, i * lineheight + 50);
        text = text.substr(tl);
    }
}

/**
 * @deprecated 已弃用
 */
@rClass
export class BoundingBox extends RabObject {
    left: number;
    right: number;
    top: number;
    down: number;
    constructor();
    constructor(rect: Rect);
    constructor(x: number, y: number, width: number, height: number);
    constructor(v1?: Rect | number, v2?: number, v3?: number, v4?: number) {
        super();
        if (typeof v1 === "object") {
            this.left = v1.x - v1.w / 2;
            this.right = v1.x + v1.w / 2;
            this.top = v1.y + v1.h / 2;
            this.down = v1.y - v1.h / 2;
        } else {
            this.left = v1 - v3 / 2;
            this.right = v1 + v3 / 2;
            this.top = v2 + v4 / 2;
            this.down = v2 - v4 / 2;
        }
    }
}
@rClass
export class Rect extends RabObject {
    x: number;
    y: number;
    _width: number;
    set w(value: number) {
        this._width = value;
    }
    get w() {
        return this._width;
    }
    set width(value: number) {
        this._width = value;
    }
    get width() {
        return this._width;
    }
    _height: number;
    set h(value: number) {
        this._height = value;
    }
    get h() {
        return this._height;
    }
    set height(value: number) {
        this._height = value;
    }
    get height() {
        return this._height;
    }
    constructor(x?, y?, w?, h?) {
        super();
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.w = w ? w : 0;
        this.h = h ? h : 0;
    }

    bottom() {
        return this.y + this.h;
    }

    collidePoint(point: number[]) {
        return (
            point[0] >= this.x - this.w / 2 &&
            point[0] < this.x + this.w / 2 &&
            point[1] >= this.y - this.h / 2 &&
            point[1] < this.y + this.h / 2
        );
    }

    collideRect(rect) {
        if (this.x > rect.x + rect.w)
            return false;
        if (rect.x > this.x + this.w)
            return false;
        if (this.y > rect.y + rect.h)
            return false;
        if (rect.y > this.y + this.h)
            return false;
        return true;
    }

    intersects(rect) {
        return this.collideRect(rect);
    }

    left() {
        return this.x;
    }

    place(pos) {
        this.x = pos[0];
        this.y = pos[1];
    }

    right() {
        return this.x + this.w;
    }

    top() {
        return this.y;
    }
}
@rClass
export class Circle extends RabObject {
    x: number;
    y: number;
    radius: number;
    constructor(x: number, y: number, radius: number) {
        super();
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    collideCircle(circle) {
        var dx = this.x - circle.x;
        var dy = this.y - circle.y;
        var sqDistance = dx * dx + dy * dy;

        var r = this.radius + circle.radius;
        var collide = (sqDistance <= r * r);
        return collide;
    }

    collidePoint(point) {
        var d = [point[0] - this.x, point[1] - this.y];
        return (d[0] * d[0] + d[1] * d[1] <= this.radius * this.radius);
    }

    place(pos) {
        this.x = pos[0];
        this.y = pos[1];
    }
};
@rClass
export class GraphicList extends GraphicComponent {
    graphics: GraphicComponent[];
    setGraphics(graphics: GraphicComponent[]) {
        this.graphics = graphics;
    }
    constructor(graphics?) {
        super();
        this.graphics = graphics || [];
    }

    draw() {
        Rabbit.Instance.context.save();
        Rabbit.Instance.context.translate(this.x, this.y);
        for (let i = 0; i < this.graphics.length; ++i) {
            this.graphics[i].draw();
        }
        Rabbit.Instance.context.restore();
    }

    pop() {
        this.graphics.pop();
    }

    push(graphic) {
        this.graphics.push(graphic);
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        for (let i = 0; i < this.graphics.length; ++i) {
            this.graphics[i].x += dx;
            this.graphics[i].y += dy;
        }
    }

    place(pos) {
        var dx = pos[0] - this.x;
        var dy = pos[1] - this.y;
        this.move(dx, dy);
    }

    destroy(graphic) {
        for (let g = 0; g < this.graphics.length; ++g) {
            if (this.graphics[g] == graphic)
                this.graphics.slice(g);
        }
    }

    shift() {
        this.graphics.shift();
    }

    unshift(graphic) {
        this.graphics.unshift(graphic);
    }

    update(dtime) {
        for (var g = 0; g < this.graphics.length; ++g) {
            this.graphics[g].update(dtime);
        }
    }
}
@rClass
export class RabImage extends GraphicComponent {

    _x: number;
    _y: number;
    alpha: number;
    _imageUrl: string;
    get imageUrl() {
        return this._imageUrl;
    }
    set imageUrl(value: string) {
        this._imageUrl = value;
        this.image = Rabbit.loadImage(value);
        this.w = this.image.width;
        this.h = this.image.height;
    }

    image: HTMLImageElement;
    ignoreCamera: boolean = false;
    constructor(x?: number, y?: number, image?: string) {
        super();
        this._x = x ? x : 0;
        this._y = y ? y : 0;
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.alpha = 1;
        if (image) this.image = Rabbit.loadImage(image);
    }

    async setImageAsync(url: string) {
        this._imageUrl = url;
        this.image = await Rabbit.loadImageAsync(url);
        this.w = this.image.width;
        this.h = this.image.height;
    }

    draw() {
        if (!this.image || !(this.image as any).valid) return;


        Rabbit.Instance.context.save();
        Rabbit.Instance.context.globalAlpha = this.alpha;
        if (this.ignoreCamera)
            Rabbit.Instance.context.translate(Math.floor(this._x), Math.floor(this._y));
        else
            Rabbit.Instance.context.translate(Math.floor(this._x + Rabbit.Instance.camera.x), Math.floor(this._y + Rabbit.Instance.camera.y));

        // Debug.log("camera",Rabbit.Instance.camera);
        Rabbit.Instance.context.drawImage(this.image, 0, 0);
        Rabbit.Instance.context.globalAlpha = 1;
        Rabbit.Instance.context.restore();
    }

    update(dtime) {
        if (!this.image) return;
        Rabbit.Instance.context.save();
        if (this.ignoreCamera)
            Rabbit.Instance.context.translate(Math.floor(this._x), Math.floor(this._y));
        else
            Rabbit.Instance.context.translate(Math.floor(this._x + Rabbit.Instance.camera.x), Math.floor(this._y + Rabbit.Instance.camera.y));
        Rabbit.Instance.context.clearRect(0, 0, Math.round(this.w), Math.round(this.h));
        Rabbit.Instance.context.restore();
        this.x = this.entity.transform.worldX;
        this.y = this.entity.transform.worldY;
        this._x = this.x;
        this._y = this.y;
        this.w = this.image.width;
        this.h = this.image.height;
    }
}

/**
 * 直接绑定Canvas对象，每个场景中只能有一个
 */
@rClass
export class Canvas extends Component {
    /**
     * Canvas唯一实例
     */
    static Instance: Canvas;
    /**
     * @description 设计分辨率
     */
    resolution: { width: number, height: number };
    /**
     * 适配宽度
     * @todo 整体适配相关方法
     */
    isFitWidth: boolean = false;
    /**
     * 适配高度
     * @todo 整体适配相关方法
     */
    isFitHeight: boolean = true;
    /**
     * @todo 应该对多出来的Canvas做销毁操作
     */
    constructor() {
        super();
        if (Canvas.Instance) return null;
        Canvas.Instance = this;
        Rabbit.Instance.canvas = this;
        this.resolution = {
            width: Rabbit.Instance.htmlCanvas.width,
            height: Rabbit.Instance.htmlCanvas.height
        }
        Debug.log("Canvas width: ", this.resolution.width)
        Debug.log("Canvas height: ", this.resolution.height)
    }
    onLoad() {
        this.entity.transform.width = this.resolution.width;
        this.entity.transform.height = this.resolution.height;
    }
}
@rClass
export class Sprite extends GraphicComponent {
    private _x: any;
    private _y: any;
    origin: number[];
    scale: number;
    image: HTMLImageElement;
    frame: number;
    animations: {};
    animation: number[];
    fps: number;
    time: number;
    frameWidth: number;
    frameHeight: number;
    flip: boolean;
    alpha: number;
    angle: number;
    ignoreCamera: boolean = false;
    playing: any;
    loop: any;
    constructor(x, y, image, frameW, frameH) {
        super();
        this._x = x;
        this._y = y;
        this.x = x;
        this.y = y;
        this.origin = [0, 0];
        this.scale = 1;
        this.image = Rabbit.loadImage(image);

        this.frame = 0;
        this.animations = {};
        this.animations = null;
        this.animation = [];
        this.fps = 0;
        this.time = 0;
        this.frameWidth = frameW;
        this.frameHeight = frameH;
        this.flip = false;
        this.alpha = 1;
        this.angle = 0;
    }

    add(animation, frames) {
        this.animations[animation] = frames;
    }

    draw() {
        if (!(this.image as any).valid) return;
        var fx = 0;
        var fy = 0;
        var ox = 0;
        var oy = 0;
        if (this.animation) {
            var frame = this.animation[this.frame];
            var rowLength = Math.floor(this.image.width / this.frameWidth);
            fx = (frame % rowLength) * this.frameWidth;
            fy = Math.floor(frame / rowLength) * this.frameHeight;
        }
        Rabbit.Instance.context.save();
        Rabbit.Instance.context.globalAlpha = this.alpha;

        this._x = this.x; this._y = this.y;
        if (this.ignoreCamera)
            Rabbit.Instance.context.translate(Math.floor(this._x), Math.floor(this._y));
        else
            Rabbit.Instance.context.translate(Math.floor(this._x + Rabbit.Instance.camera.x), Math.floor(this._y + Rabbit.Instance.camera.y));

        var midPointX = this.w * 0.5;
        var midPointY = this.h * 0.5;

        Rabbit.Instance.context.translate(midPointX, midPointY);
        Rabbit.Instance.context.rotate(this.angle);
        Rabbit.Instance.context.translate(-midPointX, -midPointY);

        if (this.flip) {
            Rabbit.Instance.context.scale(-1, 1);
            Rabbit.Instance.context.translate(-this.frameWidth, 0);
        }
        Rabbit.Instance.context.drawImage(this.image, fx, fy, this.frameWidth, this.frameHeight, ox, oy, Math.floor(this.frameWidth * this.scale), Math.floor(this.frameHeight * this.scale));
        Rabbit.Instance.context.globalAlpha = 1;
        Rabbit.Instance.context.restore();
    }

    place(pos) {
        this.x = pos[0];
        this.y = pos[1];
    }

    play(animation, fps, loop) {
        this.animation = this.animations[animation];
        this.playing = animation;
        this.fps = fps;
        this.frame = 0;
        this.time = 0;
        this.loop = loop;
        if (loop == undefined) this.loop = true;
    }

    update(dtime) {
        Rabbit.Instance.context.save();
        if (this.ignoreCamera)
            Rabbit.Instance.context.translate(Math.floor(this._x), Math.floor(this._y));
        else
            Rabbit.Instance.context.translate(Math.floor(this._x + Rabbit.Instance.camera.x), Math.floor(this._y + Rabbit.Instance.camera.y));
        Rabbit.Instance.context.clearRect(0, 0, Math.floor(this.w), Math.floor(this.h));
        Rabbit.Instance.context.restore();
        this._x = this.x;
        this._y = this.y;
        this.w = this.frameWidth;
        this.h = this.frameHeight;
        this.time += dtime;

        if (this.fps > 0 && this.time > 1 / this.fps) {
            ++this.frame;
            while (this.time > 1 / this.fps)
                this.time -= 1 / this.fps;
            if (this.frame >= this.animation.length) {
                if (this.loop)
                    this.frame -= this.animation.length;
                else
                    this.frame = this.animation.length - 1;
            }
        }
    }
}
/**
 * 需要重构
 */
@rClass
export class Tilemap extends GraphicComponent {
    gridW: number;
    gridH: number;
    tileW: number;
    tileH: number;
    image: HTMLImageElement;
    canvas: SplashCanvas;
    tiles: number[];
    constructor(x, y, image, tw, th, gw, gh, tiles) {
        super();
        this.x = x;
        this.y = y;
        this.gridW = gw;
        this.gridH = gh;
        this.tileW = tw;
        this.tileH = th;

        this.image = Rabbit.loadImage(image);
        this.canvas = null;
        this.tiles = [];
        for (let i = 0; i < gh; ++i) {
            for (let j = 0; j < gw; ++j) {
                this.tiles.push(0);
            }
        }
    }


    build() {
        this.canvas = new SplashCanvas(this.x, this.y, this.tileW * this.gridW, this.tileH * this.gridH);

        for (var y = 0; y < this.gridH; ++y) {
            for (var x = 0; x < this.gridW; ++x) {
                this.setTile(x, y, this.tile(x, y));
            }
        }
    }

    draw() {
        if (this.canvas)
            this.canvas.draw();
    }

    tile(tx, ty) {
        if (tx < 0 || ty < 0 || tx >= this.gridW || ty >= this.gridH)
            return undefined;
        return this.tiles[ty * this.gridW + tx];
    }

    setTile(tx, ty, tile) {
        if (tx < 0 || ty < 0 || tx >= this.gridW || ty >= this.gridH)
            return;
        this.tiles[ty * this.gridW + tx] = tile;

        var sheetW = Math.floor(this.image.width / this.tileW);
        var sheetH = Math.floor(this.image.height / this.tileH);
        var col = (tile - 1) % (sheetW);
        var row = Math.floor((tile - 1) / sheetW);

        if (this.canvas) {
            var sourceX = col * this.tileW;
            var sourceY = row * this.tileH;

            var destX = tx * this.tileW;
            var destY = ty * this.tileH;

            this.canvas.context.clearRect(destX, destY, this.tileW, this.tileH);
            this.canvas.context.drawImage(this.image, sourceX, sourceY, this.tileW, this.tileH, destX, destY, this.tileW, this.tileH);
        }
    }

    update(dtime) {
        Rabbit.Instance.context.clearRect(Math.floor(this.x - 1), Math.floor(this.y - 1), Math.floor(this.w + 1), Math.floor(this.h + 1));
        if (!this.canvas && (this.image as any).valid) {
            this.build();
        }
    }
}

/**
 * @class 渲染Canvas类
 * @deprecated
 */
@rClass
export class SplashCanvas extends GraphicComponent {

    alpha: number;

    canvas: HTMLCanvasElement;

    context: CanvasRenderingContext2D;

    ignoreCamera: boolean = false;

    constructor(x?: number, y?: number, w?: number, h?: number) {
        super();
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.alpha = 1;
        this.canvas = document.createElement('canvas');
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
    }

    draw() {
        Rabbit.Instance.context.save();
        Rabbit.Instance.context.globalAlpha = this.alpha;

        if (this.ignoreCamera)
            Rabbit.Instance.context.translate(Math.floor(this.x), Math.floor(this.y));
        else
            Rabbit.Instance.context.translate(Math.floor(this.x + Rabbit.Instance.camera.x), Math.floor(this.y + Rabbit.Instance.camera.y));

        Rabbit.Instance.context.drawImage(this.canvas, 0, 0);
        Rabbit.Instance.context.restore();
    }

    update(dtime) {
        Rabbit.Instance.context.clearRect(Math.floor(this.x - 1), Math.floor(this.y - 1), Math.floor(this.w + 1), Math.floor(this.h + 1));
    }
}

/**
 * @class 引擎工具集合类
 */
@rClass
export class EngineTools {
    /**
     * 删除对象数组中一个元素
     * @static
     */
    static deleteItemFromList<T>(item: T, list: T[]) {
        let flag = false;
        for (let i = 0; i < list.length; i++) {
            if (item == list[i]) {
                list.splice(i, 1);
                flag = true;
                break;
            }
        }
        if (!flag) Debug.warn("deleteItemFromList方法未找到要删除的元素");
    }

}
/**
 * @class 调试工具类
 */
@rClass
export class DebugTools {
    static drawRect(trans: Transform) {
        Rabbit.Instance.context.save();
        // console.log("name: ", trans.entity.name);
        // console.log("x: ", rect.x - rect.width / 2);
        // console.log("y: ", rect.y - rect.height / 2);
        // console.log("width: ", rect.width);
        // console.log("height: ", rect.height);
        const rect = trans.getRect();
        Rabbit.Instance.context.lineWidth = 4;
        Rabbit.Instance.context.strokeStyle = "red";
        Rabbit.Instance.context.rect(rect.x - rect.width / 2, rect.y - rect.height / 2, rect.width, rect.height);
        Rabbit.Instance.context.stroke();
        Rabbit.Instance.context.restore();
    }
}
// export { rabbitClass, Rabbit, SplashCanvas, Circle, Collision, Entity, Graphic, GraphicList, RabObject, RabText, Rect, Sfx, Sprite, Tilemap, World, RabKeyType, RabImage, Component, TestComponent };