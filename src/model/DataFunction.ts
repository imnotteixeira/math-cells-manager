import { INode } from "./Node";

export interface IDataFunction<T> {
    compute: (dependencies: Map<string, INode<T>>) => T
}