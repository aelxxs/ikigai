export const enum PartType {
	Function,
	Variable,
	Literal,
}

export interface Part {
	type: PartType;
	value?: string;
	name?: string;
	args?: Part[];
}
