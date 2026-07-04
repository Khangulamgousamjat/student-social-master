import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

export interface FirebaseChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  recipientId: string;
  text: string;
  mediaUrl?: string;
  createdAt?: Timestamp | Date | number;
}

/**
 * Send a realtime message using Firestore
 */
export async function sendFirestoreMessage(
  conversationId: string,
  message: Omit<FirebaseChatMessage, "id" | "createdAt">
) {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  return addDoc(messagesRef, {
    ...message,
    createdAt: serverTimestamp(),
  });
}

/**
 * Subscribe to realtime messages for a specific conversation ID
 */
export function subscribeToFirestoreMessages(
  conversationId: string,
  callback: (messages: FirebaseChatMessage[]) => void
) {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages: FirebaseChatMessage[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<FirebaseChatMessage, "id">),
    }));
    callback(messages);
  });
}
