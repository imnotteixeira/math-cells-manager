import { DataFunction } from "../model/DataFunction";
import { INode } from "../model/Node";

class AdditionFn extends DataFunction<number> {
    compute = (dependencies: Map<string, INode<number> | undefined>) => {
        let sum = 0;
        for (const [_, node] of dependencies) {
            sum += (node?.data || 0)
        }
        return sum
    }
}

export default AdditionFn;