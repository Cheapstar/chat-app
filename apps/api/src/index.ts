import express from "express";

import { WebSocketClient } from "./WebSocketServer/WebSocketServer.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const httpServer = app.listen(8080, () => {
  console.log("WebSocket server is running at http://localhost:8080");
});

app.get("/", (req, res) => {
  res.send("WebSocket server is running at http://localhost:8080");
});

(async () => {
  const webSocket = new WebSocketClient(httpServer);
})();

export type Message = {
  userId: string;
  content: string;
  conversationId: string;
  recepientId: string;
};
// const parsedData = JSON.parse(data.toString());
// console.log('Received userId:', parsedData.userId); // Will show "opopopo"

// switch(parsedData.type){
//   case 'registerUser': {
//     connections.set(parsedData.userId,ws);
//     console.log(`User with ${parsedData.userId} Connected`);
//     break;
//   }
//   case 'sendMessage':{
//     console.log("Message :", parsedData);
//     console.log("Saving Message in Database",parsedData.message);
//     const message = await sendMessage(parsedData.message);

//     if(!message.id){
//       console.log("Some Error Occured")
//       return;
//     }

//     const recipientWs = connections.get(parsedData.message.recepientId);

//     if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
//       recipientWs.send(JSON.stringify({
//           type:"message",
//           id: message.id,
//           content:message.content,
//           createdAt:message.createdAt,
//           conversationId:message.conversationId,
//           messageType:message.messageType,
//           attachmentUrl:message.attachmentUrl,
//     }));
//       console.log(`Update sent to ${parsedData.message.recepientId}`);
//     } else {
//       console.log(`User ${parsedData.message.recepientId} is not connected`);
//     }

//     break;
//   }
//   case 'updateStatus':{
//     const update = await updateStatus({
//       conversationId:parsedData.update.conversationId,
//       senderId:parsedData.update.senderId
//     });

//     if(!update){
//       console.log("Some Error Occured While Updating the status, Socket")
//     }

//     const recipientWs = connections.get(parsedData.update.recepientId);

//     if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
//       recipientWs.send(JSON.stringify({
//           type:'updateStatus',
//           update:{
//             conversationId:parsedData.update.conversationId
//           }
//         }));
//       console.log(`Message sent to ${parsedData.update.recepientId}`);
//     } else {
//       console.log(`User ${parsedData.update.recepientId} is not connected`);
//     }

//     break;
//   }

// }
