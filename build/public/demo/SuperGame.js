import { Color, Component, Entity, Rabbit, Text, TextAlignType, Vec3 } from "../ts/Core.js";
import Tween from "../ts/tweens/Tween.js";
const playerModel = "                                 __                                 " + "\n" + "                          ______/||\______                          " + "\n" + "                         |______||||______|                         " + "\n" + "                         |      ||||      |                         " + "\n" + "                         '---___ || ___---'                         " + "\n" + "                               | || |                               " + "\n" + "                               |    |                               " + "\n" + "                               | . .|                               " + "\n" + "                               |  . |                               " + "\n" + "                  _______     _|    |_     _______                  " + "\n" + "  _______________|_______|..-~:| . .|:~-..|_______|_______________  " + "\n" + " /________________:  .        :| .  |:       .   :________________\ " + "\n" + " |:    .       .     .        :| .  |:       .         .     .   :| " + "\n" + " |:    . . . . .  .  .  .     :|. . |:    .  .  .      . . . .   :| " + "\n" + " |:    .       .  ________    :|    |:    ________     .     .   :| " + "\n" + " \_______________/________\____|    |____/________\______________/  " + "\n" + "                 |__|__|__|    |.  .|    |__|__|__|                 " + "\n" + "                  \/ \/ \/     |.  .|     \/ \/ \/                  " + "\n" + "                               | __ |                               " + "\n" + "                               |/__\|                               " + "\n" + "                               ||__||                               " + "\n" + "                               |\__/|                               " + "\n" + "                               |    |                               " + "\n" + "                               \____/                               " + "\n" + "                                \|||                                " + "\n" + "                                \||/                                " + "\n" + "                                 ~~                                 " + "\n" + "                                                                    ";
const enemyModel = "                                          __                                          " + "\n" + "                                ________ /||\_________                                " + "\n" + "                               |________:||||:________|                               " + "\n" + "                               |        :||||:        |                               " + "\n" + "                               '---..___| || |___..---'                               " + "\n" + "                                       |  ||  |                                       " + "\n" + "                                       |      |                                       " + "\n" + "                                       |      |                                       " + "\n" + "                                       |   .  |                                       " + "\n" + "                                       |   .  |                                       " + "\n" + "                                       |   .  |                                       " + "\n" + "                                       |. . . |                                       " + "\n" + "                                       |   .  |                                       " + "\n" + "                        _______       _|      |_       _______                        " + "\n" + "  _____________________|_______|..--~~:|. . . |:~~--..|_______|_____________________  " + "\n" + " /______________________:  .          :|  .   |:         .   :______________________\ " + "\n" + " |:    .         .         .          :|  .   |:         .             .       .   :| " + "\n" + " |:    . . . . . .      .  .  .       :| . . .|:      .  .  .          . . . . .   :| " + "\n" + " |:    .         .      ________      :|      |:      ________         .       .   :| " + "\n" + " \_____________________/________\______|      |______/________\____________________/  " + "\n" + "                       |__|__|__|      |..  ..|      |__|__|__|                       " + "\n" + "                        \/ \/ \/       |..  ..|       \/ \/ \/                        " + "\n" + "                                       |      |                                       " + "\n" + "                                       |. . . |                                       " + "\n" + "                                       |  __  |                                       " + "\n" + "                                       | /__\ |                                       " + "\n" + "                                       | |__| |                                       " + "\n" + "                                       | |__| |                                       " + "\n" + "                                       | |__| |                                       " + "\n" + "                                       | \__/ |                                       " + "\n" + "                                       |:    :|                                       " + "\n" + "                                       \______/                                       " + "\n" + "                                        \\|||/                                        " + "\n" + "                                         \||/                                         " + "\n" + "                                          ~~                                          " + "\n" + "                                                                                      ";
const bulletModel = "/\\";
export default class SuperGame {
  constructor(canvas) {
    this.canvas = void 0;
    this.root = void 0;
    this.player = void 0;
    this.BOUND_WIDTH = void 0;
    this.BOUND_HEIGHT = void 0;
    this.BOUND_UP = void 0;
    this.BOUND_DOWN = void 0;
    this.BOUND_RIGHT = void 0;
    this.BOUND_LEFT = void 0;
    this.bulletPreNode = void 0;
    this.bulletsPool = void 0;
    if (canvas) this.canvas = canvas;else this.canvas = Rabbit.Instance.canvas;
    this.createGame();
  }

  createGame() {
    console.log("你好", this.canvas);
    this.setRoot();
    this.initBullet();
    this.initPlayer();
    this.initEnemy();
    this.BulletShoot();
  }

  BulletShoot() {
    const tween = new Tween(this.player).delay(0.3).onComplete(() => {
      this.shootOneBullet();
      tween.start();
    }).start();
  }

