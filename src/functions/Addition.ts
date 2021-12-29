import { IDataFunction } from "../model/DataFunction";
import { INode } from "../model/Node";

class AdditionFn implements IDataFunction<number> {
    compute = (dependencies: Map<string, INode<number>>) => {
        let sum = 0;
        for (const [_, node] of dependencies) {
            sum += node.data
        }
        return sum
    }
}

export default AdditionFn;