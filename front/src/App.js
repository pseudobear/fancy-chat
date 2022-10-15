import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import "./App.css";
import io from "socket.io-client";
import Login from "./components/Login.js";
import Home from "./components/Home.js";

const BACKEND_URL = ("http://localhost:3001");
const socket = io(BACKEND_URL)

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route path="home" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
