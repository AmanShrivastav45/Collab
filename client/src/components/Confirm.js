import React from "react";
import "../fonts/stylesheet.css";
import { IoCloseOutline } from "react-icons/io5";

const Confirm = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none">
      <div className="relative w-auto mx-auto max-w-sm">
        {/* Content */}
        <div className="border-0 rounded-lg shadow-xl relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="Geist-semibold flex items-start justify-between p-4 pb-2 border-b border-solid border-gray-300 rounded-t">
            <h3 className="text-2xl">Leave Room?</h3>
            <button
              className=" bg-transparent border-0 text-black text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onCancel}
            >
              <span className="bg-transparent text-black h-6 w-6 text-2xl block outline-none focus:outline-none">
                <IoCloseOutline/>
              </span>
            </button>
          </div>
          {/* Body */}
          <div className="relative p-4 flex-auto">
            <p className="Geist my-2 text-gray-600 text-base leading-relaxed">
              Are you sure you want to leave the room?
            </p>
          </div>
          {/* Footer */}
          <div className="Geist flex items-center justify-end p-2 border-t border-solid border-gray-300 rounded-b">
            <button
              className="text-gray-900  Geist uppercase px-4 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="bg-red-600 text-white active:bg-red-700 Geist uppercase text-sm px-4 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
              type="button"
              onClick={onConfirm}
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirm;
