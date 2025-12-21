import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import shelterCoordinates from "./updated_shelters.json"; // Import coordinates JSON
import MapFilters from "./MapFilters";
import MapLegend from "./MapLegend";
import MapStatistics from "./MapStatistics";

// Removed auto-zoom component - map stays centered on downtown Toronto

function InteractiveMap() {
    const [shelterOccupancy, setShelterOccupancy] = useState([]);
    const [selectedSector, setSelectedSector] = useState("");
    const [availabilityFilter, setAvailabilityFilter] = useState("all"); // "all", "available", "full"
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProgram, setSelectedProgram] = useState("");
    const [minCapacity, setMinCapacity] = useState("");
    const [maxCapacity, setMaxCapacity] = useState("");
    const [isFetchingCoordinates, setIsFetchingCoordinates] = useState(false);
    const [fetchMessage, setFetchMessage] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3001/api/shelter-dashboard")
            .then(response => response.json())
            .then(data => {
                if (!data.data || !Array.isArray(data.data)) {
                    console.error("❌ Unexpected data format:", data);
                    return;
                }

                const occupancyData = data.data[0]; // Extract shelter array
                setShelterOccupancy(occupancyData);
                
                // Debug: Log sample data to see structure
                if (occupancyData && occupancyData.length > 0) {
                    console.log("📊 Sample shelter data:", {
                        name: occupancyData[0].LOCATION_NAME,
                        address: occupancyData[0].LOCATION_ADDRESS
                    });
                    console.log("📊 Total shelters from API:", occupancyData.length);
                    console.log("📊 Total coordinates in file:", shelterCoordinates.length);
                }
            })
            .catch(error => console.error("Error fetching shelter data:", error));
    }, []);

    // Helper function to parse numeric values from API (handles strings, null, undefined)
    // Use useCallback to ensure stable reference for useMemo dependencies
    const parseNumber = useCallback((value) => {
        if (value == null || value === "") return 0;
        const parsed = typeof value === "string" ? parseFloat(value) : Number(value);
        return isNaN(parsed) ? 0 : Math.max(0, parsed); // Ensure non-negative
    }, []);

    // Function to match shelters with coordinates
    const getShelterWithCoordinates = (shelter) => {
        // Skip shelters without names
        if (!shelter.LOCATION_NAME) {
            return null;
        }

        // For shelters without addresses, try to match by name only
        if (!shelter.LOCATION_ADDRESS) {
            // Try exact name match first
            let match = shelterCoordinates.find(
                (coord) => coord.name && 
                coord.name.toLowerCase().trim() === shelter.LOCATION_NAME.toLowerCase().trim()
            );

            // If no exact match, try partial name matching
            if (!match) {
                const shelterNameLower = shelter.LOCATION_NAME.toLowerCase().trim();
                match = shelterCoordinates.find(
                    (coord) => {
                        if (!coord.name) return false;
                        const coordNameLower = coord.name.toLowerCase().trim();
                        // Check if either name contains the other (for variations)
                        return coordNameLower.includes(shelterNameLower) || 
                               shelterNameLower.includes(coordNameLower);
                    }
                );
            }

            if (match && match.latitude && match.longitude) {
                return {
                    name: shelter.LOCATION_NAME,
                    address: shelter.LOCATION_ADDRESS || "Address not available",
                    coordinates: [match.latitude, match.longitude],
                    sector: shelter.SECTOR,
                    capacity: parseNumber(shelter.CAPACITY_ACTUAL_BED),
                    occupied: parseNumber(shelter.OCCUPIED_BEDS),
                    unoccupied: parseNumber(shelter.UNOCCUPIED_BEDS),
                    program: shelter.PROGRAM_AREA,
                };
            } else {
                // Only log warning if we actually tried to match (don't spam console)
                return null;
            }
        }

        // For shelters with addresses, use the existing matching logic
        // First try to match by name (case-insensitive, trimmed)
        let match = shelterCoordinates.find(
            (coord) => coord.name && 
            coord.name.toLowerCase().trim() === shelter.LOCATION_NAME.toLowerCase().trim()
        );

        // If no name match, try to match by address (case-insensitive, trimmed)
        if (!match && shelter.LOCATION_ADDRESS) {
            match = shelterCoordinates.find(
                (coord) => coord.address && 
                coord.address.toLowerCase().trim() === shelter.LOCATION_ADDRESS.toLowerCase().trim()
            );
        }

        // If still no match, try partial name matching (contains)
        if (!match) {
            const shelterNameLower = shelter.LOCATION_NAME.toLowerCase().trim();
            match = shelterCoordinates.find(
                (coord) => {
                    if (!coord.name) return false;
                    const coordNameLower = coord.name.toLowerCase().trim();
                    // Check if either name contains the other (for variations)
                    return coordNameLower.includes(shelterNameLower) || 
                           shelterNameLower.includes(coordNameLower);
                }
            );
        }

        if (match && match.latitude && match.longitude) {
            return {
                name: shelter.LOCATION_NAME,
                address: shelter.LOCATION_ADDRESS,
                coordinates: [match.latitude, match.longitude],
                sector: shelter.SECTOR,
                capacity: parseNumber(shelter.CAPACITY_ACTUAL_BED),
                occupied: parseNumber(shelter.OCCUPIED_BEDS),
                unoccupied: parseNumber(shelter.UNOCCUPIED_BEDS),
                program: shelter.PROGRAM_AREA,
            };
        } else {
            // Only log if it's a shelter with an address (we expect those to match)
            if (shelter.LOCATION_ADDRESS) {
                console.warn(`❌ No match found for: ${shelter.LOCATION_NAME} (Address: ${shelter.LOCATION_ADDRESS})`);
            }
            return null;
        }
    };

    // Extract unique sectors from shelter occupancy data
    const availableSectors = useMemo(() => {
        if (!shelterOccupancy || shelterOccupancy.length === 0) return [];
        const sectors = [...new Set(shelterOccupancy.map(item => item.SECTOR).filter(Boolean))];
        return sectors.sort();
    }, [shelterOccupancy]);

    // Extract unique program areas
    const availablePrograms = useMemo(() => {
        if (!shelterOccupancy || shelterOccupancy.length === 0) return [];
        const programs = [...new Set(shelterOccupancy.map(item => item.PROGRAM_AREA).filter(Boolean))];
        return programs.sort();
    }, [shelterOccupancy]);

    // Reset all filters
    const handleResetFilters = () => {
        setSelectedSector("");
        setAvailabilityFilter("all");
        setSearchQuery("");
        setSelectedProgram("");
        setMinCapacity("");
        setMaxCapacity("");
    };

    // Filter shelter occupancy data by all filters
    const filteredShelterOccupancy = useMemo(() => {
        let filtered = shelterOccupancy;
        
        // Filter by sector
        if (selectedSector) {
            filtered = filtered.filter(item => item.SECTOR === selectedSector);
        }
        
        // Filter by program area
        if (selectedProgram) {
            filtered = filtered.filter(item => item.PROGRAM_AREA === selectedProgram);
        }
        
        // Filter by availability
        if (availabilityFilter === "available") {
            filtered = filtered.filter(item => {
                // Only include shelters with explicitly available beds (not null/undefined)
                if (item.UNOCCUPIED_BEDS == null || item.UNOCCUPIED_BEDS === "") return false;
                const unoccupied = parseNumber(item.UNOCCUPIED_BEDS);
                return unoccupied > 0;
            });
        } else if (availabilityFilter === "full") {
            filtered = filtered.filter(item => {
                // Only include shelters that explicitly have 0 unoccupied beds (exclude null/undefined)
                if (item.UNOCCUPIED_BEDS == null || item.UNOCCUPIED_BEDS === "") return false;
                const unoccupied = parseNumber(item.UNOCCUPIED_BEDS);
                return unoccupied === 0;
            });
        }
        
        // Filter by capacity range
        if (minCapacity !== "") {
            const min = parseInt(minCapacity);
            filtered = filtered.filter(item => (item.CAPACITY_ACTUAL_BED || 0) >= min);
        }
        if (maxCapacity !== "") {
            const max = parseInt(maxCapacity);
            filtered = filtered.filter(item => (item.CAPACITY_ACTUAL_BED || 0) <= max);
        }
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(item => {
                const name = (item.LOCATION_NAME || "").toLowerCase();
                const address = (item.LOCATION_ADDRESS || "").toLowerCase();
                return name.includes(query) || address.includes(query);
            });
        }
        
        return filtered;
    }, [shelterOccupancy, selectedSector, selectedProgram, availabilityFilter, minCapacity, maxCapacity, searchQuery]);

    // Filter shelters to include only those with valid coordinates
    // Memoize this to ensure it updates when filteredShelterOccupancy changes
    // Note: getShelterWithCoordinates is defined in the component but doesn't depend on state,
    // so we don't need to include it in dependencies
    const sheltersWithCoordinates = useMemo(() => {
        return filteredShelterOccupancy
            .map(getShelterWithCoordinates)
            .filter((shelter) => shelter !== null);
    }, [filteredShelterOccupancy, parseNumber]);


        const mostRecentDate = shelterOccupancy.reduce((latest, item) => {
            const itemDate = item["OCCUPANCY_DATE"]; // Get current item's date
            return itemDate > latest ? itemDate : latest; // Compare properly
        }, "0000-00-00"); // Ensure an empty date, NOT "Unknown"

    // Function to fetch missing coordinates
    const handleFetchMissingCoordinates = async () => {
        setIsFetchingCoordinates(true);
        setFetchMessage(null);
        setFetchError(null);

        try {
            console.log("🔄 Starting coordinate fetch...");
            const response = await fetch("http://localhost:3001/api/fetch-missing-coordinates", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            console.log("📡 Response status:", response.status);
            const data = await response.json();
            console.log("📦 Response data:", data);

            if (!response.ok) {
                const errorMsg = data.error || data.details || "Failed to fetch coordinates";
                console.error("❌ API Error:", errorMsg);
                throw new Error(errorMsg);
            }

            if (data.updated > 0) {
                setFetchMessage(`✅ Successfully fetched coordinates for ${data.updated} shelters! Reloading page in 2 seconds...`);
                console.log(`✅ Fetched ${data.updated} coordinates. Total: ${data.total}, Missing: ${data.missing}`);
                // Reload the page after 2 seconds to pick up new coordinates
                setTimeout(() => {
                    console.log("🔄 Reloading page to show new coordinates...");
                    window.location.reload();
                }, 2000);
            } else if (data.missing > 0) {
                setFetchMessage(`⚠️ Found ${data.missing} shelters missing coordinates, but couldn't fetch them. Check Flask service logs.`);
                console.warn("⚠️ Some shelters still missing coordinates:", data);
            } else {
                setFetchMessage(data.message || "All shelters already have coordinates.");
                console.log("ℹ️", data.message);
            }
        } catch (error) {
            console.error("❌ Error fetching coordinates:", error);
            const errorMessage = error.message || "Failed to fetch coordinates. Make sure the Flask service is running on port 5000.";
            setFetchError(errorMessage);
        } finally {
            setIsFetchingCoordinates(false);
        }
    };

    // Export filtered data to CSV
    const handleExportCSV = () => {
        if (sheltersWithCoordinates.length === 0) {
            alert("No shelters to export");
            return;
        }

        const headers = ["Name", "Address", "Sector", "Program", "Capacity", "Occupied", "Available", "Latitude", "Longitude"];
        const rows = sheltersWithCoordinates.map(s => [
            s.name || "",
            s.address || "",
            s.sector || "",
            s.program || "",
            s.capacity || 0,
            (s.capacity - s.unoccupied) || 0,
            s.unoccupied || 0,
            s.coordinates[0] || "",
            s.coordinates[1] || ""
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `shelters_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="InteractiveMap-container">
            <div className="MapTitle">
                <h1>City of Toronto Shelter Map and Occupancy</h1>
                {mostRecentDate && mostRecentDate !== "0000-00-00" && (
                    <div className="MapTitle-date">{mostRecentDate}</div>
                )}
            </div>
            
            <div className="MapLayout-top">
                <div className="MapLayout-filters">
                    <MapFilters
                        sectors={availableSectors}
                        selectedSector={selectedSector}
                        onSectorChange={setSelectedSector}
                        availabilityFilter={availabilityFilter}
                        onAvailabilityChange={setAvailabilityFilter}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        programAreas={availablePrograms}
                        selectedProgram={selectedProgram}
                        onProgramChange={setSelectedProgram}
                        minCapacity={minCapacity}
                        onMinCapacityChange={setMinCapacity}
                        maxCapacity={maxCapacity}
                        onMaxCapacityChange={setMaxCapacity}
                        onResetFilters={handleResetFilters}
                        count={sheltersWithCoordinates.length}
                        totalCount={shelterOccupancy.length}
                        onFetchCoordinates={handleFetchMissingCoordinates}
                        isFetchingCoordinates={isFetchingCoordinates}
                        fetchMessage={fetchMessage}
                        fetchError={fetchError}
                    />
                </div>
            </div>
            
            <div className="MapContainer-wrapper">
                <div className="MapContainer-inner">
                    <MapContainer
                        center={[43.65107, -79.347015]} // Default Toronto center
                        zoom={12}
                        className="MapContainer"
                    >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                {sheltersWithCoordinates.map((shelter, index) => {
                    // Color Logic: Blue = has available beds (unoccupied > 0), Red = full (unoccupied === 0)
                    // shelter.unoccupied is already parsed as a number in getShelterWithCoordinates
                    // Re-parse to ensure consistency with filter logic (handles any edge cases)
                    const unoccupiedNum = parseNumber(shelter.unoccupied);
                    // Use strict comparison: > 0 for available (blue), === 0 for full (red)
                    const color = unoccupiedNum > 0 ? "blue" : "red";
                    const radius = unoccupiedNum > 0 ? Math.min(Math.max(unoccupiedNum / 15, 10), 30) : 8;
                    
                    // Debug: Log mismatches when filter is active (helps identify the issue)
                    if (availabilityFilter === "available" && unoccupiedNum === 0) {
                        console.warn(`⚠️ Filter mismatch: Shelter "${shelter.name}" passed "available" filter but has unoccupied=${unoccupiedNum} (should be > 0)`, shelter);
                    } else if (availabilityFilter === "full" && unoccupiedNum > 0) {
                        console.warn(`⚠️ Filter mismatch: Shelter "${shelter.name}" passed "full" filter but has unoccupied=${unoccupiedNum} (should be === 0)`, shelter);
                    }

                    // Use a unique key that includes index to ensure uniqueness (some shelters may have same name/address)
                    // Include filter state to force re-render when filters change
                    const shelterKey = `shelter-${index}-${shelter.name}-${shelter.address}-${availabilityFilter}-${unoccupiedNum}`;

                    return (
                        <CircleMarker
                            key={shelterKey}
                            center={shelter.coordinates}
                            radius={radius} // This keeps the visible dot size
                            fillColor={color}
                            fillOpacity={0.7}
                            stroke={false}
                            eventHandlers={{
                                mouseover: (e) => e.target.setStyle({ radius: radius * 2, fillOpacity: 1 }), // Expands hover area
                                mouseout: (e) => e.target.setStyle({ radius: radius, fillOpacity: 0.7 }) // Resets when not hovering
                                            }}
>
                            {/* Tooltip for shelter details */}
                            <Popup>
                                <div style={{ minWidth: '200px' }}>
                                    <strong>{shelter.name || "Unknown Shelter"}</strong>
                                    <br />
                                    <span>{shelter.address || "Address not available"}</span>
                                    <br /><br />
                                    <strong>Capacity:</strong> {shelter.capacity != null ? shelter.capacity : "N/A"}
                                    <br />
                                    <strong>Occupied Beds:</strong> {shelter.occupied != null ? shelter.occupied : "N/A"}
                                    <br />
                                    <strong>Unoccupied Beds:</strong> {shelter.unoccupied != null ? shelter.unoccupied : "N/A"}
                                    <br />
                                    {shelter.program && (
                                        <>
                                            <strong>Program:</strong> {shelter.program}
                                            <br />
                                        </>
                                    )}
                                    {shelter.sector && (
                                        <>
                                            <strong>Sector:</strong> {shelter.sector}
                                        </>
                                    )}
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
                    </MapContainer>
                    {/* Legend inside map container at the bottom */}
                    <div className="MapLegend-container">
                        <MapLegend />
                    </div>
                </div>
            </div>

            {/* Statistics and Export below the map */}
            <div className="MapLayout-bottom">
                <div className="MapLayout-bottom-center">
                    <MapStatistics shelters={sheltersWithCoordinates} />
                    <div className="MapActions">
                        <button 
                            className="ExportButton"
                            onClick={handleExportCSV}
                            disabled={sheltersWithCoordinates.length === 0}
                        >
                            📥 Export Filtered Data (CSV)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InteractiveMap;

