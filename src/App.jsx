import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FoodProvider } from "./FoodContext.jsx";
import Map from "./Map";
import Animal from "./Animal";
import Bagpack from "./Bagpack";
import Food from "./Food";
import "./App.css";

function App() {
  return (
    <FoodProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Map />} />
          <Route path="/animal" element={<Animal />} />
          <Route path="/bagpack" element={<Bagpack />} />
          <Route path="/food" element={<Food />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </Router>
    </FoodProvider>
  );
}

export default App;
