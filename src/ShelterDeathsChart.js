import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function ShelterDeathsChart({ data }) {
    if (!data || data.length === 0) {
        return <p>Loading shelter deaths data...</p>;
    }

    // Helper function to safely convert values, handling "n/a"
    const parseNumber = (value) => {
        if (typeof value === "string" && value.toLowerCase() === "n/a") return 0;
        return parseInt(value, 10) || 0;
    };

    // Extract time labels (Month + Year)
    const labels = data.map(item => `${item.Month} ${item.Year}`);

    // Extract data for each category
    const totalDeaths = data.map(item => parseNumber(item["Total decedents"]));
    const maleDeaths = data.map(item => parseNumber(item["Male"]));
    const femaleDeaths = data.map(item => parseNumber(item["Female"]));
    const nonBinaryDeaths = data.map(item => parseNumber(item["Transgender/Non-binary/Two-Spirit"]));

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Total Deaths",
                data: totalDeaths,
                borderColor: "rgba(255, 99, 132, 1)", // Red
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                tension: 0.4,
            },
            {
                label: "Male",
                data: maleDeaths,
                borderColor: "rgba(54, 162, 235, 1)", // Blue
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                tension: 0.4,
            },
            {
                label: "Female",
                data: femaleDeaths,
                borderColor: "rgba(255, 206, 86, 1)", // Yellow
                backgroundColor: "rgba(255, 206, 86, 0.2)",
                tension: 0.4,
            },
            {
                label: "Trans/Non-Binary/Two-Spirit",
                data: nonBinaryDeaths,
                borderColor: "rgba(153, 102, 255, 1)", // Purple
                backgroundColor: "rgba(153, 102, 255, 0.2)",
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Deaths in Shelters Over Time" },
        },
        scales: {
            x: { title: { display: true, text: "Month & Year" } },
            y: { beginAtZero: true, title: { display: true, text: "Number of Deaths" } },
        },
    };

    return <Line data={chartData} options={options} />;
}

export default ShelterDeathsChart;
