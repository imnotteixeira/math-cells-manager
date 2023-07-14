import { DumbNumberSumDefinitionParser } from "./functions/Addition";
import { DataFunction } from "./model/DataFunction";
import { Node } from "./model/Node";
import { NodeMesh } from "./model/NodeMesh";

const NodeA = new Node<number>("A", new DataFunction<number>("1+1", new DumbNumberSumDefinitionParser()))
const NodeB = new Node<number>("B", new DataFunction<number>("1+A", new DumbNumberSumDefinitionParser()))
const NodeC = new Node<number>("C", new DataFunction<number>("A+B", new DumbNumberSumDefinitionParser()))

const grid = new NodeMesh([
    NodeA,
    NodeB,
    NodeC,
])

console.info("Iteration #0")
grid.printNodes()

console.info("Iteration #1 :: Change Add Node D")
const NodeD = new Node<number>("D", new DataFunction<number>("C+E", new DumbNumberSumDefinitionParser()))
grid.addNode(NodeD)
grid.printNodes()

console.info("Iteration #2 :: Change Add Node E")
const NodeE = new Node<number>("E", new DataFunction<number>("1+A", new DumbNumberSumDefinitionParser()))
grid.addNode(NodeE)
grid.printNodes()

console.info("Iteration #3 :: Change A to 0")
NodeA.setDataFunction(new DataFunction<number>("0+0", new DumbNumberSumDefinitionParser()))
grid.printNodes()

console.info("Iteration #4 :: Add Node F")
const NodeF = new Node<number>("F", new DataFunction<number>("1+0", new DumbNumberSumDefinitionParser()))
grid.addNode(NodeF)
grid.printNodes()

console.info("Iteration #5 :: Change A to undefined (Simulate Error)")
NodeA.setDataFunction(new DataFunction<number>("", new DumbNumberSumDefinitionParser()))
grid.printNodes()

console.info("Iteration #5 :: Change A to good value, but C to undefined (Simulate Error)")
NodeA.setDataFunction(new DataFunction<number>("1+1", new DumbNumberSumDefinitionParser()))
NodeC.setDataFunction(new DataFunction<number>("", new DumbNumberSumDefinitionParser()))
grid.printNodes()

console.info("Iteration #6 :: Revert C to A+B; Put C to sleep and change A (dependency)")
NodeC.setDataFunction(new DataFunction<number>("A+B", new DumbNumberSumDefinitionParser()))
grid.printNodes()

NodeC.sleep()
NodeA.setDataFunction(new DataFunction<number>("1+2", new DumbNumberSumDefinitionParser()))
grid.printNodes()

console.info("Iteration #7 :: Wake up C (should reconcile its data with the new values from A and B)")
NodeC.wakeUp()
grid.printNodes()

export {NodeMesh, Node, DataFunction, DumbNumberSumDefinitionParser}