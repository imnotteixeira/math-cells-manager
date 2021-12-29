import { INode, UpdatePropagator } from "./Node";

export class NodeMesh<T> {
    
    nodes: Map<string, INode<T>>

    private propagator: UpdatePropagator<T> = (notifierId: string, deps: Set<string>, data: T) => {
        deps.forEach(dep => this.nodes.get(dep)?.notify(notifierId, data))
    }
    
    constructor(nodes: INode<T>[]){
        this.nodes = new Map(nodes.map(node => ([node.id, node.setUpdatePropagator(this.propagator)]))) 
    }
    
    propagateNodeUpdate: UpdatePropagator<T> = (notifierId: string, nodeIds: Set<string>, data: T) => {
        nodeIds.forEach(id => this.nodes.get(id)?.notify(notifierId, data))
    }

    printNodes = () => {
        this.nodes.forEach((node) => console.log(`${node.id} => ${node.data}`))
    }
}
