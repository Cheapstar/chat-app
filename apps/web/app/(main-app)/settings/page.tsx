import { Settings } from "../../../components/Settings";
import { SideBar } from "../../../components/SideBar";

export default function Page() {
  return (
    <div className="h-screen bg-gray-700 lg:py-6 lg:px-6 relative flex">
      <SideBar></SideBar>
      <div className="min-w-[30%] bg-white">
        <Settings></Settings>
      </div>
      <div className="grow bg-gray-200"></div>
    </div>
  );
}
