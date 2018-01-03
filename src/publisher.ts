import {SingleArgumentCallback, Subscriber} from "./types";

export class Publisher {

	private subscribers: Map<string, Array<Subscriber>>;

	constructor() {
		this.subscribers = new Map<string, Array<Subscriber>>();
	}

	subscribeToEvent(eventName: string, callback: SingleArgumentCallback, subscriberID: string): void {
		let subs: Array<Subscriber> = this.subscribers.get(eventName) as Array<Subscriber>;

		if(!subs) {
			subs = [];
			this.subscribers.set(eventName, subs);
		}

		subs.push({
			callback: callback,
			id: subscriberID
		});
	}

	unsubscribeFromEvent(eventName: string, subscriberID: string): void {
		let found: boolean = false;
		let i: number = 0;
		let subs: Array<Subscriber> = this.subscribers.get(eventName) as Array<Subscriber>;
		while(!found && i < subs.length) {
			let sub: Subscriber = subs[i];
			if(found = sub.id === subscriberID) {
				subs.splice(i, 1);
			}
			i++;
		}
	}

	informEventSubscribers(eventName: string, args?: any): void {
		const subs: Array<Subscriber> = this.subscribers.get(eventName) as Array<Subscriber>;

		if(subs) {
			subs.forEach((sub: Subscriber) => {
				sub.callback(args);
			});
		}
	}

	getEventSubscribers(eventName: string): Array<Subscriber> {
		return this.subscribers.get(eventName) as Array<Subscriber>;
	}

	getAllSubscribers(): Map<string, Array<Subscriber>> {
		return this.subscribers;
	}
}