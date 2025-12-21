import React from "react";
import './App.css';

function SectorFilter({ sectors, selectedSector, onSectorChange, count, totalCount }) {
    if (!sectors || sectors.length === 0) {
        return null;
    }

    return (
        <div className="SectorFilter">
            <label htmlFor="sector-select" className="SectorFilter-label">
                Filter by Sector:
            </label>
            <select
                id="sector-select"
                value={selectedSector}
                onChange={(e) => onSectorChange(e.target.value)}
                className="SectorFilter-select"
            >
                <option value="">All Sectors</option>
                {sectors.map((sector) => (
                    <option key={sector} value={sector}>
                        {sector}
                    </option>
                ))}
            </select>
            {count !== undefined && totalCount !== undefined && (
                <span className="SectorFilter-count">
                    Showing {count} of {totalCount} shelters
                    {count < totalCount && (
                        <span className="SectorFilter-note"> ({totalCount - count} without coordinates)</span>
                    )}
                </span>
            )}
        </div>
    );
}

export default SectorFilter;

