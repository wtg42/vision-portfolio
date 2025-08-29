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
      {/* 半透明漸層覆蓋，提升文字可讀性 */}
      <div className="hero-overlay bg-gradient-to-b from-black/40 to-black/80"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-lg">
          <h1 className="mb-5 text-5xl font-bold drop-shadow">Vision Portfolio</h1>
          <p className="mb-5">
            歡迎來到我的個人攝影集。這裡記錄了我鏡頭下的世界。
          </p>
          <button onClick={handleClick} className="btn btn-primary">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroWithOverlayImage;
