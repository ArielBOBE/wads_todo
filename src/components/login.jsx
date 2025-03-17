import "../App.css";

const CheckAcc = () => {
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
              type="text"
              id="email"
              name="email"
              placeholder="example@gmail.com"
            />
          </div>
          <div className="fields">
            <label for="password">Password</label>
            <input
              type="text"
              id="password"
              name="password"
              placeholder="enter your password"
            />
          </div>
          <button type="submit" className="submit">
            Submit
          </button>
          <p className="here">
            Don't have an account yet? Click{" "}
            <Link to="/signup">{<u>here</u>}</Link>
            to Sign Up!
          </p>
        </div>
      </div>
    </>
  );
};

export default CheckAcc;
