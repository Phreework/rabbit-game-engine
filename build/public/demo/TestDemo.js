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
  static nextWorld() {
    this.demoInd++;
    this.demoInd = this.demoInd < this.demos.length ? this.demoInd : 0;
    Rabbit.Instance.runWorld(this.demos[this.demoInd].name);
    TestDemo.addControlEntity();
  }

  static addControlEntity() {
    const controlEntity = new Entity();
    controlEntity.addComponent(GlobalControl);
    Rabbit.Instance.world.add(controlEntity);
  }

  static main() {
    const rabbit = new Rabbit();
    rabbit.init();
    const demos = [];
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

  static demo1() {
    const world = new World("demo1");

    world.init = () => {
      const entity = new Entity('root');
      const text = entity.addComponent(Text);
      text.setAlign(Text.TextAlignType.center);
      entity.setPosition(Rabbit.Instance.winSize.w / 2, Rabbit.Instance.winSize.h / 2);
      text.text = "Hello, world!";

      entity.mouseDown = () => {
        console.log("mousedown事件执行");
      };

      world.add(entity);
      const child1 = new Entity('child1');
      const text1 = child1.addComponent(Text);
      text1.setAlign(Text.TextAlignType.center);
      child1.setPosition(50, 0);
      text1.text = "children text";
      entity.addChild(child1);
      const child2 = new Entity('child2');
      child2.setParent(entity);
      console.log("entity", entity);
    };

    return world;
  }

}
TestDemo.demoInd = 0;
TestDemo.demos = void 0;

class GlobalControl extends Component {
  keyDown(key) {
    if (key != KeyType.DOWN) return;
    TestDemo.nextWorld();
  }

  start() {
    this.entity.keyDown = this.keyDown;
  }

}