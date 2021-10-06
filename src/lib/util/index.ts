import { ASTNode, Parser } from '../Parser';

export function parse(str: string): ASTNode[] {
	return new Parser(str).parse();
}
