import { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import AddAcc from "./components/signup.jsx";
import {
  auth,
  logInWithEmailAndPassword,
  signInWithGoogle,
  logout,
} from "./firebase";
import Todolist from "./components/todolist.jsx";
import { useAuthState } from "react-firebase-hooks/auth";

const SignupButt = () => {
  const [user, loading, error] = useAuthState(auth);
  if (!user) {
    return (
      <>
        <Link to="/signup">
          <button className="logsign">Sign Up</button>
        </Link>
      </>
    );
  } else {
    return;
  }
};

function Home() {
  return (
    <>
      <div className="title">
        <p id="title">BOB TO/DO/LIST</p>
      </div>
      <div className={"options" + " " + "bodygrid"}>
        <Link to="/login">
          <button className="logsign">Log In</button>
        </Link>

        <SignupButt />

        <button className="logsign" onClick={logout}>
          Log Out
        </button>
      </div>
    </>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) {
      // maybe trigger a loading screen
      return;
    }
    if (user) {
      sessionStorage.setItem("userID", user.uid);
      navigate("/todolist");
      return;
    }
  }, [user, loading, navigate]);
  return (
    <>
      <p>
        <Link to="/">{`<<< BACK`}</Link>
      </p>
      <div className="title">
        <p>LOG IN</p>
      </div>
      <div className={"bodygrid2"}>
        <div className="lgsu">
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
              value={password}
              name="password"
              placeholder="enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="submit"
            onClick={() => logInWithEmailAndPassword(email, password)}
          >
            Log In
          </button>

          <p className="here">
            Don't have an account yet? Click{" "}
            <Link to="/signup">{<u>here</u>}</Link>
            to Sign Up!
          </p>
          <button
            className="login__btn login__google"
            onClick={signInWithGoogle}
          >
            Login with Google
          </button>
        </div>
      </div>
    </>
  );
}

function Signup() {
  return (
    <>
      <p>
        <Link to="/">{`<<< BACK`}</Link>
      </p>

      <div className="title">
        <p>SIGN UP</p>
      </div>

      <div className={"bodygrid2"}>
        <div className="lgsu">
          <AddAcc />
        </div>
      </div>
    </>
  );
}

function App() {
  // const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="todolist" element={<Todolist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
