export enum TokenType {
	Space,
	TagStart,
	TagEnd,
	Colon,
	Literal,
	FuncStart,
	FuncEnd,
	Comma,
}

export interface Token {
	readonly type: TokenType;
	readonly value?: string;
}
