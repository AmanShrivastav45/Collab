import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import main from "../images/main.png"
import "../fonts/stylesheet.css"

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is requried");
      return;
    }

    // redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toast.success("room is created");
  };

  // when enter then also join
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="Geist h-[520px] w-[360px] md:w-[420px] p-4 py-0 mb-16">
            {/* <div className="text-5xl font-bold text-center mb-8 mt-16">
                welcome to Codemirror
            </div> */}
            <img src={main}/>
            <div className="text-left">
                <h3 className="Geist-semibold text-lg">Room ID</h3>
                <input
                    maxLength={64}
                    type="text"
                    placeholder="Enter your room ID"
                    className="my-2 border-2 border-slate-400 hover:border-slate-700 hover:border-2 focus:border-slate-700 focus:border-2 pl-4 outline-none h-12 w-full text-base text-[#1e1e1e] rounded-[7px] flex items-center justify-center"
                    onChange={(e) => setRoomId(e.target.value)}
                    value={roomId}
                    onKeyUp={handleInputEnter}
                />
                <h3 className="Geist-semibold text-lg mt-4">Username</h3>
                <input
                    maxLength={8}
                    placeholder="Enter your name"
                    className="my-2 border-2 border-slate-400 hover:border-slate-700 hover:border-2 focus:border-slate-700 focus:border-2 pl-4 outline-none h-12 w-full text-base text-[#1e1e1e] rounded-[7px] flex items-center justify-center"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyUp={handleInputEnter}
                />
            </div>
            <button onClick={joinRoom} className="mt-8 h-12 w-full text-lg text-gray-100 bg-[#1e1e1e] rounded-[7px] flex items-center justify-center">
                Join Room
            </button>
            <h3 className="Geist text-base text-center text-gray-500 my-2">or</h3>
            <button onClick={generateRoomId} className="h-12 w-full text-lg mb-8 text-[#484848] border-2 border-[#1e1e1e] hover:text-[#000] rounded-[7px] flex items-center justify-center">
                Create a New Room
            </button>
        </div>
        <h3 className="absolute lg:bottom-5 bottom-0  Geist text-sm lg:text-base text-gray-500 lg:my-2">
            made by <a href="https://www.linkedin.com/in/aman-shrivastav-592110253/" target="_blank" className="Geist-semibold text-[#484848]">Aman Shrivastav</a>
        </h3>
    </div>
  );
}

export default Home;
