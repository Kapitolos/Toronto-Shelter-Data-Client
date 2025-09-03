import { useEffect, useState } from "react";
import './App.css';
import ShelterOccupancyChart from "./ShelterOccupancyChart";
import HousingWaitlistChart from "./HousingWaitlistChart"; // Import the new chart
import ShelterFlowChart from "./ShelterFlowChart";
import HistoricalOccupancyChart from "./HistoricalOccupancyChart";

function ShelterDashboard() {
    // State for each dataset
    const [shelterOccupancy, setShelterOccupancy] = useState([]);
    const [housingWaitlist, setHousingWaitlist] = useState([]);
    const [shelterFlow, setShelterFlow] = useState([]);
    const [historicalOccupancy, setHistoricalOccupancy] = useState([]);
    // set tab
    const [activeTab, setActiveTab] = useState("occupancy");


    useEffect(() => {
        fetch("http://localhost:3001/api/shelter-dashboard")
            .then(response => response.json())
            .then(data => {
                console.log("Full API Response:", data); // ✅ Log the full response

                if (!data.data || !Array.isArray(data.data)) {
                    console.error("❌ Unexpected data format:", data);
                    return;
                }



                // Extract each dataset
                const [
                    occupancyData, 
                    waitlistData, 
                    flowData, 
                    , // skip deathsData
                    historicalData, 
                  ] = data.data;

                // Store each dataset in its corresponding state
                setShelterOccupancy(occupancyData);
                setHousingWaitlist(waitlistData);
                setShelterFlow(flowData);
                setHistoricalOccupancy(historicalData);
                       
            })
            .catch(error => console.error("Error fetching shelter data:", error));
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case "occupancy":
                return   <ShelterOccupancyChart data={shelterOccupancy}/>;
            case "waitlist":
                return <HousingWaitlistChart data={housingWaitlist} />;
            case "flow":
                return <ShelterFlowChart data={shelterFlow} />;
            case "historical":
                return <HistoricalOccupancyChart data={historicalOccupancy} />;
            default:
                return <p>Select a tab to view data.</p>;
        }
    };

    return (
        <div>
            <h1 className="Dash_Title">Citywide Data</h1>
            <div className="Tabs">
                <button onClick={() => setActiveTab("occupancy")} className={activeTab === "occupancy" ? "active" : ""}>Occupancy 2025</button>
                <button onClick={() => setActiveTab("waitlist")} className={activeTab === "waitlist" ? "active" : ""}>Housing Waitlist</button>
                <button onClick={() => setActiveTab("flow")} className={activeTab === "flow" ? "active" : ""}>System Flow</button>
                <button onClick={() => setActiveTab("historical")} className={activeTab === "historical" ? "active" : ""}>Historical Occupancy 2020</button>
            </div>
            <div className="TabContent">
                {renderContent()}
            </div>
        </div>
    );
}

export default ShelterDashboard;
