import { join } from "path";
import { Component, RabImage, World, KeyType, Entity } from "../ts/Core.js";

class Robot extends Component {
    image: RabImage;
    init(x, y) {
        this.entity.transform.x = x;
        this.entity.transform.y = y;
        this.image = this.entity.addComponent(RabImage);
        this.image.imageUrl = "graphics/robot.png";
    }
}

export function main() {
    const world = new World("demo5");
    world.init = () => {
        const entity = new Entity();
        const robot = entity.addComponent(Robot);
        robot.init(240, 240);
        entity.keyDown = (key) => {
            console.log("key", key);
            switch (key) {
                case KeyType.A: entity.transform.x -= 16; break;
                case KeyType.D: entity.transform.x += 16; break;
                case KeyType.W: entity.transform.y -= 16; break;
                case KeyType.S: entity.transform.y += 16; break;
                default: break;
            }
        }
        world.add(entity);
    };
    return world;
}