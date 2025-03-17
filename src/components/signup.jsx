import React, { useState, useEffect } from "react";
import "../App.css";
import { collection, addDoc, getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  auth,
  signInWithGoogle,
  registerWithEmailAndPassword,
} from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useNavigate, redirect } from "react-router-dom";

const UserInfo = (props) => {
  const userDetails = [props.email, props.username];

  return userDetails;
};

const AddAcc = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setName] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  const register = () => {
    if (!username) alert("Please enter name");
    registerWithEmailAndPassword(username, email, password);
  };

  useEffect(() => {
    if (loading) return;
    if (user) {
      sessionStorage.setItem("userID", user.uid);
      navigate("/todolist", { replace: true });
    }
  });

  return (
    <>
      <div className="fields">
        <label for="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="johnDoe67"
          value={username}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="fields">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          placeholder="example@gmail.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="fields">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" className="submit" onClick={register}>
        Register
      </button>

      <button className="login__btn login__google" onClick={signInWithGoogle}>
        Login with Google
      </button>
    </>
  );
};

export default AddAcc;
