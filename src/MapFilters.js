import React, { useState } from "react";
import './App.css';

function MapFilters({ 
    sectors, 
    selectedSector, 
    onSectorChange,
    availabilityFilter,
    onAvailabilityChange,
    searchQuery,
    onSearchChange,
    programAreas,
    selectedProgram,
    onProgramChange,
    minCapacity,
    onMinCapacityChange,
    maxCapacity,
    onMaxCapacityChange,
    minAvailableBeds,
    onMinAvailableBedsChange,
    onResetFilters,
    count,
    totalCount,
    onFetchCoordinates,
    isFetchingCoordinates,
    fetchMessage,
    fetchError
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="MapFilters">
            <div className="MapFilters-header" onClick={() => setIsExpanded(!isExpanded)}>
                <h3 className="MapFilters-title">Filter Shelters</h3>
                <div className="MapFilters-header-buttons" onClick={(e) => e.stopPropagation()}>
                    <button 
                        className="MapFilters-toggle"
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? "Collapse filters" : "Expand filters"}
                    >
                        {isExpanded ? '▼' : '▶'}
                    </button>
                    {isExpanded && (
                        <button 
                            className="MapFilters-reset"
                            onClick={onResetFilters}
                            title="Reset all filters"
                        >
                            Reset All
                        </button>
                    )}
                </div>
            </div>
            
            {isExpanded && (
                <div className="MapFilters-content">

            {/* Sector Filter - Own Row */}
            {sectors && sectors.length > 0 && (
                <div className="MapFilters-row">
                    <div className="MapFilters-group MapFilters-group-full">
                        <label htmlFor="sector-select" className="MapFilters-label">
                            Sector:
                        </label>
                        <select
                            id="sector-select"
                            value={selectedSector}
                            onChange={(e) => onSectorChange(e.target.value)}
                            className="MapFilters-select"
                        >
                            <option value="">All Sectors</option>
                            {sectors.map((sector) => (
                                <option key={sector} value={sector}>
                                    {sector}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Program Area Filter - Own Row */}
            {programAreas && programAreas.length > 0 && (
                <div className="MapFilters-row">
                    <div className="MapFilters-group MapFilters-group-full">
                        <label htmlFor="program-select" className="MapFilters-label">
                            Program:
                        </label>
                        <select
                            id="program-select"
                            value={selectedProgram}
                            onChange={(e) => onProgramChange(e.target.value)}
                            className="MapFilters-select"
                        >
                            <option value="">All Programs</option>
                            {programAreas.map((program) => (
                                <option key={program} value={program}>
                                    {program}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Availability Filter - Own Row */}
            <div className="MapFilters-row">
                <div className="MapFilters-group MapFilters-group-full">
                    <label htmlFor="availability-select" className="MapFilters-label">
                        Availability:
                    </label>
                    <select
                        id="availability-select"
                        value={availabilityFilter}
                        onChange={(e) => onAvailabilityChange(e.target.value)}
                        className="MapFilters-select"
                    >
                        <option value="all">All Shelters</option>
                        <option value="available">Has Available Beds</option>
                        <option value="full">Full (No Beds Available)</option>
                    </select>
                </div>
            </div>

            {/* Min Capacity - Own Row */}
            <div className="MapFilters-row">
                <div className="MapFilters-group MapFilters-group-full">
                    <label htmlFor="min-capacity" className="MapFilters-label">
                        Min Capacity:
                    </label>
                    <input
                        id="min-capacity"
                        type="number"
                        min="0"
                        placeholder="Any"
                        value={minCapacity || ''}
                        onChange={(e) => onMinCapacityChange(e.target.value ? parseInt(e.target.value) : '')}
                        className="MapFilters-number"
                    />
                </div>
            </div>

            {/* Max Capacity - Own Row */}
            <div className="MapFilters-row">
                <div className="MapFilters-group MapFilters-group-full">
                    <label htmlFor="max-capacity" className="MapFilters-label">
                        Max Capacity:
                    </label>
                    <input
                        id="max-capacity"
                        type="number"
                        min="0"
                        placeholder="Any"
                        value={maxCapacity || ''}
                        onChange={(e) => onMaxCapacityChange(e.target.value ? parseInt(e.target.value) : '')}
                        className="MapFilters-number"
                    />
                </div>
            </div>

            {/* Min Available Beds - Own Row */}
            <div className="MapFilters-row">
                <div className="MapFilters-group MapFilters-group-full">
                    <label htmlFor="min-available-beds" className="MapFilters-label">
                        Min Available Beds:
                    </label>
                    <input
                        id="min-available-beds"
                        type="number"
                        min="0"
                        placeholder="Any"
                        value={minAvailableBeds || ''}
                        onChange={(e) => onMinAvailableBedsChange(e.target.value ? parseInt(e.target.value) : '')}
                        className="MapFilters-number"
                    />
                </div>
            </div>

            {/* Search Bar - Own Row */}
            <div className="MapFilters-row">
                <div className="MapFilters-group MapFilters-search-group MapFilters-group-full">
                    <label htmlFor="search-input" className="MapFilters-label">
                        Search:
                    </label>
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Search name, sector, or program"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="MapFilters-search"
                    />
                    {searchQuery && (
                        <button
                            className="MapFilters-clear"
                            onClick={() => onSearchChange('')}
                            title="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

                </div>
            )}
            
        </div>
    );
}

export default MapFilters;

