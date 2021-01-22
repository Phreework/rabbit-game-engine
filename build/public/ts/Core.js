var _class, _class2, _temp, _class3, _class4, _temp2, _class6, _class7, _temp3, _class9, _temp4, _class11, _class12, _temp5, _class14, _temp6, _class16, _temp7, _class18, _class19, _temp8, _class20, _temp9, _class22, _temp10, _class24, _temp11, _class26, _temp12, _class28, _temp13, _class30, _temp14, _class32, _temp15;

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
 * 描述：rabbit 引擎是一个极易上手并且性能强劲的H5游戏引擎，具有 实体-组件-管线 的特色开发架构。
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

export let RabKeyType;
/**
 * ###en
 * 
 * ###zh
 * 游戏实例
 */

(function (RabKeyType) {
  RabKeyType[RabKeyType["A"] = 65] = "A";
  RabKeyType[RabKeyType["B"] = 66] = "B";
  RabKeyType[RabKeyType["C"] = 67] = "C";
  RabKeyType[RabKeyType["D"] = 68] = "D";
  RabKeyType[RabKeyType["E"] = 69] = "E";
  RabKeyType[RabKeyType["F"] = 70] = "F";
  RabKeyType[RabKeyType["G"] = 71] = "G";
  RabKeyType[RabKeyType["H"] = 72] = "H";
  RabKeyType[RabKeyType["I"] = 73] = "I";
  RabKeyType[RabKeyType["J"] = 74] = "J";
  RabKeyType[RabKeyType["K"] = 75] = "K";
  RabKeyType[RabKeyType["L"] = 76] = "L";
  RabKeyType[RabKeyType["M"] = 77] = "M";
  RabKeyType[RabKeyType["N"] = 78] = "N";
  RabKeyType[RabKeyType["O"] = 79] = "O";
  RabKeyType[RabKeyType["P"] = 80] = "P";
  RabKeyType[RabKeyType["Q"] = 81] = "Q";
  RabKeyType[RabKeyType["R"] = 82] = "R";
  RabKeyType[RabKeyType["S"] = 83] = "S";
  RabKeyType[RabKeyType["T"] = 84] = "T";
  RabKeyType[RabKeyType["U"] = 85] = "U";
  RabKeyType[RabKeyType["V"] = 86] = "V";
  RabKeyType[RabKeyType["W"] = 87] = "W";
  RabKeyType[RabKeyType["X"] = 88] = "X";
  RabKeyType[RabKeyType["Y"] = 89] = "Y";
  RabKeyType[RabKeyType["Z"] = 90] = "Z";
  RabKeyType[RabKeyType["ZERO"] = 48] = "ZERO";
  RabKeyType[RabKeyType["ONE"] = 49] = "ONE";
  RabKeyType[RabKeyType["TWO"] = 50] = "TWO";
  RabKeyType[RabKeyType["THREE"] = 51] = "THREE";
  RabKeyType[RabKeyType["FOUR"] = 52] = "FOUR";
  RabKeyType[RabKeyType["FIVE"] = 53] = "FIVE";
  RabKeyType[RabKeyType["SIX"] = 54] = "SIX";
  RabKeyType[RabKeyType["SEVEN"] = 55] = "SEVEN";
  RabKeyType[RabKeyType["EIGHT"] = 56] = "EIGHT";
  RabKeyType[RabKeyType["NINE"] = 57] = "NINE";
  RabKeyType[RabKeyType["LEFT"] = 37] = "LEFT";
  RabKeyType[RabKeyType["UP"] = 38] = "UP";
  RabKeyType[RabKeyType["RIGHT"] = 39] = "RIGHT";
  RabKeyType[RabKeyType["DOWN"] = 40] = "DOWN";
  RabKeyType[RabKeyType["SPACE"] = 32] = "SPACE";
})(RabKeyType || (RabKeyType = {}));

