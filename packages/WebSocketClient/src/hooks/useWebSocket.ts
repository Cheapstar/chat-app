
import { WebSocketClient } from "../WebSocketClient.js"

export function useWebSocketClient(url:string){
    const client = new WebSocketClient(url);
    return client;
}