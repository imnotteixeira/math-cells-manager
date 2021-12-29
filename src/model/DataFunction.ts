import { INode } from "./Node";

type ComputeFunction<T> = (dependencies: Map<string, INode<T> | undefined>) => T | undefined;

type DefinitionParsingResults<T> = {
    compute: ComputeFunction<T>,
    dependencies: Set<string>
}
interface IDefinitionParser<T> {
    parseDefinition: (def: string) => DefinitionParsingResults<T>
}

export class DumbNumberSumDefinitionParser implements IDefinitionParser<number> {
    // Only supports addition type string in the form of (dep|immediate)+(dep|immediate)
    parseDefinition = (def: string): DefinitionParsingResults<number> => {
        const DEFINITION_REGEX = /((?<dependency1>[a-zA-Z]\w*)|(?<digit1>\d*))\+((?<dependency2>[a-zA-Z]\w*)|(?<digit2>\d*))$/

        const match = DEFINITION_REGEX.exec(def);

        const dependencies = [];
        if(match?.groups?.dependency1) dependencies.push(match?.groups?.dependency1)
        if(match?.groups?.dependency2) dependencies.push(match?.groups?.dependency2)

        return {
            compute: (dependencies: Map<string, INode<number> | undefined>): number | undefined => {
                const left = match?.groups?.dependency1 ? dependencies.get(match?.groups.dependency1)?.data : parseInt(match?.groups?.digit1 || "");
                const right = match?.groups?.dependency2 ? dependencies.get(match?.groups.dependency2)?.data : parseInt(match?.groups?.digit2 || "");
                if(left === undefined || left === NaN || right === undefined || right === NaN) return undefined
                else return left+right;
            },
            dependencies: new Set(dependencies)
        }
    }
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
        this.compute = parsingResults.compute;
        this.dependencyIds = parsingResults.dependencies;
    }

}