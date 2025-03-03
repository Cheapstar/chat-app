import { SubmitHandler, useForm } from "react-hook-form";
import { useAtom } from "jotai";
import { conversationIdAtom, messagesAtom, previewAtom, recepientIdAtom, socketAtom, conversationsAtom } from "../../store/store";
import { getSession } from "next-auth/react";
import { ConversationType } from "../../store/store";
import { read } from "fs";

export function useChatForm() {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        resetField,
        formState: { isDirty }
    } = useForm<{ message: string; image: FileList | null }>({
        defaultValues: { message: "" ,image:null},
    });

    const [conversationId] = useAtom(conversationIdAtom);
    const [recepientId] = useAtom(recepientIdAtom);
    const [messages, setMessages] = useAtom(messagesAtom);
    const [conversations, setConversations] = useAtom(conversationsAtom);
    const [socket] = useAtom(socketAtom);
    const [showPreview, setShowPreview] = useAtom(previewAtom);

    async function sendMessageHandler(data: { message: string; image: FileList }) {
        try {
            const session = await getSession();
            const message = {
                userId: session?.user.userId,
                recepientId,
                content: data.message,
                conversationId,
                attachmentUrl: "",
                messageType: "text",
                imageString:""
            };
            
            
            if (data.image && data.image.length > 0) {
                message.content = "";
                message.messageType = "image";

                // sending the image as base64string
                const reader = new FileReader();
                reader.readAsDataURL(data.image[0] as File);

                reader.onload = () => {
                    message.imageString = reader.result as string; 
                    console.log("Base64 Image:", message.imageString);
                    socket?.send(JSON.stringify({ type: "sendMessage", message }));
                };
            }
            
            setMessages([...messages, {
                id: crypto.randomUUID(),
                sender: true,
                content: message.content,
                createdAt: new Date(),
                status: "",
                messageType: message.messageType,
                attachmentUrl: showPreview
            }]);

            if(message.messageType === "text"){
                socket?.send(JSON.stringify({ type: "sendMessage", message }));
            }


            // Update last message in conversations
            const updatedConversations = conversations.map((convo:ConversationType) =>
                convo.id === conversationId
                    ? { ...convo, messages: [{ ...convo.messages[0], content: data.message, createdAt: new Date().toISOString() }] }
                    : convo
            );

            setConversations(updatedConversations as ConversationType[]);
            setValue("image", null, { shouldDirty: true });
            setShowPreview("");

            reset();
        } catch (error) {
            console.error("Error while sending message", error);
        }
    }

    return {
        register,
        handleSubmit: handleSubmit(sendMessageHandler as SubmitHandler<{ message: string; image: FileList | null; }>),
        watch,
        isDirty,
        setValue,
        showPreview,
        setShowPreview,
        resetField
    };
}
