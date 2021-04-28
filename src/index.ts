import { Parser, ASTNode } from './lib/Parser';

export function parse(content: string): ASTNode[] {
	return new Parser(content).parse();
}

export * from './lib/Lexer';
export * from './lib/Parser';
