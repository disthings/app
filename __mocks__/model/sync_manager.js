"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_manager_1 = require("../../src/model/settings_manager");
const WebSocket = require("ws");
class SyncManager {
    constructor() {
        this.incomingMessageSubscribers = new Map();
        this.incomingMessageSubscribers.set("onSocketReady", []);
        this.incomingMessageSubscribers.set("onSocketDisconnect", []);
        this.incomingMessageSubscribers.set("onSocketReconnect", []);
        settings_manager_1.SettingsManager.getRuntimeSettings((_error, result) => {
            this.settings = result.webSocket;
            this.webSocketAddress = this.settings.host + ":" + this.settings.port + this.settings.path;
            this.webSocketReconnectionInterval = this.settings.reconnectionInterval;
            this.tryToConnect();
        });
    }
    activateSocketListeners() {
        this.webSocket.onopen = () => {
            this.informOnSocketReady();
        };
        this.webSocket.onclose = () => {
            this.informOnSocketDisconnected();
            this.tryToConnect();
        };
        this.webSocket.onerror = (error) => {
            console.warn("WebSocket " + error);
        };
        this.webSocket.onmessage = (ev) => {
            let message = JSON.parse(ev.data);
            this.informMessageSubscribers(message);
        };
    }
    sendMessage(message) {
        this.webSocket.send(JSON.stringify(message));
    }
    subscribeToMessage(messageType, callback, id) {
        let subs = this.getIncomingMessageSubscribers(messageType);
        if (!subs) {
            subs = [];
            this.incomingMessageSubscribers.set(messageType, subs);
        }
        subs.push({ "callback": callback, "id": id });
    }
    onSocketReady(callback, id) {
        let subs = this.getIncomingMessageSubscribers("onSocketReady");
        if (!subs) {
            subs = [];
            this.incomingMessageSubscribers.set("onSocketReady", subs);
        }
        subs.push({ "callback": callback, "id": id });
    }
    onSocketDisconnect(callback, id) {
        let subs = this.getIncomingMessageSubscribers("onSocketDisconnect");
        if (!subs) {
            subs = [];
            this.incomingMessageSubscribers.set("onSocketDisconnect", subs);
        }
        subs.push({ "callback": callback, "id": id });
    }
    informMessageSubscribers(message) {
        const subscribers = this.getIncomingMessageSubscribers(message.type);
        if (message.type === "Error: Illegal message received") {
            console.warn(message.type);
        }
        else {
            subscribers.forEach((subscriber) => {
                subscriber.callback(message);
            });
        }
    }
    informOnSocketReady() {
        const subs = this.getIncomingMessageSubscribers("onSocketReady");
        if (subs) {
            subs.forEach((subscriber) => {
                subscriber.callback();
            });
        }
    }
    informOnSocketDisconnected() {
        const subs = this.getIncomingMessageSubscribers("onSocketDisconnect");
        if (subs) {
            subs.forEach((subscriber) => {
                subscriber.callback();
            });
        }
    }
    getIncomingMessageSubscribers(messageType) {
        let subscribers = this.incomingMessageSubscribers.get(messageType);
        if (!subscribers) {
            subscribers = [];
        }
        return subscribers;
    }
    tryToConnect() {
        setTimeout(() => {
            this.webSocket = new WebSocket(this.webSocketAddress);
            this.activateSocketListeners();
        }, this.webSocketReconnectionInterval);
    }
}
exports.SyncManager = SyncManager;
//# sourceMappingURL=sync_manager.js.map