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
     * Rabbit运行环境构造器函数
     */
    constructor() {
        if (Rabbit.Instance) return;
        Rabbit.Instance = this;
        rabbit = Rabbit.Instance;
        this.entitySystem = new EntitySystem();
        this.compSystem = new CompSystem();
        this.eventSystem = new EventSystem();
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
        console.log("rabbit 初始化完成")
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
    _canvasMouseDown(event: Event): void {
        event.preventDefault();
        this.mouseDown();
    }

    /**
     * 键盘下键按下
     * @param event 
     */
    keyDown(event: KeyboardEvent): void {
        // console.log("event", event);
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
     * 鼠标下键按下
     */
    mouseDown(): void {
        this.world.mouseDown();
        this.mouse.pressed = true;
    }

    /**
     * 鼠标移动
     * @param event 
     */
    mouseMove(event: Event): void {
        var mousePos = Rabbit.Instance._mousePosition(event);
        this.mouse.x = mousePos[0];
        this.mouse.y = mousePos[1];
    }

    /**
     * 鼠标出绘制屏幕
     * @param event 
     */
    mouseOut(event: Event): void {
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
            console.error("runWorld world不存在");
        }
        // console.log("this.world", this.world)
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
        this.world.update(dtime);
        this.context.clearRect(0, 0, this.htmlCanvas.width, this.htmlCanvas.height);
        this.world.draw();
        this.mouse.pressed = false;
        if (this._nextWorld) {
            this.world = this._nextWorld;
            this._nextWorld = null;
        }
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
        Rabbit.Instance.htmlCanvas.onmousemove = (e) => { Rabbit.Instance.mouseMove(e); };
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
        const entities = Rabbit.Instance.world.entities;
        for (let i = entities.length - 1; i >= 0; --i) {
            if (entities[i]) entities[i].keyDown(key);
        }
    }

    keyUp(key: number) {
        const entities = Rabbit.Instance.world.entities;
        for (let i = entities.length - 1; i >= 0; --i) {
            if (entities[i]) entities[i].keyUp(key);
        }
    }

    mouseDown() {
        const entities = Rabbit.Instance.world.entities;
        for (let i = entities.length - 1; i >= 0; --i) {
            if (entities[i]) entities[i].mouseDown();
        }
    }

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
    x: number;
    y: number;
    constructor(x?: number, y?: number) {
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }
}
@rClass
export class Vec3 {
    x: number;
    y: number;
    z: number;
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
export class Transform extends Component {
    position: Vec3;
    localPosition: Vec3;
    angle: number;
    localAngle: number;
    /**
     * @description transform的右边界框right
     */
    get right() {

    }

    get top() {

    }
    get left() {

    }
    get down() {

    }
    localScale: Vec3;
    parent: Transform;

    isChildOf(): bool {

    }
    transformPoint(): Vec3 {

    }
    inverseTransformPoint(): Vec3 {

    }
    tween() {

    }
}
@rClass
export class Entity extends RabObject {

    /**
     * 实体的相对x坐标
     */
    _x: number;

    set x(value: number) {
        this.setPosition(value);
    }
    get x() {
        return this._x;
    }
    /**
     * 实体的相对y坐标
     */
    _y: number;
    set y(value: number) {
        this.setPosition(this._x, value);
    }
    get y() {
        return this._y;
    }
    /**
     * 实体的绝对x坐标
     */
    absX: number;

    /**
     * 实体的绝对y坐标
     */
    absY: number;

    /**
     * 实体的盒子
     */
    rect: Rect;

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
    constructor(name?: string, x?: number, y?: number) {
        super();
        this.name = name ? name : "entity" + Math.floor(Math.random() * 100000);
        this.rect = new Rect(0, 0, 0, 0);
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.rect.x = this.x;
        this.rect.y = this.y;
        this.type = "entity";
        this.world = null;
    }

    keyDown(key: number) { };

    keyUp(key: number) { };

    mouseDown() { };

    onDestroy() { };

    onAdd() {

    }
    setPosition(x: number);
    setPosition(x: number, y: number);
    setPosition(vec2: IVec2);
    setPosition(value1?: IVec2 | number, value2?: number) {
        if (typeof value1 === "number") {
            this._x = value1;
            this._y = (value2 || value2 == 0) ? value2 : this.y;
        } else {
            this._x = value1.x;
            this._y = value1.y;
        }
        this.updateAbsPos();
    }
    updateAbsPos() {
        this.absX = this.parent ? this.parent.absX + this.x : this.x;
        this.absY = this.parent ? this.parent.absY + this.y : this.y;
        this.rect.x = this.absX;
        this.rect.y = this.absY;
    }
    collide(rect: Rect) {
        return false;
    }

