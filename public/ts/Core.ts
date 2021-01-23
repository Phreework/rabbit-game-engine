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

    public static Instance: Rabbit = null;
    get winSize() {
        return new Rect(0, 0, this.canvas.width, this.canvas.height);
    }
    canvas: HTMLCanvasElement = null;
    camera: any = null;
    context: CanvasRenderingContext2D = null;
    /**
     * 存储图片的map
     */
    static images: Map<string, HTMLImageElement> = new Map();
    audio: any = {};
    world: World = null;
    mouse: any = { x: undefined, y: undefined, pressed: false };
    offset: any[] = [0, 0];
    fps: number = 60;
    static audioChannels: HTMLAudioElement[] = [];
    keysPressed: any[] = [];
    maxFrameTime: number = 0.030;
    time: number;
    private _nextWorld: any;
    static version: number = 0.2;
    worldMap: Map<string, World> = new Map();
    isRabbitRun: boolean = false;
    updateId: any = null;

    entitySystem: EntitySystem;
    compSystem: CompSystem;
    eventSystem: EventSystem;
    constructor() {
        if (!Rabbit.Instance) {
            Rabbit.Instance = this;
            rabbit = Rabbit.Instance;
            this.entitySystem = new EntitySystem();
            this.compSystem = new CompSystem();
            this.eventSystem = new EventSystem();
        }
    }
    /**
     * 初始化游戏
     * @param canvasid 传入canvas的html id 
     */
    init(canvasid?: string): void {
        canvasid = canvasid ? canvasid : 'rabbit-canvas';
        const canvas: HTMLCanvasElement = document.getElementById(canvasid) as HTMLCanvasElement;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.canvas.onmousedown = (e) => { Rabbit.Instance._canvasMouseDown(e) };
        document.onkeydown = (e) => { Rabbit.Instance.keyDown(e) };
        document.onkeyup = (e) => { Rabbit.Instance.keyUp(e) };
        this.canvas.onmousemove = (e) => { Rabbit.Instance.mouseMove(e) };
        this.canvas.onmouseout = (e) => { Rabbit.Instance.mouseOut(e) };

        if (document.defaultView && document.defaultView.getComputedStyle) {
            const paddingLeft: number = +(document.defaultView.getComputedStyle(canvas, null)['paddingLeft']) || 0;
            const paddingTop: number = +(document.defaultView.getComputedStyle(canvas, null)['paddingTop']) || 0;
            const borderLeft: number = +(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth']) || 0;
            const borderTop: number = +(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth']) || 0;
            this.offset = [paddingLeft + borderLeft, paddingTop + borderTop];
        }

        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.resetCamera();
        console.log("rabbit 初始化完成")
    }
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
        const element: HTMLCanvasElement = this.canvas;
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
        this.canvas.style.backgroundImage = 'url(' + url + ')';
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setWorld(world) {
        this._nextWorld = world;
    }

    addWorld(world: World) {
        this.worldMap.set(world.name, world);
    }
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
    stop(): boolean {
        if (this.updateId) clearInterval(this.updateId);
        else return false;
        this.world.stop();
        this.updateId = null;
        this.isRabbitRun = false;
        return true;
    }
    start() {
        this.world.start();
    }
    update() {
        var dtime = (Date.now() - this.time) / 1000;
        if (dtime > this.maxFrameTime)
            dtime = this.maxFrameTime;
        this.time = Date.now();
        this.world.update(dtime);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
 * 管理所有的实体
 * 单例
 */
@rClass
export class EntitySystem {
    remove(e: Entity) {
        e.removed();
        Rabbit.Instance.world.removed.push(e);
    }


    static Instance: EntitySystem;
    constructor() {
        EntitySystem.Instance = this;
    }
    add(e: Entity) {
        const world = Rabbit.Instance.world;
        world.entities.push(e);
        e.id = world.maxId++;
        e.world = world;
        e.added();
    }
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
    static Instance: EventSystem;
    constructor() {
        EventSystem.Instance = this;
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
export class Entity extends RabObject {
    x: number;
    y: number;
    rect: Rect;
    graphic: GraphicComponent;
    type: string;
    world: World;
    name: string;
    id: number;
    active: boolean = true;
    components: Component[] = [];
    children: Entity[] = [];

    constructor(x?, y?) {
        super();
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.rect = new Rect(0, 0, 0, 0);
        this.type = "entity";
        this.world = null;
    }

    keyDown(key: number) { };

    keyUp(key: number) { };

    mouseDown() { };

    removed() { };

    added() {

    }

    collide(rect) {
        return false;
    }

    draw() {
        // console.log("进来了draw")
        if (this.active && this.graphic && this.graphic.visible != false)
            this.graphic.draw();
    }

    start() {
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

@rClass
export class AudioSystem extends RabObject {

    static play(soundurl) {
        const audio = Rabbit.loadAudio(soundurl);
        audio.play();
    }
}
@rClass
export class World extends RabObject {

    name: string;
    entities: Entity[] = [];
    removed: Entity[] = [];
    maxId: number = 0;

    entitySystem: EntitySystem = Rabbit.Instance.entitySystem;
    eventSystem: EventSystem = Rabbit.Instance.eventSystem;

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
     * 在世界中移除实体
     * @param e 要移除的实体
     */
    remove(e: Entity) {
        this.entitySystem.remove(e);
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

    getType(type) {
        return this.filter((e) => { return e.type == type; });
    }

    keyDown(key: number) {
        this.eventSystem.keyDown(key);
    }

    keyUp(key: number) {
        this.eventSystem.keyUp(key);
    }

    mouseDown() {
        this.eventSystem.mouseDown();
    }



    _update(dtime) {
        for (let i = 0; i < this.entities.length; ++i) {
            const entity = this.entities[i];
            if (!entity.active) continue;
            entity.update(dtime);
        }

        //可能开销比较大？
        for (let j = 0; j < this.removed.length; ++j) {
            for (let i = 0; i < this.entities.length; ++i) {
                if (this.entities[i] == this.removed[j])
                    this.entities.splice(i, 1);
            }
        }
        this.removed = [];
    }

    update(dtime) {
        this._update(dtime);
    }
    start() {
        console.log("start事件总线执行")
        for (let i = 0; i < this.entities.length; ++i) {
            const entity = this.entities[i];
            if (entity.active) entity.start();
        }
    }
    stop() {
        this.entities = [];
        this.removed = [];
        this.maxId = 0;
    }
    collide(rect) {
        let collisions: Collision[] = [];
        for (let i = 0; i < this.entities.length; i++) {
            var e = this.entities[i];
            if (e.graphic == null)
                continue;
            let entRect = new Rect(e.graphic.x, e.graphic.y, e.graphic.w, e.graphic.h);
            if (rect.collideRect(entRect))
                collisions.push(new Collision(e, entRect));
        }
        return collisions;
    }
}
@rClass
export class Collision {
    other: any;
    rect: any;
    constructor(other, rect) {
        this.other = other;
        this.rect = rect;
    }
}
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


export enum TextAlignType {
    left = "left",
    right = "right",
    center = "center",
    start = "start",
    end = "end",
}
@rClass
export class Text extends GraphicComponent {
    static TextAlignType = TextAlignType;
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
    setPosition(x: number, y: number) {
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
    }
}
@rClass
export class Rect extends RabObject {
    x: number;
    y: number;
    w: number;
    h: number;
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
        for (var g = 0; g < this.graphics.length; ++g) {
            this.graphics[g].draw();
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

    remove(graphic) {
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
    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
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

    place(pos) {
        this.x = pos[0];
        this.y = pos[1];
    };

    update(dtime) {
        Rabbit.Instance.context.save();
        if (this.ignoreCamera)
            Rabbit.Instance.context.translate(Math.floor(this._x), Math.floor(this._y));
        else
            Rabbit.Instance.context.translate(Math.floor(this._x + Rabbit.Instance.camera.x), Math.floor(this._y + Rabbit.Instance.camera.y));
        Rabbit.Instance.context.clearRect(0, 0, Math.round(this.w), Math.round(this.h));
        Rabbit.Instance.context.restore();
        this._x = this.x;
        this._y = this.y;
        this.w = this.image.width;
        this.h = this.image.height;
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
    canvas: Canvas;
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
        this.canvas = new Canvas(this.x, this.y, this.tileW * this.gridW, this.tileH * this.gridH);

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
@rClass
export class Canvas extends GraphicComponent {
    alpha: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    ignoreCamera: boolean = false;
    constructor(x, y, w, h) {
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
// export { rabbitClass, Rabbit, Canvas, Circle, Collision, Entity, Graphic, GraphicList, RabObject, RabText, Rect, Sfx, Sprite, Tilemap, World, RabKeyType, RabImage, Component, TestComponent };