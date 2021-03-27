import { Parser } from './lib/Parser';

export function parse(content: string) {
	return new Parser(content).parse();
}
