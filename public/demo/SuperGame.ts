import { Canvas, Color, Component, Entity, Rabbit, Rect, Text, Vec2, Vec3 } from "../ts/Core";
import { NodePool as EntityPool } from "../ts/NodePool";

const playerModel: string =
    "                                 __                                 " + "\n" +
    "                          ______/||\______                          " + "\n" +
    "                         |______||||______|                         " + "\n" +
    "                         |      ||||      |                         " + "\n" +
    "                         '---___ || ___---'                         " + "\n" +
    "                               | || |                               " + "\n" +
    "                               |    |                               " + "\n" +
    "                               | . .|                               " + "\n" +
    "                               |  . |                               " + "\n" +
    "                  _______     _|    |_     _______                  " + "\n" +
    "  _______________|_______|..-~:| . .|:~-..|_______|_______________  " + "\n" +
    " /________________:  .        :| .  |:       .   :________________\ " + "\n" +
    " |:    .       .     .        :| .  |:       .         .     .   :| " + "\n" +
    " |:    . . . . .  .  .  .     :|. . |:    .  .  .      . . . .   :| " + "\n" +
    " |:    .       .  ________    :|    |:    ________     .     .   :| " + "\n" +
    " \_______________/________\____|    |____/________\______________/  " + "\n" +
    "                 |__|__|__|    |.  .|    |__|__|__|                 " + "\n" +
    "                  \/ \/ \/     |.  .|     \/ \/ \/                  " + "\n" +
    "                               | __ |                               " + "\n" +
    "                               |/__\|                               " + "\n" +
    "                               ||__||                               " + "\n" +
    "                               |\__/|                               " + "\n" +
    "                               |    |                               " + "\n" +
    "                               \____/                               " + "\n" +
    "                                \|||                                " + "\n" +
    "                                \||/                                " + "\n" +
    "                                 ~~                                 " + "\n" +
    "                                                                    ";
const enemyModel: string =
    "                                          __                                          " + "\n" +
    "                                ________ /||\_________                                " + "\n" +
    "                               |________:||||:________|                               " + "\n" +
    "                               |        :||||:        |                               " + "\n" +
    "                               '---..___| || |___..---'                               " + "\n" +
    "                                       |  ||  |                                       " + "\n" +
    "                                       |      |                                       " + "\n" +
    "                                       |      |                                       " + "\n" +
    "                                       |   .  |                                       " + "\n" +
    "                                       |   .  |                                       " + "\n" +
    "                                       |   .  |                                       " + "\n" +
    "                                       |. . . |                                       " + "\n" +
    "                                       |   .  |                                       " + "\n" +
    "                        _______       _|      |_       _______                        " + "\n" +
    "  _____________________|_______|..--~~:|. . . |:~~--..|_______|_____________________  " + "\n" +
    " /______________________:  .          :|  .   |:         .   :______________________\ " + "\n" +
    " |:    .         .         .          :|  .   |:         .             .       .   :| " + "\n" +
    " |:    . . . . . .      .  .  .       :| . . .|:      .  .  .          . . . . .   :| " + "\n" +
    " |:    .         .      ________      :|      |:      ________         .       .   :| " + "\n" +
    " \_____________________/________\______|      |______/________\____________________/  " + "\n" +
    "                       |__|__|__|      |..  ..|      |__|__|__|                       " + "\n" +
    "                        \/ \/ \/       |..  ..|       \/ \/ \/                        " + "\n" +
    "                                       |      |                                       " + "\n" +
    "                                       |. . . |                                       " + "\n" +
    "                                       |  __  |                                       " + "\n" +
    "                                       | /__\ |                                       " + "\n" +
    "                                       | |__| |                                       " + "\n" +
    "                                       | |__| |                                       " + "\n" +
    "                                       | |__| |                                       " + "\n" +
    "                                       | \__/ |                                       " + "\n" +
    "                                       |:    :|                                       " + "\n" +
    "                                       \______/                                       " + "\n" +
    "                                        \\|||/                                        " + "\n" +
    "                                         \||/                                         " + "\n" +
    "                                          ~~                                          " + "\n" +
    "                                                                                      ";
const bulletModel: string = "/\\";
export default class SuperGame {
    canvas: Canvas;
    root: Entity;
    player: Entity;
    BOUND_WIDTH: number;
    BOUND_HEIGHT: number;
    BOUND_UP: number;
    BOUND_DOWN: number;
    BOUND_RIGHT: number;
    BOUND_LEFT: number;
    bulletPreNode: Entity;
    bulletsPool: EntityPool;
    constructor(canvas?: Canvas) {
        if (canvas) this.canvas = canvas;
        else this.canvas = Rabbit.Instance.canvas;
        this.createGame();
    }
    createGame() {
        console.log("你好", this.canvas)

        this.setRoot();

        this.initBullet();

        this.initPlayer();

        this.initEnemy();

        this.BulletShoot();
    }

