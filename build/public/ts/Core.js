var _class, _class2, _temp, _class3, _class4, _temp2, _class5, _class6, _temp3, _class7, _class8, _temp4, _class9, _class10, _temp5, _class12, _class13, _temp6, _class15, _temp7, _class17, _temp8, _class19, _temp9, _class21, _class22, _temp10, _class24, _temp11, _class26, _temp12, _class28, _class29, _temp13, _class30, _temp14, _class32, _temp15, _class34, _temp16, _class36, _temp17, _class38, _temp18, _class40, _temp19, _class42, _temp20, _class44;

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

export const rabbitVersion = "0.2";
/**
 * ###en
 * 
 * ###zh
 * 键盘按键枚举（需补齐其他不常用键）
 */

export let KeyType;
/**
 * ###en
 * 
 * ###zh
 * 游戏实例
 */

(function (KeyType) {
  KeyType[KeyType["A"] = 65] = "A";
  KeyType[KeyType["B"] = 66] = "B";
  KeyType[KeyType["C"] = 67] = "C";
  KeyType[KeyType["D"] = 68] = "D";
  KeyType[KeyType["E"] = 69] = "E";
  KeyType[KeyType["F"] = 70] = "F";
  KeyType[KeyType["G"] = 71] = "G";
  KeyType[KeyType["H"] = 72] = "H";
  KeyType[KeyType["I"] = 73] = "I";
  KeyType[KeyType["J"] = 74] = "J";
  KeyType[KeyType["K"] = 75] = "K";
  KeyType[KeyType["L"] = 76] = "L";
  KeyType[KeyType["M"] = 77] = "M";
  KeyType[KeyType["N"] = 78] = "N";
  KeyType[KeyType["O"] = 79] = "O";
  KeyType[KeyType["P"] = 80] = "P";
  KeyType[KeyType["Q"] = 81] = "Q";
  KeyType[KeyType["R"] = 82] = "R";
  KeyType[KeyType["S"] = 83] = "S";
  KeyType[KeyType["T"] = 84] = "T";
  KeyType[KeyType["U"] = 85] = "U";
  KeyType[KeyType["V"] = 86] = "V";
  KeyType[KeyType["W"] = 87] = "W";
  KeyType[KeyType["X"] = 88] = "X";
  KeyType[KeyType["Y"] = 89] = "Y";
  KeyType[KeyType["Z"] = 90] = "Z";
  KeyType[KeyType["ZERO"] = 48] = "ZERO";
  KeyType[KeyType["ONE"] = 49] = "ONE";
  KeyType[KeyType["TWO"] = 50] = "TWO";
  KeyType[KeyType["THREE"] = 51] = "THREE";
  KeyType[KeyType["FOUR"] = 52] = "FOUR";
  KeyType[KeyType["FIVE"] = 53] = "FIVE";
  KeyType[KeyType["SIX"] = 54] = "SIX";
  KeyType[KeyType["SEVEN"] = 55] = "SEVEN";
  KeyType[KeyType["EIGHT"] = 56] = "EIGHT";
  KeyType[KeyType["NINE"] = 57] = "NINE";
  KeyType[KeyType["LEFT"] = 37] = "LEFT";
  KeyType[KeyType["UP"] = 38] = "UP";
  KeyType[KeyType["RIGHT"] = 39] = "RIGHT";
  KeyType[KeyType["DOWN"] = 40] = "DOWN";
  KeyType[KeyType["SPACE"] = 32] = "SPACE";
})(KeyType || (KeyType = {}));

