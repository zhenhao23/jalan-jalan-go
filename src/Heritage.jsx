import React from "react";
import "./Heritage.css";
import merdekaSqareImg from "./assets/merdeka-square.jpg";

function Heritage() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="heritage-container">
      <button className="back-btn" onClick={handleBack}>
        &#8249;
      </button>

      <h1 className="heritage-title">Merdeka Square</h1>

      <div className="heritage-image-container">
        <img
          src={merdekaSqareImg} // Use the imported image
          alt="Merdeka Square"
          className="heritage-image"
        />
      </div>

      <div className="heritage-description">
        <p>
          Merdeka Square is a historic square located in the heart of Kuala
          Lumpur, Malaysia. Originally known as the Selangor Club Padang, it was
          renamed after Malaysia's independence in 1957. The square is
          surrounded by important colonial buildings including the Sultan Abdul
          Samad Building and serves as a significant landmark representing
          Malaysia's journey to independence.
        </p>
      </div>

      <button className="collect-rewards-btn">Collect Rewards</button>
    </div>
  );
}

export default Heritage;
