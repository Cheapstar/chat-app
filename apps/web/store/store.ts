import { WebSocketClient } from "@repo/websocketclient";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const conversationsAtom = atom<ConversationType[]>([]);

export const messagesAtom = atom<MessageType[]>([]);

export const wantsToMessageAtom = atom<true | false>(false);

export const recepientIdAtom = atom<string>();

//
export const LoadConvoAtom = atom<true | false>(false);

export const conversationIdAtom = atom<string>("");

export const socketAtom = atom<WebSocketClient | null>();

export const userAtom = atomWithStorage<SessionUser | undefined>("user", {
  name: "",
  email: "",
  image: "",
  userId: "",
});

export const previewAtom = atom<string>();

export type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  userId?: string;
};

export interface ConversationType {
  id: string;
  isGroup: boolean;
  groupName?: string;
  participants: {
    id: string;
    user: {
      id: string;
      profilePicture: string;
      username: string;
    };
  }[];
  messages: { content: string; createdAt: Date; messageType: string }[];
  _count: { messages: number };
}

export type UserType = {
  conversationId: string;
  id: string;
  username: string;
  email: string;
  profilePicture: string | null;
  status: string;
};

export interface MessageType {
  id: string;
  sender: true | false;
  content: string;
  createdAt: Date;
  status: string;
  messageType: string;
  attachmentUrl?: string;
}
