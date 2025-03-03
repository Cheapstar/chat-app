"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { prisma } from "@repo/database";

export async function getConversations() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId; // Ensure userId exists

    if (!userId) return [];

    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: userId // Ensure the logged-in user is a participant
                    }
                }
            },
            select: {
                id: true,
                groupName: true,
                isGroup: true,
                participants: {
                    where: {
                        userId: { not: userId } // Exclude the logged-in user
                    },
                    select: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profilePicture: true
                            }
                        }
                    }
                },
                messages: {
                    take: 1,
                    orderBy: {
                        createdAt: "desc"
                    },
                    select: {
                        content: true,
                        createdAt: true,
                        messageType:true
                    },
                },
                _count:{
                    select:{
                        messages:{
                            where:{
                                senderId:{not:userId},
                                statusUpdates:{
                                    some:{
                                        status:"UNREAD"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        conversations.sort((a, b) => {
            const dateA = a.messages[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
            const dateB = b.messages[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
            return dateB - dateA; 
        });

        return conversations;
    } catch (err) {
        console.log("Error fetching conversations:", err);
        return [];
    }
}
