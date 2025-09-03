import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import shelterCoordinates from "./updated_shelters.json"; // Import coordinates JSON

function InteractiveMap() {
    const [shelterOccupancy, setShelterOccupancy] = useState([]);

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
            })
            .catch(error => console.error("Error fetching shelter data:", error));
    }, []);

    // Function to match shelters with coordinates
    const getShelterWithCoordinates = (shelter) => {
        const match = shelterCoordinates.find(
            (coord) => coord.name.toLowerCase() === shelter.LOCATION_NAME.toLowerCase()
        );

        if (match) {
            return {
                name: shelter.LOCATION_NAME,
                address: shelter.LOCATION_ADDRESS,
                coordinates: [match.latitude, match.longitude],
                sector: shelter.SECTOR,
                capacity: shelter.CAPACITY_ACTUAL_BED,
                unoccupied: shelter.UNOCCUPIED_BEDS,
                program: shelter.PROGRAM_AREA,
            };
        } else {
            console.warn(`❌ No match found for: ${shelter.LOCATION_NAME} (Address: ${shelter.LOCATION_ADDRESS})`);
            return null;
        }
    };

    // Filter shelters to include only those with valid coordinates
    const sheltersWithCoordinates = shelterOccupancy
        .map(getShelterWithCoordinates)
        .filter((shelter) => shelter !== null);


        const mostRecentDate = shelterOccupancy.reduce((latest, item) => {
            const itemDate = item["OCCUPANCY_DATE"]; // Get current item’s date
            return itemDate > latest ? itemDate : latest; // Compare properly
        }, "0000-00-00"); // Ensure an empty date, NOT "Unknown"

    return (
        <div>
            <h1>Map Of Shelters & Occupancy Information {mostRecentDate}</h1>
            <MapContainer
                center={[43.65107, -79.347015]} // Default Toronto center
                zoom={12}
                style={{ height: "500px", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {sheltersWithCoordinates.map((shelter, index) => {
                    // Color Logic
                    const color = shelter.unoccupied > 0 ? "blue" : "red";
                    const radius = shelter.unoccupied ? Math.min(Math.max(shelter.unoccupied / 15, 10), ) : 8;


                    return (
                        <CircleMarker
                            key={index}
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
                                <strong>{shelter.name}</strong>
                                <br />
                                {shelter.address}
                                <br />
                                <strong>Capacity:</strong> {shelter.capacity}
                                <br />
                                <strong>Unoccupied Beds:</strong> {shelter.unoccupied}
                                <br />
                                <strong>Program:</strong> {shelter.program}
                                <br />
                                <strong>Sector:</strong> {shelter.sector}
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

export default InteractiveMap;

