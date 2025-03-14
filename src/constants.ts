import {Base} from "./base";

export class Record extends Base<Record> {
    public readonly defendant: string;
    public readonly plaintiff: string;
    public readonly year: number;
    public readonly settlement: string;
    public readonly violationType: string;
    public readonly dataSourceLink: string;
}