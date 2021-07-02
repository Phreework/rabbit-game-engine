import { Entity, Circle, Sfx, Rabbit, World, Component, AudioSystem, EventType, RabbitMouseEvent, Vec2, GraphicComponent, SpriteFrame, Sprite, rabbit } from "../ts/Core";
class Light extends Component {
    gx: any;
    gy: any;
    radius: any;
    lit: boolean;
    board: any;
    circle: Circle;
    dark: SpriteFrame;
    light: SpriteFrame;
    spr:Sprite;

    init(gx, gy, board) {
        this.gx = gx;
        this.gy = gy;
        this.dark = new SpriteFrame("graphics/dark.png");
        this.light = new SpriteFrame("graphics/light.png");
        const radius:number = this.dark.width/2;
        let x = gx;
        let y = gy;
        console.log("radius",radius);
        this.entity.transform.setPosition(radius + x * (radius * 2 + 1), -radius - (y * radius * 2 + 1));
        this.radius = radius;
        this.lit = true;
        this.board = board;
        this.circle = new Circle(x + radius, y + radius, radius);
        this.spr = this.entity.addComponent(Sprite);
        this.spr.spriteFrame = this.dark;
    }
    onLoad() {
        this.entity.listen(EventType.MOUSE_DOWN, (event: RabbitMouseEvent) => {
            this.board.light(this.gx, this.gy);
        }, this);
    }

    flip() {
        this.lit = !this.lit;
    }

    update(dtime) {
        if (this.lit) {
            this.spr.spriteFrame = this.light;
        }
        else {
            this.spr.spriteFrame = this.dark;
        }
    }
}

class Board extends Component {
    lights: Light[];
    async onLoad() {
        console.log("board start");
        this.lights = [];
        await Rabbit.loadImageAsync("graphics/dark.png")
        await Rabbit.loadImageAsync("graphics/light.png")
        for (let y = 0; y < 5; ++y) {
            for (let x = 0; x < 5; ++x) {
                const lightEntity = new Entity();
                const light = lightEntity.addComponent(Light);
                light.init(x, y, this);
                this.lights.push(light);
                Rabbit.Instance.world.add(lightEntity);
            }
        }
        for (let i = 0; i < 8; ++i) {
            this.light(Math.floor(Math.random() * 5), Math.floor(Math.random() * 5));
        }
    }
    light(gx, gy) {
        console.log("处理", gx, gy);
        this.lights[gy * 5 + gx].flip();
        if (gx < 4)
            this.lights[gy * 5 + gx + 1].flip();
        if (gy < 4)
            this.lights[(gy + 1) * 5 + gx].flip();
        if (gx > 0)
            this.lights[gy * 5 + gx - 1].flip();
        if (gy > 0)
            this.lights[(gy - 1) * 5 + gx].flip();
        this.checkWon();
    }
    checkWon() {
        for (let i = 0; i < this.lights.length; i++) {
            const item = this.lights[i];
            if (!item.lit) return;
        }
        AudioSystem.play("audio/bell.ogg");
        alert("Victory!");
    }
}

export function main(): World {
    const world = new World("demo4");
    world.init = () => {
        const boardEntity = new Entity();
        boardEntity.addComponent(Board);
        world.add(boardEntity);
    };
    return world;
}