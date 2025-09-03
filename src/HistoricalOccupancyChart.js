import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function HistoricalOccupancyChart({ data }) {
    if (!data || data.length === 0) {
        return <p>Loading shelter occupancy data...</p>;
    }

    // Helper function to safely convert values
    const parseNumber = (value) => (typeof value === "string" ? parseInt(value, 10) || 0 : value || 0);

    // Extract shelter names, occupancy, and capacity
    const labels = data.map(item => item["SHELTER_NAME"] || "Unknown Shelter");
    const occupancy = data.map(item => parseNumber(item["OCCUPANCY"]));
    const capacity = data.map(item => parseNumber(item["CAPACITY"]));
    
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Shelter Occupancy",
                data: occupancy,
                backgroundColor: "rgba(255, 99, 132, 0.6)", // Red
            },
            {
                label: "Total Capacity",
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
        indexAxis: 'y', // Switch to horizontal bar chart
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: `Shelter Occupancy vs. Capacity (Updated: ${mostRecentDate})` },
            tooltip: {
                callbacks: {
                    title: function(context) {
                        // Show full shelter name in tooltip
                        const idx = context[0].dataIndex;
                        return labels[idx];
                    }
                }
            }
        },
        scales: {
            x: { beginAtZero: true },
        },
        maintainAspectRatio: false,
    };
    

    return (
        <div style={{ width: '100%', minHeight: 400, overflowX: 'auto' }}>
            <Bar data={chartData} options={options} height={400} />
        </div>
    );
}

export default HistoricalOccupancyChart;
