import styles from "../styles/home.module.css";
import ScrollToBottom from 'react-scroll-to-bottom';
import React from "react";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import { getCookie } from "../utils/cookies.js";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-custom-alert"
import { sleep } from "../utils/sleep.js";

const BACKEND_URL = ("http://localhost:3001");
const socket = io(BACKEND_URL);

const Home = () => {
  const navigate = useNavigate();
  const alertLoggedOut = () => toast.info("Successfully logged out.");

  // not signed in, redirect to sign in page
  if(getCookie("a") === "") {
    return <Navigate replace={true} to="/"/>;
  }

  const signOut = () => {
    document.cookie = "a=; user=;";
    alertLoggedOut();
    navigate("/");
  };

  return (
    <div className={styles.Home}>
      <div>
        <h2>Welcome to Fancy Chat</h2>
        <button onClick={signOut}>Sign Out</button>
      </div>
      <Chat username={getCookie("user")}/>
    </div>
  );
};

function Chat({username}) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const alertMisspelledMessage = () => toast.warning("Please correct your spelling and try again.");
  const alertBackendError = () => toast.error("Sorry, we are currently having issues with our backend service.");

  const addMessage = (data) => {
    setMessages(c => [...c, data]);
  }

  const sendMessage = async () => {
    if(currentMessage === "") return;

    console.log("attempting to send message");
    const messageData = {
      user: username,
      auth: getCookie("a"),
      time: Date.now(),
      message: currentMessage
    };

    try {
      setCurrentMessage("");
      await socket.emit("send_message", messageData);
    } catch(e) {
      console.log(e);
    }
  }

  const push20Messages = async () => {
    console.log("loading in initial messages...");
    let failure = true;
    for(let i = 0; (i < 5 && failure); i++) {
      await fetch(BACKEND_URL + "/messages/get20", {
        method: "GET"
      }).then(res => res.json()).then(data => {
        for(let i = data.length - 1; i >=0; i--) {
          addMessage(data[i]);
        }
        failure = false; // break loop
        i = 6;
      }).catch(e => {
        console.error(e);
        alertBackendError();
      });
      await sleep(2000);
    }
    if(failure) {
      console.error("couldn't obtain messages after 5 retries");
    }
  }

  useEffect(() => {
    socket.on("update_feed", data => {
      addMessage(data);
      if(messages.length > 40) {
        console.log("removing message, too many in state");
        console.log(messages.shift());
      }
    });
    socket.on("bad_message", data => {
      alertMisspelledMessage();
    });

    push20Messages();

    return () => {
      socket.off("update_feed");
      setMessages([]);
    };
  }, []);

  return (
    <div className={styles.Chat}>
      <div className={styles.chat_header}>
        <h3>Now chatting as {username}</h3>
      </div>
      <ScrollToBottom className={styles.chat_body}>
        {messages.map((d, index) => {
          return (
            <Message data={d} key={index}/>
          );
        })}
      </ScrollToBottom>
      <div className={styles.chat_footer}>
        <div className={styles.field}>
          <input type="text" onChange={e => setCurrentMessage(e.target.value)} 
            onKeyDown={e => e.key === "Enter" && sendMessage()} value={currentMessage} placeholder="Type message here:"/>
        </div>
        <button className={styles.button_48} onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

function Message({data}) {
  return (
    <div className={styles.Message}>
      <h5>{data.user}</h5>
      <p>{data.message}</p>
    </div>
  );
}
export default Home;

