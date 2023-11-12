import { Map, MapOf } from "immutable";

export type IRef = {
    column: string;
    line: number;
}
export class Ref implements IRef { 
    column: string;
    line: number;

    constructor(column: string, line: number) {
        this.column = column;
        this.line = line;
    }

    static from(ref: IRef) {
        return new Ref(ref.column, ref.line);
    }

    toString = () => `${this.column}${this.line}`
}


export const parseRefId = (str: string): MapOf<IRef> => {
    const refRegex = /([A-Z]+)(\d+)/;
    const match: RegExpMatchArray | null = str.match(refRegex)

    if (match === null) throw new Error(`Invalid Ref format. It must be in /([A-Z]+)(\d+)/ format.`);

    const [, column, line] = match
    
    return Map({ column, line: parseInt(line) })
}