    private BulletShoot() {
        const tween = new Tween(this.player).delay(0.3).call(() => { this.shootOneBullet(); tween.start(); }).start();
    }
    private gameOver() {
        const gameOverNode = new Entity();
        const lab = gameOverNode.addComponent(Text);
        this.root.addChild(gameOverNode);
        lab.size = 40;
        lab.lineHeight = 40;
        gameOverNode.transform.color = Color.BLACK;
        lab.text = '恭喜你！游戏胜利！';
        gameOverNode.transform.setPosition(0, 0);
        setTimeout(() => {
            this.root.destroy();
        }, 3000);
    }
    private initEnemy() {
        const enemy = this.getAscIIModel(enemyModel);
        this.root.addChild(enemy);
        enemy.transform.setPosition(0, 320);
        // console.log("enemy大小",enemy.getContentSize());

        let hp = 10;
        const hpNode = new Entity();
        const hpLab = hpNode.addComponent(Text);
        enemy.addChild(hpNode);
        hpLab.size = 40;
        hpLab.lineHeight = 40;
        hpNode.transform.color = Color.BLACK;
        hpLab.text = 'HP:----------';
        hpNode.transform.setPosition(0, enemy.transform.height / 2 + 50);

        const collider = enemy.addComponent(SuperBoxCollider);
        collider.group = "enemy";
        collider.isTrigger = true;
        collider.onColliderEnter = (other) => {
            other.entity.destroy();
            hp -= 1;
            hpLab.text = hpLab.text.substr(0, hpLab.text.length - 1);
            if (hp <= 0) {
                enemy.destroy();
                this.gameOver();
            }
            console.log("碰撞拉");
        }
    }

    private initPlayer() {
        const player = this.getAscIIModel(playerModel);
        player.transform.scaleY = -1;
        this.root.addChild(player);
        player.transform.setPosition(0, -350);
        const playerTouchCtl = new TouchController(player);
        playerTouchCtl.startEvent = () => {
            (player as any).startPoint = player.transform.position;
        };
        playerTouchCtl.moveEvent = (vecadd) => {
            const startPoint = (player as any).startPoint;
            player.transform.setPosition(startPoint.x + vecadd.x, startPoint.y + vecadd.y);
        };
        const collider = player.addComponent(SuperBoxCollider);
        collider.group = "player";

        this.player = player;
    }

    private shootOneBullet() {
        const bullet = this.getBullet();
        this.root.addChild(bullet);
        const bulletStartPos: Vec3 = new Vec3(this.player.transform.x, this.player.transform.top);
        bullet.transform.setPosition(bulletStartPos);
        const bulletFlyTween = new Tween();
        bulletFlyTween.target(bullet)
            .by(1, { y: 300 })
            .call(() => {
                if (bullet.transform.y >= this.BOUND_UP + bullet.transform.height * 2) {
                    bullet.destroy();
                    console.log("bullet销毁");
                    return;
                }
                bulletFlyTween.start();
            })
            .start();
    }

    private initBullet() {
        this.bulletPreNode = this.getAscIIModel(bulletModel);
        const collider = this.bulletPreNode.addComponent(SuperBoxCollider);
        collider.group = "player_bullet";
        this.bulletPreNode.active = false;
    }
    private getBullet(type?): Entity {

        const bullet = this.getAscIIModel(bulletModel);
        const collider = bullet.addComponent(SuperBoxCollider);
        collider.group = "player_bullet";
        return bullet;
    }
    private setRoot() {
        this.root = new Entity();
        this.canvas.entity.addChild(this.root);
        this.root.transform.setPosition(new Vec2(0, 0));
        this.root.transform.width = this.canvas.resolution.width;
        this.root.transform.height = this.canvas.resolution.height;
        this.BOUND_WIDTH = this.root.transform.width;
        this.BOUND_HEIGHT = this.root.transform.height;
        this.BOUND_LEFT = this.root.transform.left;
        this.BOUND_RIGHT = this.root.transform.right;
        this.BOUND_DOWN = this.root.transform.down;
        this.BOUND_UP = this.root.transform.top;
        console.log("----------------------------------")
        console.log("游戏画布宽度：", this.BOUND_WIDTH);
        console.log("游戏画布高度：", this.BOUND_HEIGHT);
        console.log("画布左边界坐标：", this.BOUND_LEFT);
        console.log("画布右边界坐标：", this.BOUND_RIGHT);
        console.log("画布上边界坐标：", this.BOUND_UP);
        console.log("画布下边界坐标：", this.BOUND_DOWN);
        console.log("----------------------------------")
    }

