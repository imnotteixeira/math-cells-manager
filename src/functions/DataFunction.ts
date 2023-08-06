import { INode } from "../model/Node";

type ComputeFunction<T> = (dependencies: Map<string, INode<T> | undefined>) => T | undefined;

export type DefinitionParsingResults<T> = {
    compute: ComputeFunction<T>,
    dependencies: Set<string>
}
export interface IDefinitionParser<T> {
    parseDefinition: (def: string) => DefinitionParsingResults<T>
}

export interface IDataFunction<T> {
    compute: ComputeFunction<T>,
    dependencyIds: Set<string>
}

export class DataFunction<T> implements IDataFunction<T> {
    compute: ComputeFunction<T>;
    dependencyIds: Set<string>;

    constructor(
        definition: string, 
        parser: IDefinitionParser<T>
    ) {
        const parsingResults: DefinitionParsingResults<T> = parser.parseDefinition(definition);
        this.compute = (...args) => {
            try{
                return parsingResults.compute(...args);
            } catch(e) {
                return undefined
            }
        }
        this.dependencyIds = parsingResults.dependencies;
    }

}