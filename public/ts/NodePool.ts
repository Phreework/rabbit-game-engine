import { Component, Entity } from "./Core.js";

type Constructor<T = {}> = new (...args: any[]) => T;

interface IPoolHandlerComponent extends Component {
    unuse(): void;

    reuse(args: any): void;
}

/**
 * 
 */
export class NodePool {

    /**
     * @en The pool handler component, it could be the class name or the constructor.
     * @zh 缓冲池处理组件，用于节点的回收和复用逻辑，这个属性可以是组件类名或组件的构造函数。
     */
    public poolHandlerComp?: Constructor<IPoolHandlerComponent> | string;
    private _pool: Entity[];

    constructor(poolHandlerComp?: Constructor<IPoolHandlerComponent> | string) {
        this.poolHandlerComp = poolHandlerComp;
        this._pool = [];
    }

    /**
     * @en The current available size in the pool
     * @zh 获取当前缓冲池的可用对象数量
     */
    public size() {
        return this._pool.length;
    }

    /**
     * @en Destroy all cached nodes in the pool
     * @zh 销毁对象池中缓存的所有节点
     */
    public clear() {
        const count = this._pool.length;
        for (let i = 0; i < count; ++i) {
            this._pool[i].destroy();
        }
        this._pool.length = 0;
    }

    /**
     * @en Put a new Entity into the pool.
     * It will automatically remove the Entity from its parent without cleanup.
     * It will also invoke unuse method of the poolHandlerComp if exist.
     * @zh 向缓冲池中存入一个不再需要的节点对象。
     * 这个函数会自动将目标节点从父节点上移除，但是不会进行 cleanup 操作。
     * 这个函数会调用 poolHandlerComp 的 unuse 函数，如果组件和函数都存在的话。
     * @example
     * import { instantiate } from 'cc';
     * const myNode = instantiate(this.template);
     * this.myPool.put(myNode);
     */
    public put(obj: Entity) {
        if (obj && this._pool.indexOf(obj) === -1) {
            // Remove from parent, but don't cleanup
            obj.remove();

            // Invoke pool handler
            // @ts-ignore
            const handler: IPoolHandlerComponent = this.poolHandlerComp ? obj.getComponent(this.poolHandlerComp) : null;
            if (handler && handler.unuse) {
                handler.unuse();
            }

            this._pool.push(obj);
        }
    }

    /**
     * @en Get a obj from pool, if no available object in pool, null will be returned.
     * This function will invoke the reuse function of poolHandlerComp if exist.
     * @zh 获取对象池中的对象，如果对象池没有可用对象，则返回空。
     * 这个函数会调用 poolHandlerComp 的 reuse 函数，如果组件和函数都存在的话。
     * @param args - 向 poolHandlerComp 中的 'reuse' 函数传递的参数
     * @example
     *   let newNode = this.myPool.get();
     */
    public get(...args: any[]): Entity | null {
        const last = this._pool.length - 1;
        if (last < 0) {
            return null;
        }
        else {
            // Pop the last object in pool
            const obj = this._pool[last];
            this._pool.length = last;

            // Invoke pool handler
            // @ts-ignore
            const handler: IPoolHandlerComponent = this.poolHandlerComp ? obj.getComponent(this.poolHandlerComp) : null;
            if (handler && handler.reuse) {
                handler.reuse(arguments);
            }
            return obj;
        }
    }
}
