import { WebSocketClient } from "@repo/websocketclient";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
  ConversationType,
  MessageType,
  RecipientType,
  SessionUser,
} from "../types/types";

export const conversationsAtom = atom<ConversationType[]>([]);

export const messagesAtom = atom<MessageType[]>([]);

export const wantsToMessageAtom = atom<true | false>(false);

export const selectedConversationAtom = atom<ConversationType>();

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

export const showCreateGroupModal = atom<boolean>();
