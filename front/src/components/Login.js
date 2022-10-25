import styles from "../styles/login.module.css"
import React from "react"
import vanGogh from "../assets/vanGogh.png"
import {useState} from "react";
import {useNavigate, Navigate} from "react-router-dom"
import {getCookie} from "../utils/cookies.js"
import { toast } from "react-custom-alert"

const BACKEND_URL = ("http://localhost:3001");

const Login = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const alertFailedLogin = () => toast.error("Wrong username/password.");
  const alertBackendError = () => toast.error("Sorry, we are currently having issues with our backend service.");
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
        alertFailedLogin();
      } else {
        alertBackendError();
      }
    });
  }

  return (
    <div>
    <div className={styles.lContainer}>
      <h1> Welcome to Fancy Chat </h1>
      <div className={styles.loginImage}>
        <img src={vanGogh} width="300" style={{position: 'relative'}} alt="login"/>
      </div>
      <div className={`${styles.Login} ${styles.lItem}`}>
        <div className={styles.loginForm}>
          <h3>Login</h3>
          <div className={styles.login_form}>
            <div className={styles.field}>
              <input type="text" onChange={e => setUser(e.target.value)} placeholder="username"/> 
            </div>
            <div className={styles.field}>
              <input type="password" onChange={e => setPass(e.target.value)} placeholder="password"/> 
            </div>
            <button className={`${styles.button_66} ${styles.login_form_button}`} onClick={clickSignIn}>Sign in</button>
            <button className={`${styles.button_55} ${styles.login_form_forgot}`}>Sign up</button>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <a href="https://lovepik.com/images/png-artist.html">Artist Png vectors by Lovepik.com</a>
      </div>
    </div>
    </div>
  );
}

export default Login;
