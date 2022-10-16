import React from "react";
import {useState, useEffect} from "react";
import io from "socket.io-client";
import {getCookie} from "../utils/cookies.js";
import {useNavigate, Navigate} from "react-router-dom";

const BACKEND_URL = ("http://localhost:3001");
const socket = io(BACKEND_URL);

const Home = () => {
  const navigate = useNavigate();

  // not signed in, redirect to sign in page
  if(getCookie("a") === "") {
    return <Navigate replace={true} to="/"/>;
  }

  const signOut = () => {
    document.cookie = "a=; user=;";
    navigate("/");
  };

  return (
    <div className="Home">
      <h2>Welcome to Fancy Chat</h2>
      <button onClick={signOut}>Sign Out</button>
      <Chat username={getCookie("user")}/>
    </div>
  );
};

function Chat({username}) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const addMessage = (data) => {
    setMessages(c => [...c, data]);
  }

  useEffect(() => {
    socket.on("update_feed", data => {
      addMessage(data);
    });



    return () => {
      socket.off("update_feed");
    };
  }, []);

  const sendMessage = async () => {
    if(currentMessage === "") return;

    console.log("attempting to send message");
    const messageData = {
      user: username,
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

  return (
    <div className="Chat">
      <div className="chat-header">
        <h3>Now chatting as {username}</h3>
      </div>
      <div className="chat-body">
        {messages.map((d, index) => {
          return (
            <Message data={d} key={index}/>
          );
        })}
      </div>
      <div className="chat-footer">
        <input type="text" onChange={e => setCurrentMessage(e.target.value)} value={currentMessage} placeholder="Type message here:"/>
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

function Message({data}) {
  return (
    <div className="Message">
      <h5>{data.user}</h5>
      <p>{data.message}</p>
    </div>
  );
}
export default Home;

