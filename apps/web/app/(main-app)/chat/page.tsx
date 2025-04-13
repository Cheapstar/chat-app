import { ChatApp } from "../../../components/ChatApp";
import { CreateGroupModal } from "../../../components/CreateGroupModal";
import { SideBar } from "../../../components/SideBar";

export default function Page() {
  return (
    <div className="h-screen bg-gray-700 lg:py-6 lg:px-6 relative flex overflow-hidden">
      <SideBar></SideBar>
      <div className="grow">
        <ChatApp></ChatApp>
      </div>
      <CreateGroupModal></CreateGroupModal>
    </div>
  );
}
