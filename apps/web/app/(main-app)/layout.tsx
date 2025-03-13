import { ChatProvider } from "../../components/ChatProvider";
import WebSocketProvider from "../../components/WebSocketProvider";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <WebSocketProvider></WebSocketProvider>
      <ChatProvider>{children}</ChatProvider>
    </>
  );
}
