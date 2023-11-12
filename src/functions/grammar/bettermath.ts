import { BettermathGrammarParser, FunctionRegistry, IBaseType, IExpressionType, Types, buildGrammar } from '@tecido/bettermath';
import { IRef, parseRefId } from '../../model/Ref';
import { Set, MapOf } from "immutable";
import { IRefType } from '@tecido/bettermath';

export default (): BettermathGrammarParser => {
    const functionRegistry: FunctionRegistry = new FunctionRegistry();
    return buildGrammar(functionRegistry)
}

export const getRefIds = (expression: IExpressionType<any>): Set<MapOf<IRef>> => {
    const refIds = expression
        .find((elem: IBaseType<any>) => elem.type === Types.REF)
        .map((refNode: IBaseType<any>) => parseRefId((refNode as IRefType).value))

    return Set(refIds);
}
