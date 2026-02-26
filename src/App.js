import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import InteractiveMap from "./InteractiveMap";
import ShelterHistory from "./ShelterHistory";
import './App.css';

function App() {
    return (
        <Router basename={process.env.PUBLIC_URL || ''}>
            <div className="App">
                <nav className="Navbar">
                    <img width="32" height="32" src="https://img.icons8.com/office/40/combo-chart.png" alt="combo-chart" style={{marginRight: '10px'}} />
                    <ul>
                        <li><Link to="/interactive-map">Interactive Map</Link></li>
                        <li><Link to="/shelter-history">Historical Data</Link></li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/interactive-map" element={<InteractiveMap />} />
                    <Route path="/shelter-history" element={<ShelterHistory />} />
                    <Route path="/" element={<Navigate to="/interactive-map" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
