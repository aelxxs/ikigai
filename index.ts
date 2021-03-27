import { stripIndents } from 'common-tags';
import { parse as p } from './src';
import { Part, PartType } from './src/types/Part';

const vars = new Map();

export class Interpreter {
	public env = {};
	public variables;

	public constructor(env = {}) {
		this.env = env;
	}

	public interpret(part: Part | Part[]) {
		let result = '';

		if (Array.isArray(part)) {
			for (const e of part) {
				result += this.interpret(e);
			}

			return result;
		}

		return {
			[PartType.Function]: (part: Part) => {
				const args = [];

				for (const arg of part.args) {
					args.push(this.interpret(arg));
				}

				switch (part.name) {
					case 'bold': {
						return `**${args.join('')}**`;
					}
					case 'random': {
						return args[~~(Math.random() * args.length)];
					}
					case 'upper': {
						return args.join('').toUpperCase();
					}
					case 'set': {
						const [key, value] = args;

						vars.set(key, value);

						return '';
					}
					case 'get': {
						const [key] = args;

						return vars.get(key);
					}
					case 'range': {
						const [min, max] = args;

						return ~~(Math.random() * parseInt(max)) + parseInt(min);
					}
					case 'addBal': {
						const [plus] = args;

						// @ts-ignore
						this.env.user.bal + parseInt(plus);

						return '';
					}
				}
			},
			[PartType.Variable]: (part: Part) => {
				const args = [];

				for (const arg of part.args) {
					args.push(this.interpret(arg));
				}

				console.log(args);
				switch (part.name) {
					case 'title': {
						// @ts-ignore
						this.env.embed.title = args.join(' ');

						return '';
					}
					case 'user.name': {
						// @ts-ignore
						return this.env.user.name;
					}
					case 'currency': {
						// @ts-ignore
						return '💴';
					}
					case 'balance': {
						// @ts-ignore
						return this.env.user.balance;
					}
					default: {
						return '';
					}
				}
			},
			[PartType.Literal]: (part: Part) => {
				return part.value;
			},
		}[part.type].call(this, part, this.env);
	}
}

// const parts = parse('{random {hello} {ok}}');

try {
	const text = `
		{embed({title(Hello)}{color(random)}{time(now)})}
	`;

	const result = p(stripIndents(text));

	const output = new Interpreter({
		user: {
			name: 'Alexis',
			balance: 134,
		},
		embed: {
			title: '',
		},
	}).interpret(result);

	console.dir({ result }, { colors: true, depth: null });
	// console.log({ output: stripIndents(output) });
} catch (err) {
	console.log({ err });
}
