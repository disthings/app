import {Message} from "../src/types";

const WebSocketNode: any = require("ws");
const ipAddress: string = "192.168.1.101";
if(ipAddress === "") {
	throw new Error("Please insert an IP-Address for testing");
}
const ws: any = new WebSocketNode("http://" + ipAddress + ":1880/peripherals");
let count: number = 0;


test("testServerClientCommunications", (done: Function) => {

	ws.on("open", () => {
		ws.on("message", (m: string) => {
			let parsedMessage: Message = JSON.parse(m);

			if (parsedMessage.type === "clientAllPeripheralsDataReceived" && parsedMessage.data) {
				closeSocket(done);
			}
			if (parsedMessage.type === "serverAllPeripheralsData" && parsedMessage.data) {
				closeSocket(done);
			}
			if(parsedMessage.type === "serverPeripheralData" && parsedMessage.data) {
				closeSocket(done);
			}
			if(parsedMessage.type === "getClientAllPeripheralsData" && parsedMessage.data) {
				closeSocket(done);
			}
			if(parsedMessage.type === "Error: Illegal message received") {
				closeSocket(done);
			}
			if(parsedMessage.type === "serverPeripheralCommandReceived") {
				closeSocket(done);
			}
		});

		ws.send(JSON.stringify({
			type: "getServerAllPeripheralsData",
			data: []
		}));

		ws.send(JSON.stringify({
			type: "clientAllPeripheralsData",
			data: []
		}));

		ws.send(JSON.stringify({
			type: "getServerPeripheralData",
			data: []
		}));

		ws.send(JSON.stringify({
			type: "serverAllPeripheralsDataReceived",
			data: []
		}));

		ws.send(JSON.stringify({
			type: "serverPeripheralCommand",
			data: []
		}));

		ws.send(JSON.stringify({
			type: "RANDOM_MESSAGE",
			data: []
		}));
	});
});

function closeSocket(done: Function): void {
	count++;
	if (count === 6) {
		ws.close();
		done();
	}
}