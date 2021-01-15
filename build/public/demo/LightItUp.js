// import { Entity, Circle, Canvas, Sfx, Rabbit } from "../ts/Core";
class Light extends Entity {
    constructor(gx, gy, radius, board) {
        super();
        this.gx = gx;
        this.gy = gy;
        let x = gx * (radius * 2 + 1);
        let y = gy * (radius * 2 + 1);
        this.radius = radius;
        this.lit = true;
        this.board = board;
        this.circle = new Circle(x + radius, y + radius, radius);
        this.dark = new Canvas(x, y, radius * 2, radius * 2);
        this.dark.context.beginPath();
        this.dark.context.fillStyle = '#400';
        this.dark.context.arc(radius, radius, this.radius, 0, 360);
        this.dark.context.fill();
        this.light = new Canvas(x, y, radius * 2, radius * 2);
        this.light.context.beginPath();
        this.light.context.fillStyle = '#f00';
        this.light.context.arc(radius, radius, this.radius, 0, 360);
        this.light.context.fill();
        this.graphic = this.dark;
    }
    mouseDown() {
        super.mouseDown();
        console.log("点击棋子");
        if (this.circle.collidePoint([Rabbit.Instance.mouse.x, Rabbit.Instance.mouse.y]))
            this.board.light(this.gx, this.gy);
    }
    flip() {
        this.lit = !this.lit;
    }
    update(dtime) {
        if (this.lit)
            this.graphic = this.light;
        else
            this.graphic = this.dark;
    }
}
class Board extends Entity {
    constructor() {
        super();
        this.lights = [];
        for (let y = 0; y < 5; ++y) {
            for (let x = 0; x < 5; ++x) {
                const l = new Light(x, y, 32, this);
                this.lights.push(l);
                Rabbit.Instance.world.add(l);
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
            if (!item.lit)
                return;
        }
        new Sfx("audio/bell.ogg").play();
        alert("Victory!");
    }
}
