import React from "react";
import './App.css';

function MapStatistics({ shelters }) {
    if (!shelters || shelters.length === 0) {
        return null;
    }

    // Helper to safely parse numbers (handles strings and nulls)
    const parseNumber = (value) => {
        if (value === null || value === undefined || value === '') return 0;
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? 0 : num;
    };

    // Calculate statistics from the filtered shelters
    // Use OCCUPIED_BEDS directly from API, not calculated
    const totalOccupied = shelters.reduce((sum, s) => {
        return sum + parseNumber(s.occupied);
    }, 0);
    
    const totalAvailable = shelters.reduce((sum, s) => {
        return sum + parseNumber(s.unoccupied);
    }, 0);
    
    const totalCapacity = shelters.reduce((sum, s) => {
        return sum + parseNumber(s.capacity);
    }, 0);
    
    const occupancyRate = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : '0.0';
    const fullShelters = shelters.filter(s => parseNumber(s.unoccupied) === 0).length;

    return (
        <div className="MapStatistics">
            <h4 className="MapStatistics-title">Statistics</h4>
            <div className="MapStatistics-grid">
                <div className="MapStatistics-item">
                    <div className="MapStatistics-value">{shelters.length}</div>
                    <div className="MapStatistics-label">Total Shelters</div>
                </div>
                <div className="MapStatistics-item">
                    <div className="MapStatistics-value">{totalOccupied}</div>
                    <div className="MapStatistics-label">Occupied Beds</div>
                </div>
                <div className="MapStatistics-item">
                    <div className="MapStatistics-value">{totalAvailable}</div>
                    <div className="MapStatistics-label">Available Beds</div>
                </div>
                <div className="MapStatistics-item">
                    <div className="MapStatistics-value">{occupancyRate}%</div>
                    <div className="MapStatistics-label">Occupancy Rate</div>
                </div>
                <div className="MapStatistics-item">
                    <div className="MapStatistics-value">{fullShelters}</div>
                    <div className="MapStatistics-label">Full Shelters</div>
                </div>
            </div>
        </div>
    );
}

export default MapStatistics;

