import "../styles/login.css"
import React from "react"
import vanGogh from "../assets/vanGogh.png"
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
      } else if(data.result === "fail") {
        alert("wrong username/password");
      } else {
        alert("backend error");
      }
    });
  }

  return (
    <div>
    <div className="lContainer">
      <h1> Welcome to Fancy Chat </h1>
      <div className="login-image">
        <img src={vanGogh} width="300" style={{position: 'relative'}} alt="login"/>
      </div>
      <div className="Login lItem">
        <div className="loginForm">
          <h3>Login</h3>
          <div className="login-form">
            <div className="field">
              <input className="" type="text" onChange={e => setUser(e.target.value)} placeholder="username"/> 
            </div>
            <div className="field">
              <input className="" type="password" onChange={e => setPass(e.target.value)} placeholder="password"/> 
            </div>
            <button className="button-66 login-form-button"  onClick={clickSignIn}>Sign in</button>
            <button className="button-55 login-form-forgot" >Sign up</button>
          </div>
        </div>
      </div>
      <div className="footer">
        <a href="https://lovepik.com/images/png-artist.html">Artist Png vectors by Lovepik.com</a>
      </div>
    </div>
    </div>
  );
}

export default Login;
