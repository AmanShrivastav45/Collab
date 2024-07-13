import React, { useState, useEffect, useRef } from "react";
import { IoMenu, IoCloseOutline } from "react-icons/io5";
import Editor from "./Editor";
import Client from "./Client";
import "../fonts/stylesheet.css";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import codeTemplates from "./codeTemplates";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";

const EditorPage = () => {
  const [clients, setClients] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(
    codeTemplates[localStorage.getItem("language")] || codeTemplates.cpp
  );
  const codeRef = useRef(code);
  const languageRef = useRef(localStorage.getItem("language") || "cpp");
  const editorRef = useRef(null);
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            language: languageRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });
    };
    init();

    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket) {
      const handleCodeChange = ({ code, language }) => {
        if (editorRef.current && code !== null && code !== codeRef.current) {
          const currentPosition = editorRef.current.getCursor();
          codeRef.current = code;
          editorRef.current.setValue(code);
          editorRef.current.setCursor(currentPosition);
          setCode(code);
          if (language) {
            languageRef.current = language;
            localStorage.setItem("language", language); // Update local storage with the new language
          }
        }
      };

      const handleOutputChange = ({ output }) => {
        setOutput(output);
      };

      const handleLanguageChange = ({ language }) => {
        languageRef.current = language;
        localStorage.setItem("language", language);
      };

      socket.on(ACTIONS.CODE_CHANGE, handleCodeChange);
      socket.on(ACTIONS.OUTPUT_CHANGE, handleOutputChange);
      socket.on(ACTIONS.LANGUAGE_CHANGE, handleLanguageChange);

      return () => {
        socket.off(ACTIONS.CODE_CHANGE, handleCodeChange);
        socket.off(ACTIONS.OUTPUT_CHANGE, handleOutputChange);
        socket.off(ACTIONS.LANGUAGE_CHANGE, handleLanguageChange);
      };
    }
  }, [socketRef.current, code]);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket) {
      const handleLanguageChange = ({ language }) => {
        languageRef.current = language;
        localStorage.setItem("language", language);
        const templateCode = codeTemplates[language];
        setCode(templateCode);
        codeRef.current = templateCode;
        if (editorRef.current) {
          editorRef.current.setValue(templateCode);
        }
      };

      socket.on(ACTIONS.LANGUAGE_CHANGE, handleLanguageChange);

      return () => {
        socket.off(ACTIONS.LANGUAGE_CHANGE, handleLanguageChange);
      };
    }
  }, [socketRef.current]);

  const onLanguageChange = (event) => {
    event.preventDefault();
    const selectedLanguage = event.target.value;
    languageRef.current = selectedLanguage;
    const templateCode = codeTemplates[selectedLanguage];
    setCode(templateCode);
    codeRef.current = templateCode;

    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
      roomId,
      code: templateCode,
      language: selectedLanguage,
    });
    socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
      roomId,
      language: selectedLanguage,
    });

    if (editorRef.current) {
      editorRef.current.setValue(templateCode);
    }
  };

  const clearCode = () => {
    const templateCode = codeTemplates[languageRef.current];
    codeRef.current = templateCode;
    if (editorRef.current) {
      editorRef.current.setValue(templateCode);
    }
    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
      roomId,
      code: templateCode,
      language: languageRef.current,
    });
  };

  const runCode = async () => {
    setIsLoading(true);
    const options = {
      method: "POST",
      url: "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": process.env.REACT_APP_ONECOMPILER_API,
        "X-RapidAPI-Host": "onecompiler-apis.p.rapidapi.com",
      },
      data: {
        language: languageRef.current,
        files: [
          {
            name: `index.${languageRef.current}`,
            content: codeRef.current,
          },
        ],
        stdin: input,
      },
    };

    try {
      const response = await axios.request(options);
      let outputText = "";
      if (response.data.status === "success") {
        if (response.data.exception) {
          outputText = response.data.exception;
        } else {
          outputText = response.data.stdout;
        }
      } else {
        outputText = "Error occurred while running the code.";
      }
      setOutput(outputText);
      socketRef.current.emit(ACTIONS.OUTPUT_CHANGE, {
        roomId,
        output: outputText,
      });
    } catch (error) {
      console.error("Error occurred while making API request:", error);
      setOutput("Error occurred while running the code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="Geist h-screen w-full flex flex-col xl:flex-row items-start">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        clients={clients}
        toggleSidebar={handleSidebarToggle}
      />
      <div className="w-full xl:w-[65%] p-2 xl:p-4">
        <div className="h-16 xl:h-20 mb-2 w-full flex items-center justify-between">
          <div className="ml-2">
            {isSidebarOpen ? (
              <button
                className="fixed top-4 left-2 p-2 bg-gray-300 text-black rounded-full z-[10] focus:outline-none"
                onClick={handleSidebarToggle}
              >
                <IoCloseOutline className="text-gray-700 text-2xl lg:text-3xl" />
              </button>
            ) : (
              <button
                className="fixed top-5 left-3 p-2 bg-gray-300 text-black rounded-full z-[10000] focus:outline-none"
                onClick={handleSidebarToggle}
              >
                <IoMenu className="text-gray-800 text-2xl lg:text-3xl" />
              </button>
            )}
          </div>
          <select
            value={languageRef.current}
            onChange={onLanguageChange}
            className="h-10 text-base Geist outline-none border-solid border-2 border-gray-400 pl-2 rounded-[5px] w-[220px] mr-4"
          >
            <option value="cpp">C++ GCC17</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java 17</option>
            <option value="python">Python 3.12</option>
            <option value="c">C GCC17</option>
          </select>
        </div>
        <div className="h-[540px] sm:h-[640px] md:h-[720px] w-full flex justify-end lg:pr-4">
          <div className="h-full p-2 border-2 border-gray-400 bg-[#0A001F] rounded-[7px] w-full xl:w-[90%]">
            <Editor
              language={languageRef.current}
              value={code}
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={(code) => {
                codeRef.current = code;
              }}
              onChange={(value) => setCode(value)}
            />
          </div>
        </div>
      </div>
      <div className="w-full xl:w-[30%] p-2 xl:p-4">
        <div className="h-16 xl:h-20 mb-2 w-full flex items-center justify-end xl:justify-start">
          <button
            onClick={clearCode}
            className="h-10 text-xl transition duration-200 ease-in-out hover:text-white bg-[white] hover:bg-[#10162f] Apercu-Regular outline-none border-solid border-2 border-gray-400 rounded-[5px] w-[100px] mr-4"
          >
            Clear
          </button>
          <button
            onClick={runCode}
            className="h-10 text-base text-white transition duration-200 ease-in-out bg-[#1e1e1e] hover:text-white hover:bg-[#2a2a2a] Apercu-Regular outline-none border-solid  rounded-[5px] w-[100px] mr-4"
          >
            Run
          </button>
        </div>
        <div className="h-[540px] sm:h-[640px] md:h-[720px] w-full flex flex-col items-start xl:justify-between ">
          <textarea
            id="input"
            placeholder="Enter your input here"
            onChange={(e) => setInput(e.target.value)}
            className="p-3 Fira-Code Codemirror whitespace-pre-wrap resize-none overflow-y-auto text-xl h-[180px] xl:h-[280px] w-full border-2 border-gray-400 rounded-[5px] bg-gray-100 mb-4 xl:mb-0"
          ></textarea>
          <div
            id="output"
            className="h-[320px] Fira-Code whitespace-pre-wrap overflow-y-auto leading-7 xl:h-[420px] text-xl w-full border-2 border-gray-400 rounded-[5px] bg-gray-100 p-2"
          >
            {isLoading ? (
              <div className="loader-container p-0">
                <div className="loader"></div>
              </div>
            ) : (
              <div className="p-2 py-0">{output}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
