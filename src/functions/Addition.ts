import { DataFunction, DefinitionParsingResults, IDefinitionParser } from "../model/DataFunction";
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
                if(left === undefined || Number.isNaN(left) || right === undefined || Number.isNaN(right)) return undefined
                else return left+right;
            },
            dependencies: new Set(dependencies)
        }
    }
}
