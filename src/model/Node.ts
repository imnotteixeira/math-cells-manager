import { IDataFunction } from "./DataFunction";

export type UpdatePropagator<T> = (notifierId: string, deps: Set<string>, data: T) => void;

export interface INode<T> {
    id: string,
    data: T,
    dataFn: IDataFunction<T>,
    setDataFunction: (_: IDataFunction<T>) => T,
    setUpdatePropagator: (updatePropagator: UpdatePropagator<T>) => Node<T>,
    dependents: Set<string>,
    dependencies: Map<string, INode<T>>,
    notify: (id: string, data: T) => void,
    propagateUpdate: UpdatePropagator<T>,
    subscribe: (dependentId: string) => void,
    unsubscribe: (dependentId: string) => void,
}

export class Node<T> implements INode<T> {
    id: string;
    data: T;
    dataFn: IDataFunction<T>;
    
    dependents: Set<string>;
    dependencies: Map<string, INode<T>>;
    propagateUpdate!: UpdatePropagator<T>;

    constructor(
        id: string, 
        dataFn: IDataFunction<T>,
        dependencies: Map<string, INode<T>>
    ) {
        this.id = id;
        this.dependents = new Set();
        this.dependencies = dependencies;
        this.dependencies.forEach(d => d.subscribe(this.id))
        this.dataFn = dataFn;
        this.data = dataFn.compute(dependencies);
    }

    /** Updates this node with the propagator (should come from NodeMesh) */
    setUpdatePropagator = (updatePropagator: UpdatePropagator<T>) : Node<T> => {
        this.propagateUpdate = updatePropagator;
        return this;
    }

    /** Modify self data and notify dependents */
    setDataFunction = (fn: IDataFunction<T>): T => {
        this.dataFn = fn;
        this.data = fn.compute(this.dependencies);

        this.propagateUpdate(this.id, this.dependents, this.data)

        return this.data;
    }

    /** Receive a notificaton when a dependency changes */
    notify = (dependencyId: string, newValue: T): void => {
        console.log(`[Node ${this.id}] Dependency [Node ${dependencyId}] changed to ${newValue}. Updating value...`)
        this.data = this.dataFn.compute(this.dependencies)
    }

    /** Register a nodeId as a dependency, to be notified when this node is updated */
    subscribe = (dependentId: string) => {
        this.dependents.add(dependentId);
    }
    
    /** Cancel a Node subscription, to stop being notified when this node is updated */
    unsubscribe = (dependentId: string) => {
        this.dependents.delete(dependentId);
    }
}