    draw() {
        // console.log("进来了draw")
        if (this.active && this.graphic && this.graphic.visible) {
            this.graphic.draw();
        }
    }

    start() {
        console.log(this.name + " start执行");
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
                    console.log("不存在此component", com);
                }
            } catch (e) {
                console.error("通过string字符串addComponent出错", e);
            }
        } else {
            try {
                newCom = new com();
            } catch (e) {
                console.error("通过传入类addComponent错误，可能原因为类实现有误");
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
        // console.log("test",new TestPro().__proto__.constructor.name);
        // console.log("test",TestPro.prototype.constructor.name);
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
        if (!child) return console.warn("要添加的子节点不存在");
        if (child.parent) child.parent.removeChild(this);
        child._parent = this;
        this.children.push(child);
        this.world.add(child);
        child.updateAbsPos();
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

    getBoundingBox(): BoundingBox {
        return this.rect.getBoundingBox();
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
     * 鼠标按下事件
     */
    mouseDown() {
        this.eventSystem.mouseDown();
    }

    /**
     * 按键按下事件，无需手动调用
     */
    update(dtime: number) {
        this.eventSystem.update(dtime);
    }

    /**
     * start事件，无需手动调用
     */
    start() {
        console.log("start事件总线执行")
        this.eventSystem.start();
    }

    /**
     * stop事件，无需手动调用
     */
    stop() {
        this.entities = [];
        this.preDestroys = [];
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

@rClass
export class Text extends GraphicComponent {
    static TextAlignType: typeof TextAlignType = TextAlignType;
    text: string;
    font: string;
    colour: string;
    size: number;
    align: TextAlignType;
    constructor(x?, y?, text?, font?, colour?, size?, align?) {
        super();
        this.x = x || 0;
        this.y = y || 0;
        this.text = text || "";
        this.font = font || "sans";
        this.colour = colour || "white";
        this.size = size || 14;
        this.align = align || "left";
        Rabbit.Instance.context.textBaseline = 'top';
        Rabbit.Instance.context.textAlign = this.align;
        Rabbit.Instance.context.font = this.size + "px " + this.font;
        Rabbit.Instance.context.fillStyle = this.colour;
        this.w = Rabbit.Instance.context.measureText(text).width;
        this.h = this.size;

        // console.log("x", this.x);
        // console.log("y", this.y);
        // console.log("width", this.w);
        // console.log("height", this.h);
        // console.log("text", this.text);
        // console.log("font", this.font);
        // console.log("colour", this.colour);
        // console.log("size", this.size);

        // console.log("textBaseline", Rabbit.Instance.context.textBaseline);
        // console.log("font", Rabbit.Instance.context.font);
        // console.log("fillStyle", Rabbit.Instance.context.fillStyle);
        // console.log("context", Rabbit.Instance.context);

    }

    setAlign(align: TextAlignType) {
        this.align = align;
    }

    /**
     * 设置text的坐标（脱离entity）
     * @deprecated
     * @param x 
     * @param y 
     */
    private setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    draw() {

        this.w = Rabbit.Instance.context.measureText(this.text).width;
        Rabbit.Instance.context.textBaseline = 'top';
        Rabbit.Instance.context.textAlign = this.align;
        Rabbit.Instance.context.font = this.size + "px " + this.font;
        Rabbit.Instance.context.fillStyle = this.colour;
        Rabbit.Instance.context.fillText(this.text, this.x, this.y);
    }

    update(time) {
        // console.log("RabText update 调用")
        Rabbit.Instance.context.clearRect(Math.floor(this.x - 1), Math.floor(this.y - 1), Math.floor(this.w + 1), Math.floor(this.h + 1));
        this.x = this.entity.absX;
        this.y = this.entity.absY;
    }
}

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
    constructor(x, y, w, h) {
        super();
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    bottom() {
        return this.y + this.h;
    }

    collidePoint(point) {
        return (
            point[0] >= this.x &&
            point[0] < this.x + this.w &&
            point[1] >= this.y &&
            point[1] < this.y + this.h
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

    getBoundingBox(): BoundingBox {
        return new BoundingBox(this);
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

        // console.log("camera",Rabbit.Instance.camera);
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
        this.x = this.entity.absX;
        this.y = this.entity.absY;
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
        this.resolution = {
            width: Rabbit.Instance.htmlCanvas.width,
            height: Rabbit.Instance.htmlCanvas.height
        }
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
        if (loop == undefined)
            this.loop = true;
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
        if (!flag) console.warn("deleteItemFromList方法未找到要删除的元素");
    }
}
// export { rabbitClass, Rabbit, SplashCanvas, Circle, Collision, Entity, Graphic, GraphicList, RabObject, RabText, Rect, Sfx, Sprite, Tilemap, World, RabKeyType, RabImage, Component, TestComponent };