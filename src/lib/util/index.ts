import { ASTNode, Parser } from '../Parser';

export function getCode(str: string): number {
	return str.charCodeAt(0);
}

export function parse(content: string): ASTNode[] {
	return new Parser(content).parse();
}
