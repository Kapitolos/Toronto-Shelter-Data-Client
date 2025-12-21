import React from "react";
import './App.css';

function MapLegend() {
    return (
        <div className="MapLegend">
            <h4 className="MapLegend-title">Map Legend</h4>
            <div className="MapLegend-items">
                <div className="MapLegend-item">
                    <div className="MapLegend-marker blue"></div>
                    <span>Has Available Beds</span>
                </div>
                <div className="MapLegend-item">
                    <div className="MapLegend-marker red"></div>
                    <span>Full (No Beds Available)</span>
                </div>
            </div>
        </div>
    );
}

export default MapLegend;


