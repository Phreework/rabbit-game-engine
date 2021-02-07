import * as rEngine from "../ts/Core";
import { Entity, Rabbit, KeyType, Text, World, Component } from "../ts/Core";
import Tween from "../ts/tweens/Tween";
import { main as demo2 } from "./EffectButton";
import { main as demo3 } from "./IsoGame";
import { main as demo4 } from "./LightItUp";
import { main as demo5 } from "./QuestGame";
import SuperGame from "./SuperGame";
/**
 * 引擎完整功能测试Demo
 * @author PhreeSoda
 */
export class TestDemo {
    static demoInd: number = 0;
    static demos: World[];
    static nextWorld() {
        this.demoInd++;
        this.demoInd = (this.demoInd < this.demos.length) ? this.demoInd : 0;
        Rabbit.Instance.runWorld(this.demos[this.demoInd].name);
        TestDemo.addControlEntity();
    }
    private static addControlEntity() {
        const controlEntity = new Entity();
        controlEntity.addComponent(GlobalControl);
        Rabbit.Instance.world.add(controlEntity);
    }

    static main() {
        const rabbit = new Rabbit();
        rabbit.debugMode = true;
        rabbit.init();
        const demos: World[] = [];
        demos.push(demo2());
        demos.push(this.demo1());
        demos.push(demo3());
        demos.push(demo4());
        demos.push(demo5());
        this.demos = demos;
        for (let i = 0; i < demos.length; i++) {
            const world = demos[i];
            rabbit.addWorld(world);
        }
        rabbit.runWorld(demos[0].name);
        TestDemo.addControlEntity();
    }

    private static demo1(): World {
        const world = new World("demo1");
        world.init = () => {
            const entity = new Entity('root');
            // entity.transform.setPosition(Rabbit.Instance.winSize.w / 2, -Rabbit.Instance.winSize.h / 2);
            entity.addComponent(rEngine.Canvas);
            const text = entity.addComponent(Text);
            text.setAlign(Text.TextAlignType.center);
            text.text = "root";
            world.add(entity);
            const child1 = new Entity('child1');
            const text1 = child1.addComponent(Text);
            text1.setAlign(Text.TextAlignType.center);
            child1.transform.setPosition(100, 0);
            text1.text = "child1";
            entity.addChild(child1);
            const child2 = new Entity('child2');
            child2.setParent(entity);
            console.log("entity", entity);
            // const func = (value1, value2) => {
            //     console.log("mousedown事件执行");
            //     // entity.transform.angle = 30;
            //     // entity.transform.scaleX = 2;
            //     // entity.transform.scaleY = 2;
            //     // console.log("entity transform", child1.transform);

            //     console.log("lala 事件触发" + value1 + value2);
            //     // entity.listenOff("lala");
            // }
            // const tween1 = new Tween(entity.transform).by({ x: 100,y:100 }, 1).onComplete(()=>{console.log("tween1 over")}).start();
            // const tween2 = new Tween(child1.transform).to({ x: 100, y: 100 }, 0.5).onComplete(() => { console.log("tween over") }).start();
            // entity.listenOnce("lala", func, this);
            // entity.listen(rEngine.EventType.MOUSE_DOWN, () => {
            //     Rabbit.Instance.message("lala", 2, 3);
            //     console.log("tween num",Rabbit.Instance.world.tweens.length);

            // });
            setTimeout(() => {
                const superGame = new SuperGame();
            }, 3000);
        }
        return world;
    }
}
class GlobalControl extends Component {

    keyDown(key) {
        if (key != KeyType.DOWN) return;
        TestDemo.nextWorld();
    }
    start() {
        this.entity.listen(rEngine.EventType.KEY_DOWN, this.keyDown, this);
    }
}
TestDemo.main();