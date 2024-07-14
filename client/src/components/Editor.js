import React, { useEffect, useRef } from "react";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/clike/clike";
import "codemirror/mode/python/python";
import "codemirror/theme/idea.css";
import "codemirror/theme/dracula.css";
import "codemirror/theme/night.css";
import "codemirror/theme/monokai.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import { ACTIONS } from "../Actions";
import "../fonts/stylesheet.css";

function Editor({ socketRef, roomId, onCodeChange, value }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "night",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          value: value,
          indentUnit: 4,
        }
      );
      editorRef.current = editor;

      editor.setSize(null, "100%");
      editor.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });

      editor.setValue(value); // Set the initial value here
    };

    init();
  }, [value]);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket) {
      const handleCodeChange = ({ code }) => {
        if (editorRef.current && code !== null && code !== editorRef.current.getValue()) {
          const currentPosition = editorRef.current.getCursor();
          editorRef.current.setValue(code);
          editorRef.current.setCursor(currentPosition);
          onCodeChange(code);
        }
      };

      socket.on(ACTIONS.CODE_CHANGE, handleCodeChange);

      return () => {
        socket.off(ACTIONS.CODE_CHANGE, handleCodeChange);
      };
    }
  }, [socketRef.current, onCodeChange]);

  
  return (
    <div className="h-full text-xl overflow-hidden">
      <textarea id="realtimeEditor" className="Codemirror"></textarea>
    </div>
  );
}

export default Editor;
