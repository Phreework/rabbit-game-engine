import { Entity, Rabbit, Text, World } from "../ts/Core.js";
import { main as demo2 } from "./EffectButton.js";
import { main as demo3 } from "./IsoGame.js";
import { main as demo4 } from "./LightItUp.js";
/**
 * 引擎完整功能测试Demo
 * @author PhreeSoda
 */

export class TestDemo {
  static main() {
    const rabbit = new Rabbit();
    rabbit.init();
    const demos = [];
    demos.push(demo2());
    demos.push(this.demo1());
    demos.push(demo3());
    demos.push(demo4());

    for (let i = 0; i < demos.length; i++) {
      const world = demos[i];
      rabbit.addWorld(world);
    }

    rabbit.runWorld(demos[0].name);

    rabbit.keyDown = () => {
      this.demoInd++;
      this.demoInd = this.demoInd < demos.length ? this.demoInd : 0;
      rabbit.runWorld(demos[this.demoInd].name);
    };
  }

  static demo1() {
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
    };

    return world;
  }

}
TestDemo.demoInd = 0;