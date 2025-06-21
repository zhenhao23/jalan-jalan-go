import React, { createContext, useContext, useState } from "react";

const FoodContext = createContext();

export const useFoodContext = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error("useFoodContext must be used within a FoodProvider");
  }
  return context;
};

export const FoodProvider = ({ children }) => {
  const [selectedFood, setSelectedFood] = useState({
    name: "Nasi Lemak",
    path: "/assets/Food/Nasi_Lemak_Dish_0621050817_texture.fbx",
  });

  return (
    <FoodContext.Provider value={{ selectedFood, setSelectedFood }}>
      {children}
    </FoodContext.Provider>
  );
};