    private getAscIIModel(str: string): Entity {
        const flyNode = new Entity();
        const label = flyNode.addComponent(Text);
        label.text = str;
        label.size = 10;
        label.lineHeight = 10;
        label.align = Text.TextAlignType.center;
        flyNode.transform.color = Color.BLACK;
        // const labelOutline = flyNode.addComponent(cc.LabelOutline);
        // labelOutline.color = cc.Color.BLACK;
        // labelOutline.width = 2;
        // console.log(label.string);
        return flyNode;
    }
}




export class TouchController {
    target: Entity;
    isAllowTouch: boolean = true;   //允许移动
    startPoint: any;
    endPoint: any;
    movePoint: any;
    moveEvent: (vecadd: any) => void;
    startEvent: () => void;
    constructor(node: Entity) {
        this.target = node;
        this.addEventHandler();
    }
    setAllowTouch(isallow: boolean) {
        this.isAllowTouch = isallow;
    }
    // 用来处理事件监听 方向判断
    addEventHandler() {
        // touchstart 当手指触摸到屏幕时
        this.target.on('touchstart', (event) => {
            if (!this.isAllowTouch) return;
            this.startPoint = event.getLocation();
            this.startEvent();
        });
        //touchend 当手指在目标节点区域内离开屏幕时。 */
        this.target.on('touchend', (event) => {
            if (!this.isAllowTouch) return;
            this.touchEnd(event);
        });

        this.target.on('touchmove', (event) => {
            if (!this.isAllowTouch) return;
            this.touchMove(event);
        });
        //touchcancel 当手指在目标节点区域外离开屏幕时
        this.target.on('touchcancel', (event) => {
            if (!this.isAllowTouch) return;
            this.touchEnd(event);
        });

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
        let vec = this.movePoint.sub(this.startPoint);
        this.moveEvent(vec);
        // 设置长度才去执行响应
        // 计算两点之间的向量及其模长：cc.pSub(p1, p2) 从 v2.0 开始被废弃，目前最新的替代方法是：p1.sub(p2)；

        // 2，两个点的距离计算：cc.pLength(p)
        // 改为：p.mag()
        // if (vec.mag(vec) > this.minLength) {
        //     // 水平方向

        // }
    }
    destroy() {
        this.target.off("touchstart");
        this.target.off("touchend");
        this.target.off("touchmove");
        this.target.off("touchcancel");
    }
}

export class SuperBoxCollider extends Component {
    private static _groupMap: Map<string, string[]> = new Map([["enemy", ["player_bullet"]]]);

    private static _insts: SuperBoxCollider[] = [];

    entity: Entity;

    box: Rect;

    _group: string = "default";

    onColliderEnter: (other: SuperBoxCollider) => void;
    onColliderStay: (other: SuperBoxCollider) => void;
    onColliderQuit: (other: SuperBoxCollider) => void;
    set group(value) {
        this._group = value;
    }
    get group() {
        return this._group;
    }

    _isTrigger: boolean = false;
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
        this.box = this.entity.transform.getRect();
        // console.log("box", this.box);
    }

    checkCollision() {
        // console.log("执行checkCollision");
        const groups = SuperBoxCollider._groupMap.get(this.group);
        if (!groups) return;
        groups.forEach((group) => {
            const targets = this.getGroupInsts(group);
            // console.log("targets");
            targets.forEach((other) => {
                if (this.isCollision(other)) {
                    this.onColliderEnter(other);
                }
            })
        })

    }
    getGroupInsts(group: string) {
        return SuperBoxCollider._insts.filter((item) => { return item.group == group });
    }

    isCollision(other: SuperBoxCollider) {
        return this.box.intersects(other.box);
    }

    onLoad() {
        SuperBoxCollider.addComInst(this);
        this.entity.on(Entity.EventType.POSITION_CHANGED, this.updateBox, this);
        this.box = this.entity.transform.getRect();
    }

    onDestroy() {
        this.entity.off(Entity.EventType.POSITION_CHANGED, this.updateBox, this);
        SuperBoxCollider.deleteComInst(this);
    }

    openTriggerCheck() {
        // this.node.on(Entity.EventType.POSITION_CHANGED, this.checkCollision, this);
    }
    update() {
        if (this.isTrigger) this.checkCollision();
    }
    closeTriggerCheck() {
        // this.node.off(Entity.EventType.POSITION_CHANGED, this.checkCollision, this);
    }
    static addComInst(inst: SuperBoxCollider) {
        this._insts.push(inst);
    }
    static deleteComInst(inst: SuperBoxCollider) {
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
