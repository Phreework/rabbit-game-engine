import * as rEngine from "../ts/Core"
describe("entity base",()=>{
    test("entity exists",()=>{
        const entity = new rEngine.Entity();
        expect(entity).not.toBeNull();
    })
    test("children exists",()=>{
        const entity = new rEngine.Entity();
        const child = new rEngine.Entity();
        entity.addChild(child);
        expect(entity.children[0]).toBe(child);
    })
    
})

describe("entity transform",()=>{
    test("transform exists",()=>{
        const entity = new rEngine.Entity();
        const transform = entity.getComponent(rEngine.Transform);
        expect(transform).not.toBeNull();
    })
    test("transfom child exists",()=>{
        const entity = new rEngine.Entity();
        const child = new rEngine.Entity();
        entity.addChild(child);
        expect(entity.transform.children[0]).toBe(child.transform);
    })
})