import { Lexer, TokenType, ReadonlyToken, TokenGenerator } from './Lexer';

export class Parser {
	private input: TokenGenerator;
	private stack: ReadonlyToken[] = [];
	private nodes: ASTNode[] = [];

	public constructor(str: string) {
		this.input = new Lexer(str)[Symbol.iterator]();
	}

	public parse() {
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
			} else {
				buffer += token.value;
			}
		}

		if (buffer.length) {
			this.nodes.push({
				type: ASTNodeType.Literal,
				value: buffer,
			});
		}

		return this.nodes;
	}

	private parseTag() {
		let done = false;

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
		}

		if (next.type === TokenType.TagEnd) {
			done = true;
		}

		while (!done) {
			const token = this.omit(TokenType.Space);

			if (token.type === TokenType.TagEnd) {
				break;
			}
		}

		return { type: ASTNodeType.Tag, name, args };
	}

	private parseArg() {
		const nodes = [];

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
					nodes.push({
						type: ASTNodeType.Literal,
						value: buffer,
					});
					buffer = '';
				}
				nodes.push(this.parseTag());
			} else buffer += token.value;
		}

		if (buffer.length) {
			nodes.push({
				type: ASTNodeType.Literal,
				value: buffer,
			});
		}

		return nodes.length ? { type: ASTNodeType.Argument, nodes } : false;
	}

	private next() {
		if (this.stack.length) {
			return this.stack.pop()!;
		}

		const { done, value } = this.input.next();

		if (done) {
			throw '[ERROR]: Reached EOS.';
		}

		return value;
	}

	private omit(omit: TokenType) {
		let token: ReadonlyToken | undefined = undefined;

		while ((token = this.next()).type === omit) {
			continue;
		}

		return token;
	}
}

export const enum ASTNodeType {
	Literal,
	Tag,
	Argument,
}

export interface ASTNode {
	type: ASTNodeType;
	name?: string;
	args?: ASTNode[];
	value?: string;
}
