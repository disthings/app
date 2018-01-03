import {Iterable, ObjectLiteral} from "./types";

export function errorCallback(error: Error): void {
	if(error) {
		console.error(error);
	}
}

export function forEachAsync<T>(arrayOrObjectLiteral: Iterable<T>,
									   doOnIteration: (item: T, indexOrKey: number | string, next: () => void) => void,
									   doAfterLastIteration: () => void): void {

	let length: number, i: number;


	function incrementIteration(): void {
		i++;
		return iterateOrFinish();
	}

	function iterateOrFinish(): void {
		if (i < length) {
			let iterable: T = (arrayOrObjectLiteral as Array<T>)[i];
			return doOnIteration(iterable, i, incrementIteration);
		}
		else if(doAfterLastIteration) {
			return doAfterLastIteration();
		}
	}

	function iterateObject(keys: Iterable<string>): void {

		return forEachAsync(keys, (key: string, _i: number, next: () => void) => {
			return doOnIteration((arrayOrObjectLiteral as ObjectLiteral<T>)[key], key, next);
		}, doAfterLastIteration);
	}


	if (arrayOrObjectLiteral instanceof Array) {
		i = 0;
		length = arrayOrObjectLiteral.length;
		return iterateOrFinish();
	}
	else if (arrayOrObjectLiteral instanceof Object) {
		let objectKeys: Iterable<string> = Object.keys(arrayOrObjectLiteral) as Iterable<string>;
		return iterateObject(objectKeys);
	}
	else {
		throw(new Error("Inserted a: " + arrayOrObjectLiteral + ". Please insert an array, or an object literal"));
	}
}

export function isValidIPv4(ip: string): boolean {
	const splitString: Array<string> = ip.split(".");
	let isValid: boolean = splitString.length === 4;
	let i: number = 0;

	while(isValid && i < splitString.length) {
		let part: string = splitString[i];
		let octet: number = -1;
		try {
			octet = Number.parseInt(part);
			isValid = octet > -1 && octet < 256;

		} catch(error) {
			isValid = false;
		}
		i++;
	}
	return isValid;
}