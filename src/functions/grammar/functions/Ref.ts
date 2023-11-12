import { CommonValidators, FunctionArgsValidator, FunctionType, IFunctionArg, Index, PipelineValidator, Types, ValidationError, is } from "@tecido/bettermath";
import { Ref, parseRefId } from "../../../model/Ref";

export class RefFunction extends FunctionType<Ref> {
    readonly returnType = Types.REF;

    constructor(indexInfo: Index, args: IFunctionArg<any>[]) {
        super(indexInfo, "Ref", args);
    }

    getValue = () => parseRefId(this.args[0].getValue()).toJS();

    protected validateArgs: FunctionArgsValidator = (validator: PipelineValidator, args: IFunctionArg<any>[], onSuccess: () => void, onFailure: (_: ValidationError[]) => void) => {
        
        const validationResult = validator([
            CommonValidators.ARG_LENGTH(1),
            CommonValidators.ARG_TYPES(is(Types.STRING))
        ]).validate()

        if(validationResult) return onFailure(validationResult)
        else return onSuccess();
    };
}