  gameOver() {
    const gameOverNode = new Entity();
    const lab = gameOverNode.addComponent(Text);
    this.root.addChild(gameOverNode);
    lab.textSize = 40;
    lab.lineHeight = 40;
    gameOverNode.transform.color = Color.BLACK;
    lab.text = '恭喜你！游戏胜利！';
    gameOverNode.transform.setPosition(0, 0);
    setTimeout(() => {
      this.root.destroy();
    }, 3000);
  }

  initEnemy() {
    const enemy = this.getAscIIModel(enemyModel);
    this.root.addChild(enemy);
    enemy.transform.setPosition(0, -320); // console.log("enemy大小",enemy.getContentSize());

    let hp = 10;
    const hpNode = new Entity();
    const hpLab = hpNode.addComponent(Text);
    enemy.addChild(hpNode);
    hpLab.textSize = 40;
    hpLab.lineHeight = 40;
    hpNode.transform.color = Color.BLACK;
    hpLab.text = 'HP:----------';
    hpLab.align = TextAlignType.center;
    hpNode.transform.setPosition(0, enemy.transform.height / 2 + 50);
    const collider = enemy.addComponent(SuperBoxCollider);
    collider.group = "enemy";
    collider.isTrigger = true;

    collider.onColliderEnter = other => {
      other.entity.destroy();
      hp -= 1;
      hpLab.text = hpLab.text.substr(0, hpLab.text.length - 1);

      if (hp <= 0) {
        enemy.destroy();
        this.gameOver();
      }

      console.log("碰撞拉");
    };
  }

  initPlayer() {
    const player = this.getAscIIModel(playerModel);
    console.log("player初始化");
    this.root.addChild(player);
    player.transform.scaleY = -1;
    console.log("root", this.root);
    player.transform.setPosition(0, 350);
    console.log("player设置坐标后", player.transform.getRect());
    const playerTouchCtl = new TouchController(player);

    playerTouchCtl.startEvent = () => {
      player.startPoint = player.transform.position;
    };

    playerTouchCtl.moveEvent = vecadd => {
      const startPoint = player.startPoint;
      player.transform.setPosition(startPoint.x + vecadd.x, startPoint.y - vecadd.y);
    };

    const collider = player.addComponent(SuperBoxCollider);
    collider.group = "player";
    this.player = player;
  }

  shootOneBullet() {
    const bullet = this.getBullet();
    this.root.addChild(bullet);
    const bulletStartPos = new Vec3(this.player.transform.x, this.player.transform.top);
    bullet.transform.setPosition(bulletStartPos);
    const bulletFlyTween = new Tween(bullet);
    bulletFlyTween.by({
      y: 300
    }, 1).onComplete(() => {
      if (bullet.transform.y >= this.BOUND_UP + bullet.transform.height * 2) {
        bullet.destroy();
        console.log("bullet销毁");
        return;
      }

      bulletFlyTween.start();
    }).start();
  }

  initBullet() {
    this.bulletPreNode = this.getAscIIModel(bulletModel);
    const collider = this.bulletPreNode.addComponent(SuperBoxCollider);
    collider.group = "player_bullet";
    this.bulletPreNode.active = false;
  }

  getBullet(type) {
    const bullet = this.getAscIIModel(bulletModel);
    const collider = bullet.addComponent(SuperBoxCollider);
    collider.group = "player_bullet";
    return bullet;
  }

  setRoot() {
    this.root = this.canvas.entity;
    this.BOUND_WIDTH = this.root.transform.width;
    this.BOUND_HEIGHT = this.root.transform.height;
    this.BOUND_LEFT = this.root.transform.left;
    this.BOUND_RIGHT = this.root.transform.right;
    this.BOUND_DOWN = this.root.transform.down;
    this.BOUND_UP = this.root.transform.top;
    console.log("----------------------------------");
    console.log("游戏画布宽度：", this.BOUND_WIDTH);
    console.log("游戏画布高度：", this.BOUND_HEIGHT);
    console.log("画布左边界坐标：", this.BOUND_LEFT);
    console.log("画布右边界坐标：", this.BOUND_RIGHT);
    console.log("画布上边界坐标：", this.BOUND_UP);
    console.log("画布下边界坐标：", this.BOUND_DOWN);
    console.log("----------------------------------");
  }

  getAscIIModel(str) {
    const flyNode = new Entity();
    const label = flyNode.addComponent(Text);
    label.text = str;
    label.textSize = 10;
    label.lineHeight = 10;
    label.align = Text.TextAlignType.center;
    flyNode.transform.color = Color.BLACK; // const labelOutline = flyNode.addComponent(cc.LabelOutline);
    // labelOutline.color = cc.Color.BLACK;
    // labelOutline.width = 2;
    // console.log(label.string);

    console.log("模型" + flyNode.transform.entity.name, flyNode.transform.getRect());
    return flyNode;
  }

}
export class TouchController {
  //允许移动
  constructor(node) {
    this.target = void 0;
    this.isAllowTouch = true;
    this.startPoint = void 0;
    this.endPoint = void 0;
    this.movePoint = void 0;
    this.moveEvent = void 0;
    this.startEvent = void 0;
    this.target = node;
    this.addEventHandler();
  }

