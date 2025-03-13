import { Explore } from "../../../components/Explore";
import { SideBar } from "../../../components/SideBar";

export default function Page() {
  return (
    <div className="h-screen bg-gray-700 lg:py-8 lg:px-8 relative flex">
      <SideBar></SideBar>
      <div className="grow">
        <Explore></Explore>
      </div>
    </div>
  );
}
