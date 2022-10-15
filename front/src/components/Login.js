import React from "react"
import {useState} from "react";
import {useNavigate, Navigate} from "react-router-dom"
import {getCookie} from "../utils/cookies.js"

const BACKEND_URL = ("http://localhost:3001");

const Login = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  if(getCookie("a") !== "") {
    return <Navigate replace={true} to="/home"/> 
  }

  const clickSignIn = () => {
    console.log("sign in clicked!");
    console.log(user);
    console.log(pass);
    fetch(BACKEND_URL + "/login", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        user: user,
        pass: pass
      })
    }).then(res => res.json())
    .then(data => {
      if(data.result === "success") {
        document.cookie = `a=${data.auth}`
        document.cookie = `user=${user}`;
        navigate("/home");
      } else {
        alert("wrong username/password");
      }
    });
  }

  return (
    <div className="Login">
      <h3>Login to your account</h3>
      <input type="text" onChange={e => setUser(e.target.value)} placeholder="username"/> 
      <input type="password" onChange={e => setPass(e.target.value)}placeholder="password"/> 
      <button onClick={clickSignIn}>Sign in</button>

      <button>Sign up</button>
    </div>
  );
}

export default Login;
