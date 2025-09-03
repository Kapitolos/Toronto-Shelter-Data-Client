import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ShelterFlowChart({ data }) {
    if (!data || data.length === 0) {
        return <p>Loading shelter flow data...</p>;
    }

    // Helper function to safely convert values to numbers
    // only uses replace if the data is a string
    const parseNumber = (value) => {
        if (typeof value === "string") {
            return parseInt(value.replace(/,/g, ""), 10) || 0;
        }
        return value || 0; // If it's already a number, return as-is
    };

    // Extract labels (dates) and shelter flow categories
    const labels = data.map(item => {
        const rawDate = item["date(mmm-yy)"] || "Unknown";
        return rawDate.replace(/(\w{3})-(\d{2})/, "$1-20$2"); // Converts "Jan-18" → "Jan-2018"
    });
    
    const returnedFromHousing = data.map(item => parseNumber(item["returned_from_housing"]));
    const returnedToShelter = data.map(item => parseNumber(item["returned_to_shelter"]));
    const newlyIdentified = data.map(item => parseNumber(item["newly_identified"]));
    const movedToHousing = data.map(item => parseNumber(item["moved_to_housing"]));
    const becameInactive = data.map(item => parseNumber(item["became_inactive"]));
    const activelyHomeless = data.map(item => parseNumber(item["actively_homeless"]));

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Returned from Housing",
                data: returnedFromHousing,
                backgroundColor: "rgba(54, 162, 235, 0.6)", // Blue
            },
            {
                label: "Returned to Shelter",
                data: returnedToShelter,
                backgroundColor: "rgba(255, 99, 132, 0.6)", // Red
            },
            {
                label: "Newly Identified Homeless",
                data: newlyIdentified,
                backgroundColor: "rgba(255, 206, 86, 0.6)", // Yellow
            },
            {
                label: "Moved to Housing",
                data: movedToHousing,
                backgroundColor: "rgba(75, 192, 192, 0.6)", // Teal
            },
            {
                label: "Became Inactive",
                data: becameInactive,
                backgroundColor: "rgba(153, 102, 255, 0.6)", // Purple
            },
            {
                label: "Actively Homeless",
                data: activelyHomeless,
                backgroundColor: "rgba(255, 159, 64, 0.6)", // Orange
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Shelter System Flow Over Time" },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return <Bar data={chartData} options={options} />;
}

export default ShelterFlowChart;
