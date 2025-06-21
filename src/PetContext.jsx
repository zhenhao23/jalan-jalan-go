import React, { createContext, useContext, useState } from "react";

const PetContext = createContext();

export const usePetContext = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error("usePetContext must be used within a PetProvider");
  }
  return context;
};

export const PetProvider = ({ children }) => {
  const [selectedPet, setSelectedPet] = useState({
    name: "Tribal Tiger Cub",
    path: "/assets/Animal/Tribal_Tiger_Cub_0621030339_texture.fbx",
  });

  return (
    <PetContext.Provider value={{ selectedPet, setSelectedPet }}>
      {children}
    </PetContext.Provider>
  );
};
