import { ASTNode, Parser } from '../Parser';

export function getCode(str: string): number {
	return str.charCodeAt(0);
}

export function parse(str: string): ASTNode[] {
	return new Parser(str).parse();
}
