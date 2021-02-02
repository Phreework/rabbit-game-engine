import { Entity, Circle, SplashCanvas, Sfx, Rabbit, World, Component, AudioSystem, EventType } from "../ts/Core.js";
class Light extends Component {
    gx: any;
    gy: any;
    radius: any;
    lit: boolean;
    board: any;
    circle: Circle;
    dark: SplashCanvas;
    light: SplashCanvas;

    init(gx, gy, radius, board) {
        this.gx = gx;
        this.gy = gy;
        let x = gx * (radius * 2 + 1);
        let y = gy * (radius * 2 + 1);
        this.radius = radius;
        this.lit = true;
        this.board = board;
        this.circle = new Circle(x + radius, y + radius, radius);
        this.dark = new SplashCanvas(x, y, radius * 2, radius * 2);
        this.dark.context.beginPath();
        this.dark.context.fillStyle = '#400';
        this.dark.context.arc(radius, radius, this.radius, 0, 360);
        this.dark.context.fill();
        this.light = new SplashCanvas(x, y, radius * 2, radius * 2);
        this.light.context.beginPath();
        this.light.context.fillStyle = '#f00';
        this.light.context.arc(radius, radius, this.radius, 0, 360);
        this.light.context.fill();

        this.entity.graphic = this.dark;
    }
    onLoad() {
        this.entity.listen(EventType.MOUSE_DOWN, () => {
            console.log("点击棋子");
            if (this.circle.collidePoint([Rabbit.Instance.mouse.x, Rabbit.Instance.mouse.y]))
                this.board.light(this.gx, this.gy);
        });
    }

    flip() {
        this.lit = !this.lit;
    }

    update(dtime) {
        if (this.lit)
            this.entity.graphic = this.light;
        else
            this.entity.graphic = this.dark;
    }
}

class Board extends Component {
    lights: Light[];
    onLoad() {
        console.log("board start");
        this.lights = [];
        for (let y = 0; y < 5; ++y) {
            for (let x = 0; x < 5; ++x) {
                const lightEntity = new Entity();
                const light = lightEntity.addComponent(Light);
                light.init(x, y, 32, this);
                this.lights.push(light);
                Rabbit.Instance.world.add(lightEntity);
            }
        }
        for (let i = 0; i < 8; ++i) {
            this.light(Math.floor(Math.random() * 5), Math.floor(Math.random() * 5));
        }
    }
    light(gx, gy) {
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