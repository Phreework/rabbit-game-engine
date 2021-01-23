import * as rEngine from "../ts/Core.js";
import { Entity, Rabbit, KeyType, Text, World, Component } from "../ts/Core.js";
import { main as demo2 } from "./EffectButton.js";
import { main as demo3 } from "./IsoGame.js";
import { main as demo4 } from "./LightItUp.js";
import { main as demo5 } from "./QuestGame.js";
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
            const entity = new Entity();
            const text = entity.addComponent(Text);
            text.setAlign(Text.TextAlignType.center);
            text.setPosition(Rabbit.Instance.winSize.w / 2, 0);
            text.text = "Hello, world!";
            entity.mouseDown = () => {
                console.log("mousedown事件执行");
            };
            world.add(entity);
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
        this.entity.keyDown = this.keyDown;
    }
}