import React from "react";

const SignIn = () => {
  React.useEffect(() => {
    console.log("after mounteded....");
  });

  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="btn btn-error"
      >
        Signin
      </button>
    </>
  );
};

export default SignIn;
