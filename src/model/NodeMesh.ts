import { ValueResolvingResult } from "../functions/adapter/bettermath";
import { INode, UpdatePropagator } from "./Node";

export class NodeMesh<T> {
    
    nodes: Map<string, INode<T>>;
    pendingSubscriptions: Map<string, Set<string>> = new Map() // Holds subscripton links to nodes that may not exist

    private propagator: UpdatePropagator<T> = (notifierId: string, deps: Set<string>, data: ValueResolvingResult<T | undefined>) => {
        deps.forEach(dep => this.nodes.get(dep)?.notify(notifierId, data))
    }
    
    constructor(nodes: INode<T>[]){
        this.nodes = new Map()
        nodes.forEach(this.addNode)
    }

    printNodes = () => {
        this.nodes.forEach((node) => console.info(`${node.id} => ${node.data.getOrElse("<NO VALUE>")} [${node.propagationState}]`))
    }

    addNode = (baseNode: INode<T>) => {

        if (this.nodes.has(baseNode.id)) throw new Error(`A node with id <${baseNode.id}> already exists.`);

        this.nodes.set(
            baseNode.id, 
            baseNode
                .setUpdatePropagator(this.propagator)
                //Cannot use this.nodes.get directly, since this.nodes is undefined here
                .setNodeFetcher((id: string) => this.nodes.get(id))
                .setSubscriptionRequester(this.requestSubscription)
                .setSubscriptionDropper(this.requestSubscriptionCancelation)
        );
        this.nodes.get(baseNode.id)?.triggerDataRecomputation()

        this.nodes.forEach(node => node.triggerDataReconciliation())

        if(this.pendingSubscriptions.has(baseNode.id)) {
            this.pendingSubscriptions.get(baseNode.id)?.forEach(requesterId => {
                this.nodes.get(baseNode.id)?.subscribe(requesterId)
                this.pendingSubscriptions.get(baseNode.id)?.delete(requesterId)
            })
        }
    }

    removeNode = (nodeId: string) => {
        if(!this.nodes.has(nodeId)) return;

        this.nodes.delete(nodeId);
        this.pendingSubscriptions.delete(nodeId);
        this.pendingSubscriptions.forEach(requesters => {
            if(requesters.has(nodeId)) requesters.delete(nodeId)
        })
    }

    requestSubscription = (requesterId: string, targetId: string) => {
        if(this.nodes.has(targetId)) {
            this.nodes.get(targetId)?.subscribe(requesterId)
        } else {
            this.addPendingSubscriptionLink(requesterId, targetId)
        }
    }

    addPendingSubscriptionLink = (requesterId: string, targetId: string) => {
        if(!this.pendingSubscriptions.has(targetId)) 
            this.pendingSubscriptions.set(targetId, new Set([]))
        
        this.pendingSubscriptions.get(targetId)?.add(requesterId)
    }

    requestSubscriptionCancelation = (requesterId: string, targetId: string) => {
        if(this.nodes.has(targetId)) {
            this.nodes.get(targetId)?.unsubscribe(requesterId)
        } else {
            this.removePendingSubscriptionLink(requesterId, targetId)
        }
    }

    removePendingSubscriptionLink = (requesterId: string, targetId: string) => {
        this.pendingSubscriptions.get(targetId)?.delete(requesterId)   
    }
}