  setAllowTouch(isallow) {
    this.isAllowTouch = isallow;
  } // 用来处理事件监听 方向判断


  addEventHandler() {
    // touchstart 当手指触摸到屏幕时
    this.target.listen(Entity.EventType.MOUSE_DOWN, event => {
      if (!this.isAllowTouch) return;
      this.startPoint = event.getLocation();
      console.log("startPoint change", this.startPoint);
      this.startEvent();
    }, this); //touchend 当手指在目标节点区域内离开屏幕时。 */

    this.target.listen(Entity.EventType.MOUSE_UP, event => {
      if (!this.isAllowTouch) return;
      this.touchEnd(event);
    }, this);
    this.target.listen(Entity.EventType.MOUSE_PRESS, event => {
      if (!this.isAllowTouch) return;
      this.touchMove(event);
    }, this); //touchcancel 当手指在目标节点区域外离开屏幕时
    // this.target.listen('touchcancel', (event) => {
    //     if (!this.isAllowTouch) return;
    //     this.touchEnd(event);
    // },this);
  }

  touchEnd(event) {
    // 拿到结束的节点
    this.endPoint = event.getLocation();
  }

  touchMove(event) {
    // 拿到滑动过程坐标
    this.movePoint = event.getLocation();
    this.finishUserMove();
  }

  finishUserMove() {
    // sub 向量减法，并返回新结果。
    const vec = this.movePoint.sub(this.startPoint);
    this.moveEvent(vec); // 设置长度才去执行响应
    // 计算两点之间的向量及其模长：cc.pSub(p1, p2) 从 v2.0 开始被废弃，目前最新的替代方法是：p1.sub(p2)；
    // 2，两个点的距离计算：cc.pLength(p)
    // 改为：p.mag()
    // if (vec.mag(vec) > this.minLength) {
    //     // 水平方向
    // }
  }

  destroy() {
    this.target.listenOff(Entity.EventType.MOUSE_DOWN);
    this.target.listenOff(Entity.EventType.MOUSE_UP);
    this.target.listenOff(Entity.EventType.MOUSE_PRESS); // this.target.listenOff("touchcancel");
  }

}
export class SuperBoxCollider extends Component {
  constructor(...args) {
    super(...args);
    this.entity = void 0;
    this.box = void 0;
    this._group = "default";
    this.onColliderEnter = void 0;
    this.onColliderStay = void 0;
    this.onColliderQuit = void 0;
    this._isTrigger = false;
  }

  set group(value) {
    this._group = value;
  }

  get group() {
    return this._group;
  }

  set isTrigger(value) {
    if (value == true) {
      this.openTriggerCheck();
    } else {
      this.closeTriggerCheck();
    }

    this._isTrigger = value;
  }

  get isTrigger() {
    return this._isTrigger;
  }

  updateBox() {
    this.box = this.entity.transform.getRect(); // console.log("box", this.box);
  }

  checkCollision() {
    // console.log("执行checkCollision");
    const groups = SuperBoxCollider._groupMap.get(this.group);

    if (!groups) return;
    groups.forEach(group => {
      const targets = this.getGroupInsts(group); // console.log("targets");

      targets.forEach(other => {
        if (this.isCollision(other)) {
          this.onColliderEnter(other);
        }
      });
    });
  }

  getGroupInsts(group) {
    return SuperBoxCollider._insts.filter(item => {
      return item.group == group;
    });
  }

  isCollision(other) {
    return this.box.intersects(other.box);
  }

  onLoad() {
    SuperBoxCollider.addComInst(this);
    this.entity.listen(Entity.EventType.POSITION_CHANGED, this.updateBox, this);
    this.box = this.entity.transform.getRect();
  }

  onDestroy() {
    this.entity.listenOff(Entity.EventType.POSITION_CHANGED, this.updateBox, this);
    SuperBoxCollider.deleteComInst(this);
  }

  openTriggerCheck() {// this.node.on(Entity.EventType.POSITION_CHANGED, this.checkCollision, this);
  }

  update() {
    if (this.isTrigger) this.checkCollision();
  }

  closeTriggerCheck() {// this.node.off(Entity.EventType.POSITION_CHANGED, this.checkCollision, this);
  }

  static addComInst(inst) {
    this._insts.push(inst);
  }

  static deleteComInst(inst) {
    SuperBoxCollider.deleteItemFromList(inst, SuperBoxCollider._insts);
  }

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

  static changeItemFromList(old, newone, list) {
    let flag = false;

    for (let i = 0; i < list.length; i++) {
      if (old == list[i]) {
        list[i] = newone;
        flag = true;
        break;
      }
    }

    if (!flag) console.warn("deleteItemFromList方法未找到要改变的元素");
  }

}
SuperBoxCollider._groupMap = new Map([["enemy", ["player_bullet"]]]);
SuperBoxCollider._insts = [];