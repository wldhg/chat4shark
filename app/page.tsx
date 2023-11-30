"use client";

import { useEffect, useRef, useState } from "react";
import type { MemChatMsg } from "./api/chat/type";
import styles from "./page.module.scss";

export default function ChatPage() {
  const [chatRoom, setChatRoom] = useState<string>("general");
  const [chatRealRoom, setChatRealRoom] = useState<string>("general");
  const [chatName, setChatName] = useState<string>(`user_${Math.floor(Math.random() * 100000)}`);
  const [chatLog, setChatLog] = useState<MemChatMsg[]>([]);
  const chatRoomChangeTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!chatRealRoom) {
      return;
    }

    let lastChatFetchTime = 0;

    setChatLog([]);

    const fetchChatLog = () => {
      fetch(`/api/chat?room=${chatRealRoom}&from=${lastChatFetchTime}`)
      .then((res) => res.json())
      .then((data: {
        msgs: MemChatMsg[]
        time: number
      }) => {
        if (!data.msgs.length) {
          return;
        }
        setChatLog((prev) => {
          const newlist = [...prev, ...data.msgs];
          // filter duplicated messages
          const msgIds = new Set();
          const filtered = [];
          for (const msg of newlist) {
            if (!msgIds.has(msg.id)) {
              msgIds.add(msg.id);
              filtered.push(msg);
            }
          }
          // sort by time
          filtered.sort((a, b) => a.time - b.time);
          return filtered;
        });
        lastChatFetchTime = data.time;
        setTimeout(() => {
          const chatLog = document.getElementById("chat-log");
          if (chatLog) {
            chatLog.scrollTop = chatLog.scrollHeight;
          }
        }, 100);
      });
    };

    const interval = setInterval(() => {
      fetchChatLog();
    }, 500);

    return () => clearInterval(interval);
  }, [chatRealRoom]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2>AIoT Chat</h2>
        <p>세상에서 제일 안전한 보안 채팅! 마음껏 개인정보를 공유하세요.</p>
      </div>
      <div className={styles.form}>
        <div className={styles.left}>
          <h3>채팅방 설정</h3>
          <label>
            <span>채팅방</span>
            <input type="text" value={chatRoom} onChange={(e) => {
              setChatRoom(e.target.value);
              if (chatRoomChangeTimeout.current) {
                clearTimeout(chatRoomChangeTimeout.current);
              }
              chatRoomChangeTimeout.current = setTimeout(() => {
                setChatRealRoom(e.target.value);
              }, 500);
            }} />
          </label>
          <label>
            <span>닉네임</span>
            <input type="text" value={chatName} onChange={(e) => setChatName(e.target.value)} />
          </label>
        </div>
        <div className={styles.chat}>
          <div className={styles.chatLog} id="chat-log">
            {chatLog.map((msg, i) => (
              <div key={i} className={styles.chatMsg}>
                <span className={styles.chatName}>{msg.name}</span>
                <span className={styles.chatText}>{msg.message}</span>
              </div>
            ))}
          </div>
            <form className={styles.chatInput} onSubmit={(e) => {
              e.preventDefault();
              const input = document.getElementById("chat-input") as HTMLInputElement;
              const msg = input.value;
              input.value = "";
              fetch(`/api/chat?room=${chatRealRoom}&name=${chatName}`, { method: "POST", body: msg });
            }}>
              <input type="text" placeholder="메시지를 입력하세요" id="chat-input" />
              <button type="submit">전송</button>
            </form>

        </div>
      </div>
    </div>
  )
}
