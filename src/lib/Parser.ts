import { Lexer, TokenType, ReadonlyToken, TokenGenerator } from './Lexer';

export const enum ASTNodeType {
	Literal,
	Variable,
	Function,
	Argument,
}

export interface ASTLiteralNode {
	type: ASTNodeType.Literal;
	value: string;
}

export interface ASTFunctionNode {
	type: ASTNodeType.Function;
	name: string;
	args?: ASTNode[];
}

export interface ASTArgumentNode {
	type: ASTNodeType.Argument;
	stems: ASTNode[];
}

export interface ASTVariableNode {
	type: ASTNodeType.Variable;
	name: string;
}

export type ASTNode = ASTLiteralNode | ASTArgumentNode | ASTVariableNode | ASTFunctionNode;

export class Parser {
	private input: TokenGenerator;
	private stack: ReadonlyToken[] = [];
	private nodes: ASTNode[] = [];

	public constructor(str: string) {
		this.input = new Lexer(str)[Symbol.iterator]();
	}

	public parse(): ASTNode[] {
		let buffer = '';

		for (const token of this.input) {
			if (token.type == TokenType.TagStart) {
				if (buffer.length) {
					this.nodes.push({
						type: ASTNodeType.Literal,
						value: buffer,
					});
					buffer = '';
				}
				this.nodes.push(this.parseTag());
			} else buffer += token.value;
		}

		if (buffer.length) {
			this.nodes.push({
				type: ASTNodeType.Literal,
				value: buffer,
			});
		}

		return this.nodes;
	}

	private parseTag(): ASTNode {
		let done = false;

		let tag: ASTNode;

		const name = this.omit(TokenType.Space).value;
		const next = this.omit(TokenType.Space);

		const args = [];

		if (next.type === TokenType.Colon) {
			let arg = this.parseArg();

			while (arg) {
				args.push(arg);
				arg = this.parseArg();
			}

			if (!args.length) {
				throw '[ERROR]: Tag payload must have at least one argument.';
			}

			tag = {
				type: ASTNodeType.Function,
				name,
				args,
			} as ASTFunctionNode;
		}

		if (next.type === TokenType.TagEnd) {
			done = true;

			tag = {
				type: ASTNodeType.Variable,
				name,
			} as ASTVariableNode;
		}

		while (!done) {
			const token = this.omit(TokenType.Space);

			if (token.type === TokenType.TagEnd) {
				break;
			}
		}

		return tag!;
	}

	private parseArg(): ASTNode | boolean {
		const stems = [];

		let buffer = '';

		while (true) {
			const token = this.next();

			if (token.type === TokenType.Pipe) {
				break;
			} else if (token.type === TokenType.TagEnd) {
				this.stack.push(token);
				break;
			} else if (token.type === TokenType.TagStart) {
				if (buffer.length) {
					stems.push({
						type: ASTNodeType.Literal,
						value: buffer,
					});
					buffer = '';
				}
				stems.push(this.parseTag());
			} else buffer += token.value;
		}

		if (buffer.length) {
			stems.push({
				type: ASTNodeType.Literal,
				value: buffer,
			});
		}

		return stems.length ? ({ type: ASTNodeType.Argument, stems } as ASTArgumentNode) : false;
	}

	private next(): ReadonlyToken {
		if (this.stack.length) {
			return this.stack.pop()!;
		}

		const { done, value } = this.input.next();

		if (done) {
			throw '[ERROR]: Reached EOS.';
		}

		return value;
	}

	private omit(omit: TokenType): ReadonlyToken {
		let token: ReadonlyToken | undefined;

		while ((token = this.next()).type === omit) {
			continue;
		}

		return token;
	}
}
