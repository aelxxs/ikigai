## 📑 Ikigai

> Ikigai is a fast and simple text parser - based off of JagTags's tag structure.

-   UTF-16 Character Encoding Support
-   `O(n)` Time Complexity Lexer
-   Uses **0** Regex

Strongly based off of Skya Bot's implementation. See `Acknowledgements` for more information.

### Built With

-   [TypeScript](https://www.typescriptlang.org/)

### Installation

Might upload to NPM sometime later. Clone this repo and compile it yourself for now :D

### Usage

```ts
import { parse } from '...';

const nodes = parse('Hello {user.name} {choose:😀|👋|🎉}!');

console.dir(nodes, { depth: null });

// Parser AST Output
// 0: Literal | 1: Variable | 2: Function | 3: Argument
[
	{ type: 0, value: 'Hello ' },
	{ type: 1, name: 'user.name' },
	{ type: 0, value: ' ' },
	{
		type: 2,
		name: 'choose',
		args: [
			{ type: 3, stems: [{ type: 0, value: '😀' }] },
			{ type: 3, stems: [{ type: 0, value: '👋' }] },
			{ type: 3, stems: [{ type: 0, value: '🎉' }] },
		],
	},
	{ type: 0, value: '!' },
];
```

ASTNode Interpretation is up to you to implement. Here's an example of what you could do:

```ts
import { ASTNode, ASTNodeType } from '...';

export function interpret(node: ASTNode | ASTNode[]): string {
	let output = '';

	if (Array.isArray(node)) {
		for (const stem of node) {
			output += interpret(stem);
		}

		return output;
	}

	switch (node.type) {
		case ASTNodeType.Literal:
			// 🍣
			break;
		case ASTNodeType.Argument:
			// 🍚
			break;
		case ASTNodeType.Function:
			// 🍡
			break;
		case ASTNodeType.Variable:
			// 🍙
			break;
	}
}
```

<!-- ROADMAP -->

### Roadmap

-   [ ] Add better error messages

### License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->

### Contact

Alexis Vielma • hello@alexis.kr

Project Link: [https://github.com/ohagiiman/ikigai](https://github.com/ohagiiman/ikigai)

<!-- ACKNOWLEDGEMENTS -->

### Acknowledgements

-   [@skyra-project/tags](https://github.com/skyra-project/tags)
-   [@thesharks/jagtag-js](https://github.com/TheSharks/JagTag-JS)
