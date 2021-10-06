import { Stream } from './Stream';

export const enum TokenType {
	TagStart,
	Colon,
	Pipe,
	TagEnd,
	Space,
	Literal,
}

export interface Token {
	type: TokenType;
	value?: string;
}

export type ReadonlyToken = Readonly<Token>;
export type TokenGenerator = IterableIterator<ReadonlyToken>;

export class Lexer {
	private tokens: Token[] = [];
	private buffer: string = '';
	private stream: Stream;

	public constructor(str: string) {
		this.stream = new Stream(str);
	}

	public *[Symbol.iterator](): TokenGenerator {
		while (this.stream.next()) {
			const char = this.stream.peek();

			switch (this.getCode(char)!) {
				case this.getCode('{'): {
					yield* this.pushToken({
						type: TokenType.TagStart,
						value: '{',
					});
					break;
				}
				case this.getCode(':'): {
					yield* this.pushToken({
						type: TokenType.Colon,
						value: ':',
					});
					break;
				}
				case this.getCode('|'): {
					yield* this.pushToken({
						type: TokenType.Pipe,
						value: '|',
					});
					break;
				}
				case this.getCode('}'): {
					yield* this.pushToken({
						type: TokenType.TagEnd,
						value: '}',
					});
					break;
				}
				case this.getCode(' '): {
					yield* this.pushToken({
						type: TokenType.Space,
						value: ' ',
					});
					break;
				}
				default: {
					this.buffer += char;
				}
			}
		}

		yield* this.flushTokens();
	}

	private *pushToken(token: Token): TokenGenerator {
		yield* this.flushTokens();
		this.tokens.push(token);
		yield token;
	}

	private *flushTokens(): TokenGenerator {
		if (this.buffer.length) {
			const token: Token = {
				type: TokenType.Literal,
				value: this.buffer,
			};
			this.tokens.push(token);
			this.buffer = '';
			yield token;
		}
	}

	private getCode(str: string): number {
		return str.charCodeAt(0);
	}
}