export let Rabbit = rClass(_class = (_temp = _class2 = class Rabbit {
  get winSize() {
    return new Rect(0, 0, this.canvas.width, this.canvas.height);
  }

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
    this.time = void 0;
    this._nextWorld = void 0;
    this.worldMap = new Map();
    this.isRabbitRun = false;
    this.updateId = null;
    if (!Rabbit.Instance) Rabbit.Instance = this;
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
    console.log("event", event);
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

  setWorld(world) {
    this._nextWorld = world;
  }

  addWorld(world) {
    this.worldMap.set(world.name, world);
  }

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

  stop() {
    if (this.updateId) clearInterval(this.updateId);else return false;
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

}, _class2.Instance = null, _class2.images = new Map(), _class2.audioChannels = [], _class2.version = 0.2, _temp)) || _class;
export let RabObject = rClass(_class3 = class RabObject {
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

}) || _class3;
export let Component = rClass(_class4 = (_temp2 = class Component extends RabObject {
  constructor(...args) {
    super(...args);
    this.entity = void 0;
    this.enabled = void 0;
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

}, _temp2)) || _class4;
export let TestComponent = rClass(_class6 = class TestComponent extends Component {}) || _class6;
export let Entity = rClass(_class7 = (_temp3 = class Entity extends RabObject {
  constructor(x, y) {
    super();
    this.x = void 0;
    this.y = void 0;
    this.rect = void 0;
    this.graphic = void 0;
    this.type = void 0;
    this.world = void 0;
    this.name = void 0;
    this.id = void 0;
    this.active = true;
    this.components = [];
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.rect = new Rect(0, 0, 0, 0);
    this.type = "entity";
    this.world = null;
  }

  keyDown(key) {}

  keyUp(key) {}

  mouseDown() {}

  removed() {}

  added() {}

  collide(rect) {
    return false;
  }

  draw() {
    // console.log("进来了draw")
    if (this.active && this.graphic && this.graphic.visible != false) this.graphic.draw();
  }

  start() {
    const len = this.components.length;

    if (len == 0) {
      return;
    } else {
      for (let i = 0; i < len; i++) {
        this.components[i].onLoad();
        this.components[i].start();
      }
    }
  }

  update(dtime) {
    const len = this.components.length;

    if (len == 0) {
      return;
    } else {
      for (let i = 0; i < len; i++) {
        this.components[i].update(dtime);
      }
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
        newCom.onLoad();
        newCom.start();
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

}, _temp3)) || _class7;
export let Sfx = rClass(_class9 = (_temp4 = class Sfx extends RabObject {
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

}, _temp4)) || _class9;
export let AudioSystem = rClass(_class11 = class AudioSystem extends RabObject {
  static play(soundurl) {
    const audio = Rabbit.loadAudio(soundurl);
    audio.play();
  }

}) || _class11;
export let World = rClass(_class12 = (_temp5 = class World extends RabObject {
  constructor(name) {
    super();
    this.name = void 0;
    this.entities = [];
    this.removed = [];
    this.maxId = 0;
    this.init = void 0;
    this.name = name;
  }

  /**
   * 在世界中增加实体
   * @param e 要增加的实体
   */
  add(e) {
    this.entities.push(e);
    e.id = this.maxId++;
    e.world = this;
    e.added();
  }
  /**
   * 排序并派发世界中所有有渲染组件的实体执行渲染任务
   */


  draw() {
    this.entities.sort((lhs, rhs) => {
      if (!lhs.graphic) return -1;
      if (!rhs.graphic) return 1;
      if (lhs.graphic.z == rhs.graphic.z) return lhs.id - rhs.id;
      return lhs.graphic.z - rhs.graphic.z;
    });

    for (let i = 0; i < this.entities.length; ++i) {
      this.entities[i].draw();
    }
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

  getType(type) {
    return this.filter(e => {
      return e.type == type;
    });
  }

  keyDown(key) {
    for (let e = this.entities.length - 1; e >= 0; --e) {
      this.entities[e].keyDown(key);
    }
  }

  keyUp(key) {
    for (let e = this.entities.length - 1; e >= 0; --e) {
      this.entities[e].keyUp(key);
    }
  }

  mouseDown() {
    for (let e = this.entities.length - 1; e >= 0; --e) {
      this.entities[e].mouseDown();
    }
  }

  remove(e) {
    e.removed();
    this.removed.push(e);
  }

  _update(dtime) {
    for (let i = 0; i < this.entities.length; ++i) {
      const entity = this.entities[i];
      if (!entity.active) continue;
      entity.update(dtime);
    } //可能开销比较大？


    for (let j = 0; j < this.removed.length; ++j) {
      for (let i = 0; i < this.entities.length; ++i) {
        if (this.entities[i] == this.removed[j]) this.entities.splice(i, 1);
      }
    }

    this.removed = [];
  }

  update(dtime) {
    this._update(dtime);
  }

  start() {
    console.log("start事件总线执行");

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
    let collisions = [];

    for (let i = 0; i < this.entities.length; i++) {
      var e = this.entities[i];
      if (e.graphic == null) continue;
      let entRect = new Rect(e.graphic.x, e.graphic.y, e.graphic.w, e.graphic.h);
      if (rect.collideRect(entRect)) collisions.push(new Collision(e, entRect));
    }

    return collisions;
  }

}, _temp5)) || _class12;
export let Collision = rClass(_class14 = (_temp6 = class Collision {
  constructor(other, rect) {
    this.other = void 0;
    this.rect = void 0;
    this.other = other;
    this.rect = rect;
  }

}, _temp6)) || _class14;
export let GraphicComponent = rClass(_class16 = (_temp7 = class GraphicComponent extends Component {
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

}, _temp7)) || _class16;
export let TextAlignType;

(function (TextAlignType) {
  TextAlignType["left"] = "left";
  TextAlignType["right"] = "right";
  TextAlignType["center"] = "center";
  TextAlignType["start"] = "start";
  TextAlignType["end"] = "end";
})(TextAlignType || (TextAlignType = {}));

export let Text = rClass(_class18 = (_temp8 = _class19 = class Text extends GraphicComponent {
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
  }

}, _class19.TextAlignType = TextAlignType, _temp8)) || _class18;
export let Rect = rClass(_class20 = (_temp9 = class Rect extends RabObject {
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

}, _temp9)) || _class20;
export let Circle = rClass(_class22 = (_temp10 = class Circle extends RabObject {
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

}, _temp10)) || _class22;
;
export let GraphicList = rClass(_class24 = (_temp11 = class GraphicList extends GraphicComponent {
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

}, _temp11)) || _class24;
export let RabImage = rClass(_class26 = (_temp12 = class RabImage extends GraphicComponent {
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

  place(pos) {
    this.x = pos[0];
    this.y = pos[1];
  }

  update(dtime) {
    Rabbit.Instance.context.save();
    if (this.ignoreCamera) Rabbit.Instance.context.translate(Math.floor(this._x), Math.floor(this._y));else Rabbit.Instance.context.translate(Math.floor(this._x + Rabbit.Instance.camera.x), Math.floor(this._y + Rabbit.Instance.camera.y));
    Rabbit.Instance.context.clearRect(0, 0, Math.round(this.w), Math.round(this.h));
    Rabbit.Instance.context.restore();
    this._x = this.x;
    this._y = this.y;
    this.w = this.image.width;
    this.h = this.image.height;
  }

}, _temp12)) || _class26;
export let Sprite = rClass(_class28 = (_temp13 = class Sprite extends GraphicComponent {
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

}, _temp13)) || _class28;
export let Tilemap = rClass(_class30 = (_temp14 = class Tilemap extends GraphicComponent {
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
    this.canvas = new Canvas(this.x, this.y, this.tileW * this.gridW, this.tileH * this.gridH); //this.canvas = rabbit.Canvas.createRect(0, 0, tw*gw, th*gh, 'white') ;

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

}, _temp14)) || _class30;
export let Canvas = rClass(_class32 = (_temp15 = class Canvas extends GraphicComponent {
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

  createRect(x, y, w, h, colour) {
    var c = new Canvas(x, y, w, h);
    c.context.fillStyle = colour;
    c.context.fillRect(0, 0, w, h);
    return c;
  }

}, _temp15)) || _class32; // export { rabbitClass, Rabbit, Canvas, Circle, Collision, Entity, Graphic, GraphicList, RabObject, RabText, Rect, Sfx, Sprite, Tilemap, World, RabKeyType, RabImage, Component, TestComponent };