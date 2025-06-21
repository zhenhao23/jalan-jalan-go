import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FoodProvider } from "./FoodContext.jsx";
import { PetProvider } from "./PetContext.jsx";
import Map from "./Map";
import Animal from "./Animal";
import Bagpack from "./Bagpack";
import Food from "./Food";
import Pet from "./Pet";
import "./App.css";

function App() {
  return (
    <FoodProvider>
      <PetProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Map />} />
            <Route path="/animal" element={<Animal />} />
            <Route path="/bagpack" element={<Bagpack />} />
            <Route path="/food" element={<Food />} />
            <Route path="/map" element={<Map />} />
            <Route path="/pet" element={<Pet />} />
          </Routes>
        </Router>
      </PetProvider>
    </FoodProvider>
  );
}

export default App;
