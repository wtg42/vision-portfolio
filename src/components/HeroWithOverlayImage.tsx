import React from "react";
import coverImage from "../assets/images/DSC_1587.jpg?url";

/**
 * 首頁介紹畫面元件
 */
const HeroWithOverlayImage = () => {
  const handleClick = () => {
    console.log("Button clicked!")
    location.href = "/gallery";
  }

  return (
    <div
      className="hero min-h-screen"
      style={{
        backgroundImage: `url(${coverImage})`,
        backgroundSize: "cover",
      }}
    >
      <div className="hero-overlay"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">Vision Portfolio</h1>
          <p className="mb-5">
            歡迎來到我的個人攝影集。這裡記錄了我鏡頭下的世界。
          </p>
          <button
            onClick={handleClick}
            className="btn btn-primary"
          >
              Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroWithOverlayImage;
