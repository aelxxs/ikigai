import { Stream } from './Stream';
import { getCode } from './util';

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
	position?: Position;
}

export interface Position {
	line: number;
	col: number;
	selected: number;
}

export type ReadonlyToken = Readonly<Token>;
export type TokenGenerator = IterableIterator<ReadonlyToken>;

// ? Got a nicer way to handle Token positioning? Open an issue 🎉

export class Lexer {
	private tokens: Token[] = [];
	private buffer: string = '';
	private stream: Stream;

	private position = {
		line: 1,
		col: 0,
	};

	public constructor(str: string) {
		this.stream = new Stream(str);
	}

	public *[Symbol.iterator](): TokenGenerator {
		while (this.stream.next()) {
			const char = this.stream.peek();

			this.position.col++;

			switch (getCode(char)!) {
				case getCode('{'): {
					yield* this.pushToken({
						type: TokenType.TagStart,
						value: '{',
						position: { ...this.position, selected: 1 },
					});
					break;
				}
				case getCode(':'): {
					yield* this.pushToken({
						type: TokenType.Colon,
						value: ':',
						position: { ...this.position, selected: 1 },
					});
					break;
				}
				case getCode('|'): {
					yield* this.pushToken({
						type: TokenType.Pipe,
						value: '|',
						position: { ...this.position, selected: 1 },
					});
					break;
				}
				case getCode('}'): {
					yield* this.pushToken({
						type: TokenType.TagEnd,
						value: '}',
						position: { ...this.position, selected: 1 },
					});
					break;
				}
				case getCode(' '): {
					yield* this.pushToken({
						type: TokenType.Space,
						value: ' ',
						position: { ...this.position, selected: 1 },
					});
					break;
				}
				case getCode('\n'): {
					this.position.col = 1;
					this.position.line++;
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
				position: {
					line: this.position.line,
					col: this.position.col - this.buffer.length, // ? Start of Buffer column
					selected: this.buffer.length,
				},
			};

			this.tokens.push(token);
			this.buffer = '';
			yield token;
		}
	}
}
