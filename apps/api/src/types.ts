export interface SendMessagePayload {
  userId: string;
  messages: MessageType[];
}

export interface UpdateMessageStatusPayload {
  conversationId: string;
  userId: string;
}
export interface ConversationType {
  id: string;
  isGroup: boolean;
  groupName?: string | null;
  participants: {
    id: string;
    user: {
      id: string;
      profilePicture: string | null;
      username: string;
    };
  }[];
  messages: { content: string | null; createdAt: Date; messageType: string }[];
  _count: { messages: number };
}

export type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  userId?: string;
};

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
  isSender: true | false;
  content: string | null;
  sender: {
    username: string | null;
  };
  createdAt: Date;
  statusUpdates: {
    status: string;
    userId: string;
  }[];
  messageType: string;
  attachmentUrl?: string | null;
  conversationId: string;
}

export interface RecipientType {
  id: string;
  username: string;
  profilePicture: string;
}

export interface ServerActionResponseType {
  success: boolean;
  data: any;
}

export interface API_RESPONSE_TYPE {
  success: boolean;
  data: any;
}
