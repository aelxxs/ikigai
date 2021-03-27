import { Token, TokenType } from '../types/Token';
import { Stream } from './Stream';

const kCharacterSpace = ' '.charCodeAt(0);
const kCharacterTagStart = '{'.charCodeAt(0);
const kCharacterTagEnd = '}'.charCodeAt(0);
const kCharacterColon = ':'.charCodeAt(0);
const kCharacterPropStart = '('.charCodeAt(0);
const kCharacterPropEnd = ')'.charCodeAt(0);
const kCharacterComma = ','.charCodeAt(0);

export class Lexer {
	public tokens: Token[] = [];
	public stream: Stream;
	public buffer = '';

	public constructor(str: string) {
		this.stream = new Stream(str);
	}

	public *[Symbol.iterator](): Generator<Token> {
		while (this.stream.next()) {
			const char = this.stream.peek();

			switch (char.codePointAt(0)) {
				case kCharacterSpace:
					yield* this.pushToken({ type: TokenType.Space });
					break;
				case kCharacterTagStart:
					yield* this.pushToken({ type: TokenType.TagStart });
					break;
				case kCharacterTagEnd:
					yield* this.pushToken({ type: TokenType.TagEnd });
					break;
				case kCharacterColon:
					yield* this.pushToken({ type: TokenType.Colon });
					break;
				case kCharacterPropStart:
					yield* this.pushToken({ type: TokenType.FuncStart });
					break;
				case kCharacterPropEnd:
					yield* this.pushToken({ type: TokenType.FuncEnd });
					break;
				case kCharacterComma:
					yield* this.pushToken({ type: TokenType.Comma });
					break;
				default:
					this.buffer += char;
			}
		}

		yield* this.flushTokens();
	}

	private *pushToken(token: Token) {
		yield* this.flushTokens();
		this.tokens.push(token);
		yield token;
	}

	private *flushTokens() {
		if (this.buffer !== '') {
			const token = { type: TokenType.Literal, value: this.buffer };
			this.tokens.push(token);
			this.buffer = '';
			yield token;
		}
	}
}
