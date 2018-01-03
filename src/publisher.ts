import {SingleArgumentCallback, Subscriber} from "./types";

/*
A class for realizing the Publisher/Subscriber pattern.
 */
export class Publisher {

	private subscribers: Map<string, Array<Subscriber>>; // the key is the event's name

	constructor() {
		this.subscribers = new Map<string, Array<Subscriber>>();
	}

	subscribeToEvent(eventName: string, callback: SingleArgumentCallback, subscriberID: string): void {
		let subs: Array<Subscriber> = this.subscribers.get(eventName) as Array<Subscriber>;

		if(!subs) { // if this event was never subscribed to yet, initialize the array
			subs = [];
			this.subscribers.set(eventName, subs);
		}

		subs.push({
			callback: callback,
			id: subscriberID
		});
	}

	unsubscribeFromEvent(eventName: string, subscriberID: string): boolean {
		let found: boolean = false;
		let i: number = 0;
		let subs: Array<Subscriber> = this.subscribers.get(eventName) as Array<Subscriber>;
		if(subs) {
			while(!found && i < subs.length) {
				let sub: Subscriber = subs[i];
				if(found = sub.id === subscriberID) {
					subs.splice(i, 1);
				}
				i++;
			}
		}
		return found;
	}

	informEventSubscribers(eventName: string, args?: any): boolean {
		const subs: Array<Subscriber> = this.subscribers.get(eventName) as Array<Subscriber>;
		let found: boolean = subs !== undefined;
		if(found) {
			subs.forEach((sub: Subscriber) => {
				sub.callback(args);
			});
		}
		return found;
	}

	getEventSubscribers(eventName: string): Array<Subscriber> {
		return this.subscribers.get(eventName) as Array<Subscriber>;
	}

	getAllSubscribers(): Map<string, Array<Subscriber>> {
		return this.subscribers;
	}
}