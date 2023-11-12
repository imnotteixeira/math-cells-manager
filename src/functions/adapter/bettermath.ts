import { IValueType, IExpressionType, BettermathGrammarParser, ValueResolvingResult as BettermathValueResolvingResult, IBaseType} from "@tecido/bettermath"
import { IDataFunction } from "../DataFunction";
import { INode } from "../../model/Node";
import { getRefIds } from "../grammar/bettermath";

export class ValueResolvingResult<T> {
    readonly isError: boolean;
    readonly value?: T;
    readonly error?: Error;

    private constructor(isError: boolean, result?: {value? : T, error?: Error}) {
        this.isError = isError;
        this.value = result?.value;
        this.error = result?.error;
    }

    static success = <T>(value: T) => new ValueResolvingResult(false, {value});
    
    static error = <T>(error: Error) => new ValueResolvingResult<T>(true, {error});

    static fromBettermath = <T>(valueResolvingResult: BettermathValueResolvingResult<T>) => 
        new ValueResolvingResult(valueResolvingResult.isError, {
            value: valueResolvingResult.value,
            error: valueResolvingResult.error,
        })

    get = () => {
        if (this.isError) {
            throw new Error(
                "The ValueResolvingResult is an error. Cannot get value. Inner error is: "
                + this.error
            );
        }

        return this.value as T;
    }

    getOrElse = (elseValue: any) => this.isError ? elseValue : this.value;

    getError = () => this.error;

    toString = () => `ValueResolvingResult(${this.isError? "[ERROR]" : this.value})`
}

class BettermathDataFunction implements IDataFunction<any> {
    parsedExpression: IExpressionType<any>;
    dependencyIds: Set<string>;

    constructor(grammar: BettermathGrammarParser, fn: string) {
        // TODO: Handle parsing error
        this.parsedExpression = grammar.tryParse(fn)
        this.dependencyIds = new Set(getRefIds(this.parsedExpression).toJS().map(({column, line}) => `${column}${line}`))
    }

    compute = (dependencies: Map<string, INode<any> | undefined>) => {
        // TODO: Might be worth it introducing the concept of async compute for functions 
        // (as it can take some time to resolve REF values to compute this function value)
        const dependencyValues: Map<string, any> = new Map(Array.from(dependencies)
            .map(([refId, refNode]) => ([refId, refNode?.data.get()])))
        return ValueResolvingResult.fromBettermath(this.parsedExpression.getValue(dependencyValues))
    };

}

export default BettermathDataFunction;