import AdditionFn from "./functions/Addition";
import { INode, Node } from "./model/Node";
import { NodeMesh } from "./model/NodeMesh";

const NodeA = new Node<number>("A", {compute: () => 3}, new Map())
const NodeB = new Node<number>("B", {compute: () => 3}, new Map())
const NodeC = new Node<number>("C", new AdditionFn(), new Map([
    ["A", NodeA],
    ["B", NodeB]
]))

const grid = new NodeMesh([
    NodeA,
    NodeB,
    NodeC,
])

console.log("Iteration #0")
grid.printNodes()

console.log("Iteration #1 :: Change B to 2")
NodeB.setDataFunction({compute: () => 2})
grid.printNodes()

console.log("Iteration #2 :: Change A to 0")
NodeA.setDataFunction({compute: () => 0})
grid.printNodes()

console.log("Iteration #3 :: Change C to 0")
NodeA.setDataFunction({compute: () => 0})
grid.printNodes()

// TODO is to have a better DataFunction abstraction/dependencies automatically inferred from string expressions