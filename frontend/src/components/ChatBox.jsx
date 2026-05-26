import { useState, useEffect } from "react";
import io from "socket.io-client";
import { getSocketBaseUrl } from "../services/api";

const socket = io(getSocketBaseUrl());

export default function ChatBox({ userId, receiverId }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    socket.on("chatMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });
  }, []);

  const sendMessage = () => {
    socket.emit("chatMessage", { sender_id: userId, receiver_id: receiverId, message: msg });
    setMsg("");
  };

  return (
    <div className="border p-4 rounded">
      <div className="h-40 overflow-y-scroll mb-2">
        {messages.map((m, i) => <p key={i}><b>{m.sender_id}:</b> {m.message}</p>)}
      </div>
      <input className="border p-2 w-full" value={msg} onChange={(e) => setMsg(e.target.value)} />
      <button className="bg-blue-500 text-white px-4 py-2 mt-2" onClick={sendMessage}>Send</button>
    </div>
  );
}
