export class Stream {
	private character = '';
	private iterator: IterableIterator<string>;

	public constructor(str: string) {
		this.iterator = str[Symbol.iterator]();
	}

	public peek(): string {
		return this.character;
	}

	public next(): boolean {
		const char = this.iterator.next();

		if (char.done) {
			this.character = '';
			return false;
		}

		this.character = char.value;
		return true;
	}
}
