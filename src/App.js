import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import ShelterDashboard from "./ShelterDashboard";
import InteractiveMap from "./InteractiveMap"; // Placeholder for the map tab
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <nav className="Navbar">
                    <img width="32" height="32" src="https://img.icons8.com/office/40/combo-chart.png" alt="combo-chart" style={{marginRight: '10px'}} />
                    <ul>
                        <li><Link to="/citywide-data">Citywide Data</Link></li>
                        <li><Link to="/interactive-map">Interactive Map</Link></li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/citywide-data" element={<ShelterDashboard />} />
                    <Route path="/interactive-map" element={<InteractiveMap />} />
                    <Route path="/" element={<Navigate to="/interactive-map" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
