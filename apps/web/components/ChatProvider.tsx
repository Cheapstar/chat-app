// "use client";

// import {
//   createContext,
//   Dispatch,
//   SetStateAction,
//   useContext,
//   useState,
// } from "react";
// import { ConversationType, MessageType } from "../store/store";

// const ChatContext = createContext<ChatContextType>({
//   messages: [],
//   setMessages: function (value: SetStateAction<MessageType[]>): void {
//     throw new Error("Function not implemented.");
//   },
//   conversations: [],
//   setConversations: function (value: SetStateAction<ConversationType[]>): void {
//     throw new Error("Function not implemented.");
//   },
//   selectedConversationId: "",
//   setSelectedConversationId: function (value: SetStateAction<string>): void {
//     throw new Error("Function not implemented.");
//   },
// });

// export function ChatProvider({ children }: { children: React.ReactNode }) {
//   const [messages, setMessages] = useState<MessageType[]>([]);
//   const [conversations, setConversations] = useState<ConversationType[]>([]);
//   const [selectedConversationId, setSelectedConversationId] =
//     useState<string>("");

//   return (
//     <ChatContext.Provider
//       value={{
//         messages,
//         setMessages,
//         conversations,
//         setConversations,
//         selectedConversationId,
//         setSelectedConversationId,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// }

// export function useChat() {
//   return useContext(ChatContext);
// }

// interface ChatContextType {
//   messages: MessageType[];
//   setMessages: Dispatch<SetStateAction<MessageType[]>>;
//   conversations: ConversationType[];
//   setConversations: Dispatch<SetStateAction<ConversationType[]>>;
//   selectedConversationId: string;
//   setSelectedConversationId: Dispatch<SetStateAction<string>>;
// }
