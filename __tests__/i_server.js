"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocketNode = require("ws");
const ipAddress = "192.168.1.101";
if (ipAddress === "") {
    throw new Error("Please insert an IP-Address for testing");
}
const ws = new WebSocketNode("http://" + ipAddress + ":1880/peripherals");
let count = 0;
test("testServerClientCommunications", (done) => {
    ws.on("open", () => {
        ws.on("message", (m) => {
            let parsedMessage = JSON.parse(m);
            if (parsedMessage.type === "clientAllPeripheralsDataReceived" && parsedMessage.data) {
                closeSocket(done);
            }
            if (parsedMessage.type === "serverAllPeripheralsData" && parsedMessage.data) {
                closeSocket(done);
            }
            if (parsedMessage.type === "serverPeripheralData" && parsedMessage.data) {
                closeSocket(done);
            }
            if (parsedMessage.type === "getClientAllPeripheralsData" && parsedMessage.data) {
                closeSocket(done);
            }
            if (parsedMessage.type === "Error: Illegal message received") {
                closeSocket(done);
            }
            if (parsedMessage.type === "serverPeripheralCommandReceived") {
                closeSocket(done);
            }
        });
        ws.send(JSON.stringify({
            type: "getServerAllPeripheralsData",
            data: [],
            id: "TEST"
        }));
        ws.send(JSON.stringify({
            type: "clientAllPeripheralsData",
            data: [],
            id: "TEST"
        }));
        ws.send(JSON.stringify({
            type: "getServerPeripheralData",
            data: [],
            id: "TEST"
        }));
        ws.send(JSON.stringify({
            type: "serverAllPeripheralsDataReceived",
            data: [],
            id: "TEST"
        }));
        ws.send(JSON.stringify({
            type: "serverPeripheralCommand",
            data: [],
            id: "TEST"
        }));
        ws.send(JSON.stringify({
            type: "RANDOM_MESSAGE",
            data: [],
            id: "TEST"
        }));
    });
});
function closeSocket(done) {
    count++;
    if (count === 6) {
        ws.close();
        done();
    }
}
//# sourceMappingURL=i_server.js.map