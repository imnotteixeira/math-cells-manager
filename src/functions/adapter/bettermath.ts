import { IValueType, IExpressionType, BettermathGrammarParser} from "@tecido/bettermath"
import { IDataFunction } from "../DataFunction";
import { INode } from "../../model/Node";
import { Inject, Service } from "typedi";
import { getRefIds } from "../grammar/bettermath";

@Service()
class BettermathDataFunction implements IDataFunction<IValueType<any>> {
    parsedExpression: IExpressionType<any>;
    dependencyIds: Set<string>;

    constructor(@Inject() grammar: BettermathGrammarParser, fn: string) {
        // TODO: Handle parsing error
        this.parsedExpression = grammar.tryParse(fn)
        this.dependencyIds = new Set(getRefIds(this.parsedExpression).toJS().map(({column, line}) => `${column}${line}`))
    }

    compute = (dependencies: Map<string, INode<IValueType<any>> | undefined>) => {
        // TODO: Add support for REF() value injection. how to manage ref-> value pairs? should nodeMesh have a ref dictionary?
        // might be worth it introducing the concept of async compute for functions 
        // (as it can take some time to resolve REF values to compute this function value)
        
        // Might be better to pass <refId, node.data> pairs directly, to avoid extra recomputation
        return this.parsedExpression.getValue(refMap)
    };

}

export default BettermathDataFunction;