export let Rabbit = rClass(_class = (_temp = _class2 = class Rabbit {
  /**
   * Rabbit运行环境唯一实例
   */

  /**
   * 返回Canvas的矩形框
   */
  get winSize() {
    return new Rect(0, 0, this.canvas.width, this.canvas.height);
  }
  /**
   * 游戏的Html画布
   */


  /**
   * Rabbit运行环境构造器函数
   */
  constructor() {
    this.canvas = null;
    this.camera = null;
    this.context = null;
    this.audio = {};
    this.world = null;
    this.mouse = {
      x: undefined,
      y: undefined,
      pressed: false
    };
    this.offset = [0, 0];
    this.fps = 60;
    this.keysPressed = [];
    this.maxFrameTime = 0.030;
    this.time = undefined;
    this._nextWorld = null;
    this.worldMap = new Map();
    this.isRabbitRun = false;
    this.updateId = null;
    this.entitySystem = void 0;
    this.compSystem = void 0;
    this.eventSystem = void 0;

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


  init(canvasid) {
    canvasid = canvasid ? canvasid : 'rabbit-canvas';
    const canvas = document.getElementById(canvasid);
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    this.canvas.onmousedown = e => {
      Rabbit.Instance._canvasMouseDown(e);
    };

    document.onkeydown = e => {
      Rabbit.Instance.keyDown(e);
    };

    document.onkeyup = e => {
      Rabbit.Instance.keyUp(e);
    };

    this.canvas.onmousemove = e => {
      Rabbit.Instance.mouseMove(e);
    };

    this.canvas.onmouseout = e => {
      Rabbit.Instance.mouseOut(e);
    };

    if (document.defaultView && document.defaultView.getComputedStyle) {
      const paddingLeft = +document.defaultView.getComputedStyle(canvas, null)['paddingLeft'] || 0;
      const paddingTop = +document.defaultView.getComputedStyle(canvas, null)['paddingTop'] || 0;
      const borderLeft = +document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'] || 0;
      const borderTop = +document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'] || 0;
      this.offset = [paddingLeft + borderLeft, paddingTop + borderTop];
    }

    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.resetCamera();
    console.log("rabbit 初始化完成");
  }
  /**
   * 重设摄像机
   */


  resetCamera() {
    this.camera = {
      x: 0,
      y: 0
    };
  }
  /**
   * 输出图片错误
   * @param url 图片地址
   */


  imageError(url) {
    alert("Could not load " + url + ".");
  }
  /**
   * 加载图片
   * @param url 图片地址
   */


  static loadImage(url) {
    if (url in this.images) return this.images[url];
    const img = new Image();
    img.src = url;

    img.onload = () => {
      img.valid = true;
    };

    img.onerror = () => {
      img.valid = false;
      Rabbit.Instance.imageError(img.src);
    };

    this.images[url] = img;
    return img;
  }
  /**
   * 异步加载图片
   * @param url 图片地址
   */


  static loadImageAsync(url) {
    return new Promise((success, fail) => {
      if (url in this.images) {
        success(this.images[url]);
      }

      const img = new Image();
      img.src = url;

      img.onload = () => {
        img.valid = true;
        this.images[url] = img;
        success(img);
      };

      img.onerror = () => {
        img.valid = false;
        Rabbit.Instance.imageError(img.src);
        fail();
      };
    });
  }
  /**
   * 加载音乐
   * @param url 音乐地址
   */


  static loadAudio(url) {
    let channel = null;

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
    let ox = 0,
        oy = 0;
    const element = this.canvas;

    if (element.offsetParent) {
      do {
        ox += element.offsetLeft;
        oy += element.offsetTop;
      } while (element == element.parentElement);
    }

    return [e.pageX - ox + this.offset[0], e.pageY - oy + this.offset[1]];
  }
  /**
   * 鼠标按下
   * @param event 事件
   */


  _canvasMouseDown(event) {
    event.preventDefault();
    this.mouseDown();
  }
  /**
   * 键盘下键按下
   * @param event 
   */


  keyDown(event) {
    // console.log("event", event);
    if (this.keysPressed[event.keyCode]) return;
    this.keysPressed[event.keyCode] = true;
    this.world.keyDown(event.keyCode);
  }
  /**
   * 键盘上键按下
   * @param event 
   */


  keyUp(event) {
    this.keysPressed[event.keyCode] = false;
    this.world.keyUp(event.keyCode);
  }
  /**
   * 鼠标下键按下
   */


  mouseDown() {
    this.world.mouseDown();
    this.mouse.pressed = true;
  }
  /**
   * 鼠标移动
   * @param event 
   */


  mouseMove(event) {
    var mousePos = Rabbit.Instance._mousePosition(event);

    this.mouse.x = mousePos[0];
    this.mouse.y = mousePos[1];
  }
  /**
   * 鼠标出绘制屏幕
   * @param event 
   */


  mouseOut(event) {
    this.mouse.x = undefined;
    this.mouse.y = undefined;
  }
  /**
   * 播放网络音效
   * @param url 
   */


  playSfx(url) {
    new Sfx(url).play();
  }
  /**
   * 开始update
   * @param url 
   */


  run() {
    const dtime = 1000 / this.fps;
    this.time = Date.now();
    this.start();
    this.updateId = setInterval(() => {
      this.update();
    }, dtime);
  }
  /**
   * 设置背景图片
   * @param url 背景图片地址
   */


  setBackground(url) {
    this.canvas.style.backgroundImage = 'url(' + url + ')';
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  /**
   * 设置场景为下次运行的场景
   * @deprecated 该方法已弃用
   * @param world 
   */


  setWorld(world) {
    this._nextWorld = world;
  }
  /**
   * 添加一个场景实例
   * @param world 添加场景实例
   */


  addWorld(world) {
    this.worldMap.set(world.name, world);
  }
  /**
   * 运行游戏场景
   * @param worldname 游戏场景名
   */


  runWorld(worldname) {
    if (this.isRabbitRun) this.stop();
    this.world = this.worldMap.get(worldname);

    if (this.world) {
      this.resetCamera();
      this.world.init();
      this.run();
      this.isRabbitRun = true;
    } else {
      console.error("runWorld world不存在");
    } // console.log("this.world", this.world)

  }
  /**
   * 停止游戏主循环
   */


  stop() {
    if (this.updateId) clearInterval(this.updateId);else return false;
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
    let dtime = (Date.now() - this.time) / 1000;
    if (dtime > this.maxFrameTime) dtime = this.maxFrameTime;
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

}, _class2.Instance = null, _class2.images = new Map(), _class2.audioChannels = [], _class2.version = rabbitVersion, _temp)) || _class;
export let rabbit = null;
/**
 * @class 管理所有的实体
 */

export let EntitySystem = rClass(_class3 = (_temp2 = _class4 = class EntitySystem {
  /**
   * @instance EntitySystem的唯一静态实例
   */

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


  add(e) {
    const world = Rabbit.Instance.world;
    world.entities.push(e);
    e.id = world.maxId++;
    e.world = world;
    e.added();
  }
  /**
   * 为场景中所有实体派发绘制事件
   */


  draw() {
    const entities = Rabbit.Instance.world.entities;
    entities.sort((lhs, rhs) => {
      if (!lhs.graphic) return -1;
      if (!rhs.graphic) return 1;
      if (lhs.graphic.z == rhs.graphic.z) return lhs.id - rhs.id;
      return lhs.graphic.z - rhs.graphic.z;
    });

    for (let i = 0; i < entities.length; ++i) {
      entities[i].draw();
    }
  }
  /**
   * 在该帧结束时移除该实体
   * @param e 要移除的实体
   */


  remove(e) {
    e.removed();
    Rabbit.Instance.world.removed.push(e);
  }

}, _class4.Instance = void 0, _temp2)) || _class3;
/**
 * 管理所有的组件
 * 单例
 */

export let CompSystem = rClass(_class5 = (_temp3 = _class6 = class CompSystem {
  constructor() {
    CompSystem.Instance = this;
  }

}, _class6.Instance = void 0, _temp3)) || _class5;
/**
 * 管理所有的事件
 * 单例
 */

export let EventSystem = rClass(_class7 = (_temp4 = _class8 = class EventSystem {
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

  update(dtime) {
    const entities = Rabbit.Instance.world.entities;
    const removed = Rabbit.Instance.world.removed;

    for (let i = 0; i < entities.length; ++i) {
      const entity = entities[i];
      if (!entity.active) continue;
      entity.update(dtime);
    } //可能开销比较大？


    for (let j = 0; j < removed.length; ++j) {
      for (let i = 0; i < entities.length; ++i) {
        if (entities[i] == removed[j]) entities.splice(i, 1);
      }
    }

    Rabbit.Instance.world.removed = [];
  }

  keyDown(key) {
    const entities = Rabbit.Instance.world.entities;

    for (let i = entities.length - 1; i >= 0; --i) {
      if (entities[i]) entities[i].keyDown(key);
    }
  }

  keyUp(key) {
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

}, _class8.Instance = void 0, _temp4)) || _class7;
export let RabObject = rClass(_class9 = class RabObject {
  clone() {
    let f = function () {};

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

}) || _class9;
export let Component = rClass(_class10 = (_temp5 = class Component extends RabObject {
  constructor(...args) {
    super(...args);
    this.entity = void 0;
    this.enabled = void 0;
  }

  _onLoad() {
    this.onLoad();
    this.start();
  }

  onLoad() {}

  start() {}

  lateUpdate() {}

  onEnable() {}

  onDestroy() {}

  update(dtime) {}

  addComponent(com) {
    if (typeof com == "string") return this.entity.addComponent(com);else return this.entity.addComponent(com);
  }

  getComponent(type) {
    if (typeof type == "string") return this.entity.getComponent(type);else return this.entity.getComponent(type);
  }

}, _temp5)) || _class10;
export let TestComponent = rClass(_class12 = class TestComponent extends Component {}) || _class12;
export let Vec2 = rClass(_class13 = (_temp6 = class Vec2 {
  constructor() {
    this.x = void 0;
    this.y = void 0;
  }

}, _temp6)) || _class13;
export let Vec3 = rClass(_class15 = (_temp7 = class Vec3 {
  constructor() {
    this.x = void 0;
    this.y = void 0;
    this.z = void 0;
  }

}, _temp7)) || _class15;
export let Entity = rClass(_class17 = (_temp8 = class Entity extends RabObject {
  /**
   * 实体的相对x坐标
   */
  set x(value) {
    this.setPosition(value);
  }

  get x() {
    return this._x;
  }
  /**
   * 实体的相对y坐标
   */


  set y(value) {
    this.setPosition(this._x, value);
  }

  get y() {
    return this._y;
  }
  /**
   * 实体的绝对x坐标
   */


  get active() {
    return this._active;
  }

  set active(value) {
    this._active = value;
  }
  /**
   * 实体拥有的所有组件
   */


  get parent() {
    return this._parent;
  }

  set parent(parent) {
    this.setParent(parent);
  }
  /**
   * @constructor 实体的构造器函数
   * @param x 实体x坐标（可选）
   * @param y 实体y坐标（可选）
   * @todo name的命名制定一套规则
   */


  constructor(name, x, y) {
    super();
    this._x = void 0;
    this._y = void 0;
    this.absX = void 0;
    this.absY = void 0;
    this.rect = void 0;
    this.graphic = void 0;
    this.type = void 0;
    this.world = void 0;
    this.name = void 0;
    this.id = void 0;
    this._active = true;
    this.components = [];
    this.children = [];
    this._parent = null;
    this.name = name ? name : "entity" + Math.floor(Math.random() * 100000);
    this.rect = new Rect(0, 0, 0, 0);
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.rect.x = this.x;
    this.rect.y = this.y;
    this.type = "entity";
    this.world = null;
  }

  keyDown(key) {}

  keyUp(key) {}

  mouseDown() {}

  removed() {}

  added() {}

  setPosition(value1, value2) {
    if (typeof value1 === "number") {
      this._x = value1;
      this._y = value2 || value2 == 0 ? value2 : this.y;
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

  collide(rect) {
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
    const len = this.components.length;
    if (len == 0) return;

    for (let i = 0; i < len; i++) {
      this.components[i]._onLoad();
    }
  }

  update(dtime) {
    const len = this.components.length;
    if (len == 0) return;

    for (let i = 0; i < len; i++) {
      this.components[i].update(dtime);
    }
  }

  addComponent(com) {
    let newCom = null;

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
        this.graphic = newCom;
      }

      if (Rabbit.Instance.isRabbitRun) {
        newCom._onLoad();
      }
    }

    return newCom;
  }

  getComponent(type) {
    // console.log("test",new TestPro().__proto__.constructor.name);
    // console.log("test",TestPro.prototype.constructor.name);
    if (typeof type == "string") {
      for (let i = 0; i < this.components.length; i++) {
        const com = this.components[i];

        if (com.__proto__.constructor.name == type) {
          return com;
        }
      }
    } else {
      for (let i = 0; i < this.components.length; i++) {
        const com = this.components[i];

        if (com.__proto__.constructor.name == type.prototype.constructor.name) {
          return com;
        }
      }
    }

    return null;
  }
  /**
   * 在当前实体下增加子实体
   * @param child 
   */


  addChild(child) {
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


  removeChild(child) {
    EngineTools.deleteItemFromList(child, this.children);
    this.world.remove(child);
  }
  /**
   * 设置当前实体的父实体
   * @param parent 
   */


  setParent(parent) {
    if (!parent) return console.warn("要添加的父节点不存在");
    parent.addChild(this);
  }

}, _temp8)) || _class17;
export let Sfx = rClass(_class19 = (_temp9 = class Sfx extends RabObject {
  constructor(soundurl) {
    super();
    this.soundUrl = void 0;
    this.audio = void 0;
    this.soundUrl = soundurl;
  }

  play() {
    this.audio = Rabbit.loadAudio(this.soundUrl);
    this.audio.play();
  }

}, _temp9)) || _class19;
/**
 * 音频系统类
 * @description 可调用静态方法直接播放音乐
 * @todo 区分音效和背景音乐播放功能
 * @todo 暂定功能
 * @todo 停止功能
 */

export let AudioSystem = rClass(_class21 = class AudioSystem extends RabObject {
  static play(soundurl) {
    const audio = Rabbit.loadAudio(soundurl);
    audio.play();
  }

}) || _class21;
/**
 * 游戏场景类
 * @todo 加载完成依赖的本地资源后再启动
 */

export let World = rClass(_class22 = (_temp10 = class World extends RabObject {
  /**
   * 游戏场景的名称，具有唯一性
   */

  /**
   * 游戏中所有实体的索引集合
   */

  /**
   * 游戏中所有要移除的实体集合，在update事件时移除
   */

  /**
   * 简单的实体id区分，每增加一个实体id增加
   */

  /**
   * 实体管理系统唯一实例
   */

  /**
   * 事件管理系统唯一实例
   */

  /**
   * 构造器函数，调用创建一个场景
   * @param name 游戏场景的名称
   */
  constructor(name) {
    super();
    this.name = void 0;
    this.entities = [];
    this.removed = [];
    this.maxId = 0;
    this.entitySystem = Rabbit.Instance.entitySystem;
    this.eventSystem = Rabbit.Instance.eventSystem;
    this.init = void 0;
    this.name = name;
  }
  /**
   * 世界初始化方法，应在其中做Entity实例化等场景构建操作
   */


  /**
   * 在世界中增加实体
   * @param e 要增加的实体
   */
  add(e) {
    this.entitySystem.add(e);
  }
  /**
   * 在世界中移除实体
   * @param e 要移除的实体
   */


  remove(e) {
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


  filter(filtfunc) {
    let entities = [];

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


  getType(type) {
    return this.filter(e => {
      return e.type == type;
    });
  }
  /**
   * 按键按下事件
   */


  keyDown(key) {
    this.eventSystem.keyDown(key);
  }
  /**
   * 按键弹起事件
   */


  keyUp(key) {
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


  update(dtime) {
    this.eventSystem.update(dtime);
  }
  /**
   * start事件，无需手动调用
   */


  start() {
    console.log("start事件总线执行");
    this.eventSystem.start();
  }
  /**
   * stop事件，无需手动调用
   */


  stop() {
    this.entities = [];
    this.removed = [];
    this.maxId = 0;
  }
  /**
   * 碰撞事件，无需手动调用
   */


  collide(rect) {
    let collisions = [];

    for (let i = 0; i < this.entities.length; i++) {
      const entity = this.entities[i];
      if (entity.graphic == null) continue;
      const entRect = new Rect(entity.graphic.x, entity.graphic.y, entity.graphic.w, entity.graphic.h);
      if (rect.collideRect(entRect)) collisions.push(new Collision(entity, entRect));
    }

    return collisions;
  }

}, _temp10)) || _class22;
/**
 * 碰撞类
 * @todo 这个类需编写测试用例来完成
 * @todo 继承Component
 */

export let Collision = rClass(_class24 = (_temp11 = class Collision {
  constructor(other, rect) {
    this.other = void 0;
    this.rect = void 0;
    this.other = other;
    this.rect = rect;
  }

}, _temp11)) || _class24;
/**
 * 图形组件
 * @description 所有渲染组件都需继承该组件
 */

export let GraphicComponent = rClass(_class26 = (_temp12 = class GraphicComponent extends Component {
  constructor(...args) {
    super(...args);
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 0;
    this.h = 0;
    this.visible = true;
  }

  draw() {}

}, _temp12)) || _class26;
/**
 * 文字锚点位置枚举
 * @enum 
 */

export let TextAlignType;

(function (TextAlignType) {
  TextAlignType["left"] = "left";
  TextAlignType["right"] = "right";
  TextAlignType["center"] = "center";
  TextAlignType["start"] = "start";
  TextAlignType["end"] = "end";
})(TextAlignType || (TextAlignType = {}));

export let Text = rClass(_class28 = (_temp13 = _class29 = class Text extends GraphicComponent {
  constructor(x, y, text, font, colour, size, align) {
    super();
    this.text = void 0;
    this.font = void 0;
    this.colour = void 0;
    this.size = void 0;
    this.align = void 0;
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
    this.h = this.size; // console.log("x", this.x);
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

  setAlign(align) {
    this.align = align;
  }
  /**
   * 设置text的坐标（脱离entity）
   * @deprecated
   * @param x 
   * @param y 
   */


  setPosition(x, y) {
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

}, _class29.TextAlignType = TextAlignType, _temp13)) || _class28;
export let Rect = rClass(_class30 = (_temp14 = class Rect extends RabObject {
  constructor(x, y, w, h) {
    super();
    this.x = void 0;
    this.y = void 0;
    this.w = void 0;
    this.h = void 0;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  bottom() {
    return this.y + this.h;
  }

  collidePoint(point) {
    return point[0] >= this.x && point[0] < this.x + this.w && point[1] >= this.y && point[1] < this.y + this.h;
  }

  collideRect(rect) {
    if (this.x > rect.x + rect.w) return false;
    if (rect.x > this.x + this.w) return false;
    if (this.y > rect.y + rect.h) return false;
    if (rect.y > this.y + this.h) return false;
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

}, _temp14)) || _class30;
export let Circle = rClass(_class32 = (_temp15 = class Circle extends RabObject {
  constructor(x, y, radius) {
    super();
    this.x = void 0;
    this.y = void 0;
    this.radius = void 0;
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  collideCircle(circle) {
    var dx = this.x - circle.x;
    var dy = this.y - circle.y;
    var sqDistance = dx * dx + dy * dy;
    var r = this.radius + circle.radius;
    var collide = sqDistance <= r * r;
    return collide;
  }

  collidePoint(point) {
    var d = [point[0] - this.x, point[1] - this.y];
    return d[0] * d[0] + d[1] * d[1] <= this.radius * this.radius;
  }

  place(pos) {
    this.x = pos[0];
    this.y = pos[1];
  }

}, _temp15)) || _class32;
;
export let GraphicList = rClass(_class34 = (_temp16 = class GraphicList extends GraphicComponent {
  setGraphics(graphics) {
    this.graphics = graphics;
  }

  constructor(graphics) {
    super();
    this.graphics = void 0;
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

  remove(graphic) {
    for (let g = 0; g < this.graphics.length; ++g) {
      if (this.graphics[g] == graphic) this.graphics.slice(g);
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

}, _temp16)) || _class34;
export let RabImage = rClass(_class36 = (_temp17 = class RabImage extends GraphicComponent {
  get imageUrl() {
    return this._imageUrl;
  }

  set imageUrl(value) {
    this._imageUrl = value;
    this.image = Rabbit.loadImage(value);
    this.w = this.image.width;
    this.h = this.image.height;
  }

  constructor(x, y, image) {
    super();
    this._x = void 0;
    this._y = void 0;
    this.alpha = void 0;
    this._imageUrl = void 0;
    this.image = void 0;
    this.ignoreCamera = false;
    this._x = x ? x : 0;
    this._y = y ? y : 0;
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.alpha = 1;
    if (image) this.image = Rabbit.loadImage(image);
  }

  async setImageAsync(url) {
    this._imageUrl = url;
    this.image = await Rabbit.loadImageAsync(url);
    this.w = this.image.width;
    this.h = this.image.height;
  }

  draw() {
    if (!this.image || !this.image.valid) return;
    Rabbit.Instance.context.save();
    Rabbit.Instance.context.globalAlpha = this.alpha;
    if (this.ignoreCamera) Rabbit.Instance.context.translate(Math.floor(this._x), Math.floor(this._y));else Rabbit.Instance.context.translate(Math.floor(this._x + Rabbit.Instance.camera.x), Math.floor(this._y + Rabbit.Instance.camera.y)); // console.log("camera",Rabbit.Instance.camera);

    Rabbit.Instance.context.drawImage(this.image, 0, 0);
    Rabbit.Instance.context.globalAlpha = 1;
    Rabbit.Instance.context.restore();
  }

  update(dtime) {
    if (!this.image) return;
    Rabbit.Instance.context.save();
    if (this.ignoreCamera) Rabbit.Instance.context.translate(Math.floor(this._x), Math.floor(this._y));else Rabbit.Instance.context.translate(Math.floor(this._x + Rabbit.Instance.camera.x), Math.floor(this._y + Rabbit.Instance.camera.y));
    Rabbit.Instance.context.clearRect(0, 0, Math.round(this.w), Math.round(this.h));
    Rabbit.Instance.context.restore();
    this.x = this.entity.absX;
    this.y = this.entity.absY;
    this._x = this.x;
    this._y = this.y;
    this.w = this.image.width;
    this.h = this.image.height;
  }

}, _temp17)) || _class36;
export let Sprite = rClass(_class38 = (_temp18 = class Sprite extends GraphicComponent {
  constructor(x, y, image, frameW, frameH) {
    super();
    this._x = void 0;
    this._y = void 0;
    this.origin = void 0;
    this.scale = void 0;
    this.image = void 0;
    this.frame = void 0;
    this.animations = void 0;
    this.animation = void 0;
    this.fps = void 0;
    this.time = void 0;
    this.frameWidth = void 0;
    this.frameHeight = void 0;
    this.flip = void 0;
    this.alpha = void 0;
    this.angle = void 0;
    this.ignoreCamera = false;
    this.playing = void 0;
    this.loop = void 0;
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
    if (!this.image.valid) return;
    var fx = 0;
    var fy = 0;
    var ox = 0;
    var oy = 0;

    if (this.animation) {
      var frame = this.animation[this.frame];
      var rowLength = Math.floor(this.image.width / this.frameWidth);
      fx = frame % rowLength * this.frameWidth;
      fy = Math.floor(frame / rowLength) * this.frameHeight;
    }

    Rabbit.Instance.context.save();
    Rabbit.Instance.context.globalAlpha = this.alpha;
    this._x = this.x;
    this._y = this.y;
    if (this.ignoreCamera) Rabbit.Instance.context.translate(Math.floor(this._x), Math.floor(this._y));else Rabbit.Instance.context.translate(Math.floor(this._x + Rabbit.Instance.camera.x), Math.floor(this._y + Rabbit.Instance.camera.y));
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
    if (this.ignoreCamera) Rabbit.Instance.context.translate(Math.floor(this._x), Math.floor(this._y));else Rabbit.Instance.context.translate(Math.floor(this._x + Rabbit.Instance.camera.x), Math.floor(this._y + Rabbit.Instance.camera.y));
    Rabbit.Instance.context.clearRect(0, 0, Math.floor(this.w), Math.floor(this.h));
    Rabbit.Instance.context.restore();
    this._x = this.x;
    this._y = this.y;
    this.w = this.frameWidth;
    this.h = this.frameHeight;
    this.time += dtime;

    if (this.fps > 0 && this.time > 1 / this.fps) {
      ++this.frame;

      while (this.time > 1 / this.fps) this.time -= 1 / this.fps;

      if (this.frame >= this.animation.length) {
        if (this.loop) this.frame -= this.animation.length;else this.frame = this.animation.length - 1;
      }
    }
  }

}, _temp18)) || _class38;
/**
 * 需要重构
 */

export let Tilemap = rClass(_class40 = (_temp19 = class Tilemap extends GraphicComponent {
  constructor(x, y, image, tw, th, gw, gh, tiles) {
    super();
    this.gridW = void 0;
    this.gridH = void 0;
    this.tileW = void 0;
    this.tileH = void 0;
    this.image = void 0;
    this.canvas = void 0;
    this.tiles = void 0;
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
    if (this.canvas) this.canvas.draw();
  }

  tile(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.gridW || ty >= this.gridH) return undefined;
    return this.tiles[ty * this.gridW + tx];
  }

  setTile(tx, ty, tile) {
    if (tx < 0 || ty < 0 || tx >= this.gridW || ty >= this.gridH) return;
    this.tiles[ty * this.gridW + tx] = tile;
    var sheetW = Math.floor(this.image.width / this.tileW);
    var sheetH = Math.floor(this.image.height / this.tileH);
    var col = (tile - 1) % sheetW;
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

    if (!this.canvas && this.image.valid) {
      this.build();
    }
  }

}, _temp19)) || _class40;
/**
 * @class Canvas类
 */

export let Canvas = rClass(_class42 = (_temp20 = class Canvas extends GraphicComponent {
  constructor(x, y, w, h) {
    super();
    this.alpha = void 0;
    this.canvas = void 0;
    this.context = void 0;
    this.ignoreCamera = false;
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
    if (this.ignoreCamera) Rabbit.Instance.context.translate(Math.floor(this.x), Math.floor(this.y));else Rabbit.Instance.context.translate(Math.floor(this.x + Rabbit.Instance.camera.x), Math.floor(this.y + Rabbit.Instance.camera.y));
    Rabbit.Instance.context.drawImage(this.canvas, 0, 0);
    Rabbit.Instance.context.restore();
  }

  update(dtime) {
    Rabbit.Instance.context.clearRect(Math.floor(this.x - 1), Math.floor(this.y - 1), Math.floor(this.w + 1), Math.floor(this.h + 1));
  }

}, _temp20)) || _class42;
/**
 * @class 引擎工具集合类
 */

export let EngineTools = rClass(_class44 = class EngineTools {
  /**
   * 删除对象数组中一个元素
   * @static
   */
  static deleteItemFromList(item, list) {
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

}) || _class44; // export { rabbitClass, Rabbit, Canvas, Circle, Collision, Entity, Graphic, GraphicList, RabObject, RabText, Rect, Sfx, Sprite, Tilemap, World, RabKeyType, RabImage, Component, TestComponent };