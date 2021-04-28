export class Stream {
	private iterator: IterableIterator<string>;
	private position: string = '';

	public constructor(string: string) {
		this.iterator = string[Symbol.iterator]();
	}

	public peek(): string {
		return this.position;
	}

	public next(): boolean {
		const { value, done } = this.iterator.next();

		this.position = value ?? '';

		return !done;
	}
}
