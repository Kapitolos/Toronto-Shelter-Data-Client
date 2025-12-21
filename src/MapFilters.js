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
    onResetFilters,
    count,
    totalCount,
    onFetchCoordinates,
    isFetchingCoordinates,
    fetchMessage,
    fetchError
}) {
    const [isExpanded, setIsExpanded] = useState(false);

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

            <div className="MapFilters-row">
                {/* Sector Filter */}
                {sectors && sectors.length > 0 && (
                    <div className="MapFilters-group">
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
                )}

                {/* Program Area Filter */}
                {programAreas && programAreas.length > 0 && (
                    <div className="MapFilters-group">
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
                )}

                {/* Availability Filter */}
                <div className="MapFilters-group">
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

            <div className="MapFilters-row">
                {/* Capacity Range */}
                <div className="MapFilters-group">
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
                <div className="MapFilters-group">
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

            {/* Search Bar */}
            <div className="MapFilters-row">
                <div className="MapFilters-group MapFilters-search-group">
                    <label htmlFor="search-input" className="MapFilters-label">
                        Search:
                    </label>
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Search by shelter name or address..."
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

                {/* Count Display */}
                {count !== undefined && totalCount !== undefined && (
                    <div className="MapFilters-count">
                        Showing {count} of {totalCount} shelters
                        {count < totalCount && (
                            <span className="MapFilters-note"> ({totalCount - count} hidden by filters)</span>
                        )}
                    </div>
                )}

                {/* Coordinate Fetch Button */}
                {onFetchCoordinates && (
                    <div className="MapFilters-coordinate-fetch">
                        <button 
                            className="MapFilters-fetch-button"
                            onClick={onFetchCoordinates}
                            disabled={isFetchingCoordinates}
                        >
                            {isFetchingCoordinates ? "🔄 Fetching Coordinates..." : "📍 Fetch Missing Coordinates"}
                        </button>
                        {fetchMessage && (
                            <div className="MapFilters-fetch-message success">
                                {fetchMessage}
                            </div>
                        )}
                        {fetchError && (
                            <div className="MapFilters-fetch-message error">
                                ❌ {fetchError}
                            </div>
                        )}
                    </div>
                )}
                </div>
            )}
            
            {/* Show minimal count when collapsed - just a small indicator */}
            {!isExpanded && count !== undefined && totalCount !== undefined && count < totalCount && (
                <div className="MapFilters-count-collapsed">
                    {count}/{totalCount}
                </div>
            )}
        </div>
    );
}

export default MapFilters;

