"use client";
import { useEffect, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import { conversationIdAtom, conversationsAtom, messagesAtom, recepientIdAtom, socketAtom, userAtom } from "../store/store"; // Import the atom
import { getSession } from "next-auth/react";
import { getConversations } from "../actions/getConversations";

export default function WebSocketProvider() {
  const setSocket = useSetAtom(socketAtom);
  const [messages, setMessages] = useAtom(messagesAtom);
  const [user, setUser] = useAtom(userAtom);
  const [conversationId] = useAtom(conversationIdAtom);
  const [recepientId] = useAtom(recepientIdAtom);
  const [conversations,setConversations] = useAtom(conversationsAtom)

  const conversationsRef = useRef(conversations);

  useEffect(()=>{
    conversationsRef.current = conversations
  },[conversations]);


  //  Use a ref to always get the latest `conversationId`
  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    conversationIdRef.current = conversationId; // Keep ref updated
  }, [conversationId]); // Update on conversationId change


  const recepientIdRef = useRef(recepientId);

  useEffect(() => {
    recepientIdRef.current = recepientId;
  }, [recepientId]);


  useEffect(() => {
    let socket: WebSocket;

    const connectWebSocket = async () => {
      const session = await getSession();
      if (!session?.user?.userId) return;

      socket = new WebSocket("ws://localhost:8080");

      console.log("Session is",session);

      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            type: "registerUser",
            userId: session.user.userId,
          })
        );
        console.log("WebSocket connection established");
      };

      // ON MESSAGE

      socket.onmessage = (event) => {
        console.log("Message from server:", event.data);
        const data = JSON.parse(event.data);

        const currentConversationId = conversationIdRef.current; // ✅ Get latest `conversationId`
        const currentRecepientId = recepientIdRef.current; // Always get the latest value
        const currentConversations = conversationsRef.current;

        switch (data.type) {
          case "message": {
            console.log("conversationId from server", data.conversationId);
            console.log("conversationId client", currentConversationId);

            if (currentConversationId === data.conversationId) {
              setMessages((messages) => [
                ...messages,
                {
                  id: data.id,
                  sender: false,
                  content: data.content,
                  createdAt: new Date(data.createdAt),
                  status: "UNREAD",
                  messageType:data.messageType,
                  attachmentUrl:data.attachmentUrl
                },
              ]);

              console.log("Sending the request for updating the status");

              const updateData = {
                type: 'updateStatus',
                update: {
                  conversationId: currentConversationId,
                  recepientId:currentRecepientId,
                  senderId: user?.userId,
                },
              };
              socket?.send(JSON.stringify(updateData));
            }
            else{
              console.log("Upadint the conversations")
              if(!currentConversations.find((convo)=>convo.id === data.conversationId)){
                window.location.reload();
              }

              const updatedConversations = currentConversations.map((convo)=>{
                if(convo.id === data.conversationId){
                    convo._count.messages += 1;
                    convo.messages[0].content = data.content;
                    convo.messages[0].createdAt = (new Date()).toISOString();
                    if(convo.messages[0].messageType === "image"){
                      convo.messages[0].content = "Image"
                    }
                }
      
                  return convo;
              });
      
              updatedConversations.sort((a, b) => {
                const dateA = a.messages[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
                const dateB = b.messages[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
                return dateB - dateA; 
              });

              setConversations(updatedConversations);
            }

            break;
          }
          case "updateStatus": {
            if (currentConversationId === data.update.conversationId) {
              console.log("Updating the status");
              setMessages((messages) => {
                const newMessages = [...messages];
                for (let i = newMessages.length - 1; i >= 0; i--) {
                  if (newMessages[i]?.status === "READ") {
                    break;
                  }
                  newMessages[i].status = "READ";
                }
                console.log("Updated Messages:", newMessages);
                return newMessages;
              });
            }

            break;
          }
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };

      setSocket(socket);
      setUser(session.user);
    };

    connectWebSocket();

    return () => {
      if (socket) socket.close();
    };
  }, [setSocket]);

  return null; // This component doesn't render anything
}
