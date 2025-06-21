import React from "react";
import "./Heritage.css";

function Heritage() {
  return (
    <div className="heritage-container">
      <h1 className="heritage-title">Merdeka Square</h1>

      <div className="heritage-image-container">
        <img
          src="/assets/merdeka-square.jpg"
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
