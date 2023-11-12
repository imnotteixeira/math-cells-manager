import { BettermathGrammarParser, FunctionRegistry, IBaseType, IExpressionType, IFunction, IFunctionArg, Index, Types, buildGrammar } from '@tecido/bettermath';
import { Ref, parseRefId } from '../../model/Ref';
import { RefFunction } from './functions/Ref';
import { Set, MapOf } from "immutable";

export default (): BettermathGrammarParser => {
    const functionRegistry: FunctionRegistry = new FunctionRegistry();
    functionRegistry.register("REF", (indexInfo: Index, args: IFunctionArg<Ref>[]) => new RefFunction(indexInfo, args))
    return buildGrammar(functionRegistry)
}

export const getRefIds = (expression: IExpressionType<any>): Set<MapOf<Ref>> => {
    const refIds = expression.find((elem: IBaseType<any>) => 
        elem.type === Types.FUNCTION && (elem as IFunction<any>).returnType === Types.REF
    ).map((refNode: IBaseType<any>) => parseRefId((refNode as IFunction<any>).args[0].getValue()))

    return Set(refIds);
}
