import { Map, MapOf } from "immutable";

export type Ref = { 
    column: string;
    line: number;
}


export const parseRefId = (str: string): MapOf<Ref> => {
    const refRegex = /([A-Z]+)(\d+)/;
    const match: RegExpMatchArray | null = str.match(refRegex)

    if (match === null) throw new Error(`Invalid Ref format. It must be in /([A-Z]+)(\d+)/ format.`);

    const [, column, line] = match
    
    return Map({ column, line: parseInt(line) })
}
