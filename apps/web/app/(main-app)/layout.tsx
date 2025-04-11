import WebSocketProvider from "../../components/WebSocketProvider";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <WebSocketProvider></WebSocketProvider>
      {children}
    </>
  );
}
