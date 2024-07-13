import React, { useState } from "react";
import { IoExitOutline, IoCloseOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa6";
import Client from "./Client";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import white from "../images/white.png";
import Confirm from "./Confirm"

const Sidebar = ({ isSidebarOpen, clients, toggleSidebar }) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const navigate = useNavigate();
  const { roomId } = useParams();

  const leaveRoom = () => {
    setShowConfirmationModal(true);
    localStorage.clear();
  };

  const handleConfirmLeave = () => {
    navigate("/");
    toast.success("Left the room!");
  };

  const handleCancelLeave = () => {
    setShowConfirmationModal(false);
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  return (
    <div
      className={`fixed left-0 h-full transition-all duration-300 border-r border-gray-500 ${
        isSidebarOpen ? "w-full md:w-[270px] shadow-xl" : "w-0"
      }`}
      style={{ overflow: "hidden", zIndex: 9999 }}
    >
      <div className="h-full bg-[#1e1e1e] text-black flex flex-col justify-between p-4 relative">
        <div>
          <button
            onClick={toggleSidebar}
            className="absolute top-2 right-2 text-white"
          >
            <IoCloseOutline size={30} />
          </button>
          <div className="h-20 w-full flex items-center justify-center border-b border-gray-600 mt-2">
            <img src={white} className="h-12" />
          </div>
          <h3
            className={`Geist my-4 text-xl rounded-[7px] lg:mb-8 mb-4 flex items-center justify-center text-white`}
          >
            Connected
          </h3>
          <div
            className={`mt-4 grid gap-2 overflow-auto max-h-[320px] text-white place-items-center ${
              isSidebarOpen ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {clients.map((client) => (
              <Client key={client.id} username={client.username} />
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col items-center justify-center">
          <button
            onClick={copyRoomId}
            className={`Geist mt-8 h-10 w-full text-base rounded-[7px] text-[#1e1e1e] flex items-center justify-center ${
              isSidebarOpen ? "bg-gray-200 w-full" : "bg-transparent w-[75%]"
            }`}
          >
            Copy Invite Link
          </button>
          <button
            onClick={leaveRoom}
            className={`Geist mt-4 text-base w-full h-10 mb-4 rounded-[7px] flex items-center justify-center ${
              isSidebarOpen
                ? "bg-red-600 text-white w-full"
                : "bg-transparent text-white w-[75%]"
            }`}
          >
            Leave Room
          </button>
        </div>
      </div>
      {showConfirmationModal && (
        <Confirm
          onConfirm={handleConfirmLeave}
          onCancel={handleCancelLeave}
        />
      )}
    </div>
  );
};

export default Sidebar;

