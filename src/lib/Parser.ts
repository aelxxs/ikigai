import { Token, TokenType } from '../types/Token';
import { Part, PartType } from '../types/Part';
import { Lexer } from './Lexer';

export class Parser {
	private input: IterableIterator<Token>;
	private parts: Part[] = [];
	private stack: Part[] = [];

	public constructor(public string: string) {
		this.input = new Lexer(string)[Symbol.iterator]();
	}

	public parse() {
		let buffer = '';

		for (const token of this.input) {
			if (token.type === TokenType.TagStart) {
				if (buffer.length) {
					this.parts.push({ type: PartType.Literal, value: buffer });
					buffer = '';
				}

				const tag = this.parseBlock();

				this.parts.push(tag);
			} else buffer += this.toString(token);
		}

		if (buffer.length > 0) {
			this.parts.push({ type: PartType.Literal, value: buffer });
		}

		return this.parts;
	}

	public parseBlock() {
		let finished = false;
		let isFunction = false;
		const name = this.pick(TokenType.Literal).value;
		const next = this.nextExcluding(TokenType.Space, [TokenType.TagStart, TokenType.Literal]);

		let val;

		if (next.type === TokenType.Colon) {
			val = { type: PartType.Variable, name, ...this.parseTagType() };
		} else if (next.type === TokenType.FuncStart) {
			isFunction = true;
			val = { type: PartType.Function, name, ...this.parseFunction() };
		} else if (next.type === TokenType.TagEnd) {
			finished = true;
			val = { type: PartType.Variable, name };
		} else {
			if (!isFunction) {
				throw `Expected TagEnd, FuncStart, or Colon but received ${TokenType[next.type]}`;
			}
		}

		while (!finished) {
			const token = this.nextExcluding(TokenType.Space);

			if (token.type === TokenType.TagEnd) {
				break;
			}
		}

		return val;
	}

	private parseFunction() {
		let buffer = '';

		const args = [];

		while (true) {
			const part = this.nextExcluding(TokenType.Space, [
				TokenType.FuncEnd,
				TokenType.TagStart,
				TokenType.Literal,
			]);

			if (part.type === TokenType.FuncEnd) {
				this.stack.push(part);

				break;
			}

			if (part.type === TokenType.TagStart) {
				args.push(this.parseBlock());
			} else if (part.type === TokenType.Literal) {
				args.push({ type: PartType.Literal, value: part.value });
			} else buffer += this.toString(part);
		}

		// if (buffer.length > 0) {
		// 	args.push({ type: PartType.Literal, value: buffer });
		// }

		return { args };
	}

	private parseTagType() {
		const args = [];

		while (true) {
			const part = this.nextExcluding(TokenType.Space);

			if (part.type === TokenType.TagEnd) {
				this.stack.push(part);

				break;
			}

			if (part.type === TokenType.TagStart) {
				args.push(this.parseBlock());
			}

			if (part.type === TokenType.Literal) {
				args.push({ type: PartType.Literal, value: part.value });
			}
		}

		return { args };
	}

	private next(expect?) {
		if (this.stack.length) return this.stack.pop()!;

		const result = this.input.next();

		if (result.done)
			throw `Expected ${
				expect?.map((e) => TokenType[e]).join(', ') ?? 'a character'
			}, but reached the end of the string.`;

		return result.value;
	}

	private nextExcluding(excluded: TokenType, expexted?) {
		let part = undefined;
		while ((part = this.next(expexted)).type === excluded) continue;

		return part;
	}

	private pick(type) {
		const part = this.next([type]);
		this.validate(part, type);

		return part;
	}

	private validate(part, type) {
		if (part.type !== type) throw `Expected ${TokenType[type]}, received ${TokenType[part.type]}`;
	}

	private toString(token: Token): string {
		switch (token.type) {
			case TokenType.Space:
				return ' ';
			case TokenType.TagStart:
				return '{';
			case TokenType.TagEnd:
				return '}';
			case TokenType.FuncStart:
				return '(';
			case TokenType.FuncEnd:
				return ')';
			case TokenType.Colon:
				return ':';
			case TokenType.Comma:
				return ',';
			case TokenType.Literal: {
				return token.value;
			}
		}
	}
}
