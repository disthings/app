export namespace IPValidator {

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
}