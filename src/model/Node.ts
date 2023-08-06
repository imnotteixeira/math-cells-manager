import { IDataFunction } from "../functions/DataFunction";

export type UpdatePropagator<T> = (notifierId: string, deps: Set<string>, data: T | undefined) => void;

export interface INode<T> {
    id: string,
    hasOutdatedValue: boolean,
    data: T | undefined,
    dataFn: IDataFunction<T> | undefined,
    setDataFunction: (_: IDataFunction<T>) => T | undefined,
    setUpdatePropagator: (updatePropagator: UpdatePropagator<T>) => INode<T>,
    setNodeFetcher: (fn: (id: string) => INode<T> | undefined) => INode<T>,
    dependents: Set<string>,
    dependencies: Map<string, INode<T> | undefined>,
    notify: (id: string, data: T | undefined) => void,
    propagateUpdate: UpdatePropagator<T>,
    subscribe: (dependentId: string) => void,
    unsubscribe: (dependentId: string) => void,
    triggerDataRecomputation: () => T | undefined,
    triggerDataReconciliation: () => void,
    requestSubscription: (requesterId: string, targetId: string) => void
    setSubscriptionRequester: (fn: (requesterId: string, targetId: string) => void) => INode<T>,
    requestSubscriptionDrop: (requesterId: string, targetId: string) => void
    setSubscriptionDropper: (fn: (requesterId: string, targetId: string) => void) => INode<T>,
    propagationState: PropagatorState,
    sleep: () => void,
    wakeUp : () => void,
}

enum PropagatorState { 
    ACTIVE = "ACTIVE", 
    SLEEPY = "SLEEPY", 
    SLEEPING = "SLEEPING"
};

export class Node<T> implements INode<T> {
    id: string;
    data: T | undefined;
    dataFn: IDataFunction<T> | undefined;
    hasOutdatedValue: boolean = false
    dependents: Set<string>;
    // TODO: Optimization: store only Ids and query the NodeMesh registry for nodes
    // This way, the nodes are only stored in one place (even though we are only working with references here...)
    dependencies: Map<string, INode<T> | undefined> = new Map(); 

    propagationState: PropagatorState = PropagatorState.ACTIVE;
    
    // These are injected in the NodeMesh
    propagateUpdate!: UpdatePropagator<T>;
    getNodeById!: (id: string) => INode<T> | undefined
    requestSubscription!: (requesterId: string, targetId: string) => void
    requestSubscriptionDrop!: (requesterId: string, targetId: string) => void

    constructor(
        id: string, 
        dataFn: IDataFunction<T>,
    ) {
        this.id = id;
        this.dependents = new Set();
        this.dataFn = dataFn;
        this.data = dataFn.compute(this.dependencies);
    }

    /** Updates this node with the propagator (should come from NodeMesh) */
    setUpdatePropagator = (updatePropagator: UpdatePropagator<T>) : INode<T> => {
        this.propagateUpdate = updatePropagator;
        return this;
    }
    
    /** Updates this node with the Node Fetcher (should come from NodeMesh) */
    setNodeFetcher = (nodeFetcher: (id: string) => INode<T> | undefined) : INode<T> => {
        this.getNodeById = nodeFetcher;
        return this;
    }

    /** Updates this node with the subscripton requester (should come from NodeMesh) */
    setSubscriptionRequester = (fn: (requesterId: string, targetId: string) => void) => {
        this.requestSubscription = fn;
        return this;
    }

    /** Updates this node with the subscription dropper (should come from NodeMesh) */
    setSubscriptionDropper = (fn: (requesterId: string, targetId: string) => void) => {
        this.requestSubscriptionDrop = fn;
        return this;
    }

    /** Modify self data and notify dependents */
    setDataFunction = (fn?: IDataFunction<T>): T | undefined => {

        // TODO: Prevent cycle dependencies (need to check if this node is anywhere above in the dependency graph)
        this.dataFn = fn;
        return this.triggerDataRecomputation()
    }

