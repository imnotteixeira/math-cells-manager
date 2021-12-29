import AdditionFn from "./functions/Addition";
import { DataFunction, DumbNumberSumDefinitionParser } from "./model/DataFunction";
import { INode, Node } from "./model/Node";
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
