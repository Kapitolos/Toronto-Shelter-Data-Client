import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ShelterDashboard from "./ShelterDashboard";
import LandingPage from "./LandingPage";
import InteractiveMap from "./InteractiveMap"; // Placeholder for the map tab
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <nav className="Navbar">
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/citywide-data">Citywide Data</Link></li>
                        <li><Link to="/interactive-map">Interactive Map</Link></li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/citywide-data" element={<ShelterDashboard />} />
                    <Route path="/interactive-map" element={<InteractiveMap />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
