import { FunctionRegistry, default as buildGrammar} from "@tissue/bettermath"
import { IDataFunction } from "../DataFunction";
import { INode } from "../../model/Node";

class BettermathDataFunction implements IDataFunction<IValueType<any>> {
    parsedExpression: IExpressionType<any>;
    dependencyIds: Set<string>;

    // TODO: Inject grammar
    constructor(grammar: P.Parser<IExpressionType<any>>, fn: string) {
        // TODO: Handle parsing error
        this.parsedExpression = grammar.tryParse(fn)
        // TODO: Add REF() support to extract ids from expressions
        this.dependencyIds = this.parsedExpression.getRefs()
    }

    compute: (dependencies: Map<string, INode<IValueType<any>> | undefined>) => {
        // TODO: Add support for REF() value injection. 
        // Might be better to pass <refId, node.data> pairs directly, to avoid extra recomputation
        return parsedExpression.getValue(refMap)
    };

    
}

export default BettermathDataFunction;