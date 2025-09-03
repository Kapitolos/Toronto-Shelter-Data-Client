import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ShelterOccupancyChart({ data }) {
    if (!data || data.length === 0) {
        return <p>Loading shelter occupancy data...</p>;
    }

    // Extract relevant data from API response
    const labels = data.map(item => item.LOCATION_NAME || "Unknown Location");
    const occupancy = data.map(item => item.OCCUPIED_BEDS || 0);
    const capacity = data.map(item => item.CAPACITY_ACTUAL_BED || 0);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Occupied Beds",
                data: occupancy,
                backgroundColor: "rgba(255, 99, 132, 0.6)", // Red
            },
            {
                label: "Total Beds",
                data: capacity,
                backgroundColor: "rgba(54, 162, 235, 0.6)", // Blue
            },
        ],
    };

    const mostRecentDate = data.reduce((latest, item) => {
        const itemDate = item["OCCUPANCY_DATE"]; // Get current item’s date
        return itemDate > latest ? itemDate : latest; // Compare properly
    }, "0000-00-00"); // Ensure an empty date, NOT "Unknown"

const options = {
    responsive: true,
    plugins: {
        legend: { position: "top" },
        title: { display: true, text: `Shelter Occupancy vs. Capacity (Updated: ${mostRecentDate})` },
    },
    scales: {
        y: { beginAtZero: true },
    },
};


    return <Bar data={chartData} options={options} />;
}

export default ShelterOccupancyChart;
