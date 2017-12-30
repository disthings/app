interface Iterable {
	[key: string]: any;
}

export function forEachAsync(arrayOrObjectLiteral: Iterable,
					  doOnIteration: (item: any, indexOrKey: number | string, next: () => void) => void,
					  doAfterLastIteration: () => void): void {

	let length: number, i: number;


	function incrementIteration(): void {
		i++;
		return iterateOrFinish();
	}

	function iterateOrFinish(): void {
		if (i < length) {
			return doOnIteration(arrayOrObjectLiteral[i], i, incrementIteration);
		}
		else if(doAfterLastIteration) {
			return doAfterLastIteration();
		}
	}

	function iterateObject(keys: Array<string>): void {

		return forEachAsync(keys, (key: string, _i: number, next: () => void) => {
			return doOnIteration(arrayOrObjectLiteral[key], key, next);
		}, doAfterLastIteration);
	}


	if (arrayOrObjectLiteral instanceof Array) {
		i = 0;
		length = arrayOrObjectLiteral.length;
		return iterateOrFinish();
	}
	else if (arrayOrObjectLiteral instanceof Object) {
		let objectKeys: Array<string> = Object.keys(arrayOrObjectLiteral);
		return iterateObject(objectKeys);
	}
	else {
		throw(new Error("Inserted a: " + arrayOrObjectLiteral + ". Please insert an array, or an object literal"));
	}
}