    computeData = (): T | undefined => {

        if(this.propagationState === PropagatorState.SLEEPING) return;

        this.data = this.dataFn?.compute(this.dependencies);
        this.hasOutdatedValue = false
        // TODO optimization candidate: batching updates 
        // - Do not notify every time this changes right away, wait some time
        // - And if some other updates happen in the meantime, only the final update will be notified 
        this.propagateUpdate(this.id, this.dependents, this.data)
        
        return this.data;
    }

    /** Reconciles dependencies, adding missing ones, and removing unused ones */
    reconcileDependencies = (newDependencyIds?: Set<string>, force: boolean = false): Map<string, INode<T> | undefined> => {
        
        console.info(`[Node ${this.id}] Reconciliating Dependencies...`);
        
        const newDependencyIdsClone = new Set(newDependencyIds);
        console.debug(`[Node ${this.id}] New Dependencies:`)
        newDependencyIdsClone.forEach(d => {
            console.debug(`[Node ${this.id}]\t${d}`)
        })

        const reconciledDependencies: Map<string, INode<T> | undefined> = new Map<string, INode<T> | undefined>()
        const addDependency = (dependencyId: string) => {
            const dependencyNode = this.getNodeById(dependencyId);
            
            reconciledDependencies.set(dependencyId, dependencyNode)
            if(dependencyNode && this.dependencies.get(dependencyId)?.data != dependencyNode.data) {
                this.hasOutdatedValue = true;
            }
            this.requestSubscription(this.id, dependencyId)
        }

        // Iterate over the current dependency IDs. 
        // The ones not on the new set are discarded
        // The ones on the new set are removed from the new set, and added to final set
        for(let dependencyId of this.dependencies.keys()) {
            if(!newDependencyIdsClone.has(dependencyId)) {
                this.requestSubscriptionDrop(this.id, dependencyId)
                this.hasOutdatedValue = true;
            }
            if(newDependencyIdsClone.has(dependencyId)) {
                newDependencyIdsClone.delete(dependencyId)
                addDependency(dependencyId);
            }
        }
        
        // Finally, add the missing dependencies on the new set
        newDependencyIdsClone.forEach(id => {
            addDependency(id);
        })

        return reconciledDependencies;
    }

    triggerDataReconciliation = () => {
        this.dependencies = this.reconcileDependencies(this.dataFn?.dependencyIds)

        if(this.hasOutdatedValue) this.computeData()
    }

    triggerDataRecomputation = (): T | undefined => {
        console.info(`[Node ${this.id}] Recomputing data...`)
        this.dependencies = this.reconcileDependencies(this.dataFn?.dependencyIds);
        console.info(`[Node ${this.id}] Dependency values:`)

        for (const [id, dep] of this.dependencies) {
            console.info(`[Node ${this.id}]\t${id} => ${dep?.data}`)   
        }

        return this.computeData();
    }

    /** Receive a notificaton when a dependency changes */
    notify = (dependencyId: string, newValue: T | undefined): void => {
        console.info(`[Node ${this.id}] Dependency [Node ${dependencyId}] changed to ${newValue}. Updating value...`)
        this.computeData()
    }

    /** Register a nodeId as a dependency, to be notified when this node is updated */
    subscribe = (dependentId: string) => {
        this.dependents.add(dependentId);
    }
    
    /** Cancel a Node subscription, to stop being notified when this node is updated */
    unsubscribe = (dependentId: string) => {
        this.dependents.delete(dependentId);
    }

    /** Halts all subscriptions, so this node will not receive update notifications from its dependencies
     * Nor will reconcile dependencies or update its data (even if its dataFn changes - the dataFn is kept, though)
     * The Node will be reconciled once it is awaken
     */
    sleep = () => {
        
        // TODO make checks in order to know if it should be set to SLEEPY instead (depending on dependencies states)
        this.propagationState = PropagatorState.SLEEPING;
    }

    /** Resumes the notification listening and recalculation lifecycle for this node */
    wakeUp = () => {
        this.propagationState = PropagatorState.ACTIVE;
        this.triggerDataRecomputation()
    }
}
