import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";



// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function HousingWaitlistChart({ data }) {
    if (!data || data.length === 0) {
        return <p>Loading waitlist data...</p>;
    }

  // Extract labels (quarters) and relevant waitlist numbers
const labels = data.map(item => item["Quarter/Year"] || "Unknown");

const safeParse = (value) =>
  typeof value === "string" ? parseInt(value.replace(/,/g, ""), 10) || 0 : 0;

const totalWaitlist = data.map(item => safeParse(item["Total active waiting list"]));
const housed = data.map(item => safeParse(item["Housed"]));
const newReactivated = data.map(item => safeParse(item["New/reactivated"]));
const householdNoDependents = data.map(item => safeParse(item["Household no dependents"]));
const householdWithDependents = data.map(item => safeParse(item["Household with dependents"]));
const seniors = data.map(item => safeParse(item["Seniors"]));


    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Total Waitlist",
                data: totalWaitlist,
                borderColor: "rgba(255, 99, 132, 1)", // Red
                backgroundColor: "rgba(255, 99, 132, 0.2)", // Light fill
                tension: 0.4,
            },
            {
                label: "Housed Applicants",
                data: housed,
                borderColor: "rgba(54, 162, 235, 1)", // Blue
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                tension: 0.4,
            },
            {
                label: "New Applicants",
                data: newReactivated,
                borderColor: "rgba(255, 206, 86, 1)", // Yellow
                backgroundColor: "rgba(255, 206, 86, 0.2)",
                tension: 0.4,
            },
            {
                label: "Household No Dependents",
                data: householdNoDependents,
                borderColor: "rgba(75, 192, 192, 1)", // Teal
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.4,
            },
            {
                label: "Household With Dependents",
                data: householdWithDependents,
                borderColor: "rgba(153, 102, 255, 1)", // Purple
                backgroundColor: "rgba(153, 102, 255, 0.2)",
                tension: 0.4,
            },
            {
                label: "Seniors",
                data: seniors,
                borderColor: "rgba(255, 159, 64, 1)", // Orange
                backgroundColor: "rgba(255, 159, 64, 0.2)",
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Housing Waitlist Over Time" },
        },
        scales: {
            x: { title: { display: true, text: "Quarter/Year" } },
            y: { beginAtZero: true, title: { display: true, text: "People on Waitlist" } },
        },
    };

    return (
        <div>
               <Line data={chartData} options={options} />
        <div className="text-sm text-gray-700">
        <p><strong>Total Waitlist:</strong> The total number of households waiting for housing. From Q1 2019 to Q4 2024, the total waitlist decreased by 10%.</p>
        <p><strong>Housed Applicants:</strong> Represents households successfully placed into stable housing. Housed applicants saw a quarterly high of 3,200 in Q3 2022.</p>
        <p><strong>New Applicants:</strong> Tracks new entries into the housing system. New applicants dropped 25% from Q1 2019 to Q4 2024.</p>
        <p><strong>Households with Dependents:</strong> Includes families with children. This category shows steady numbers with slight declines in recent years.</p>
        <p><strong>Households without Dependents:</strong> Single individuals or couples without dependents. The number has remained relatively stable.</p>
        <p><strong>Seniors:</strong> Includes individuals aged 65 and older. Senior waitlist numbers increased by 15% from Q1 2019 to Q4 2024.</p>
        <p><strong>Overall Trends:</strong> The housing system has seen a general stabilization in waitlist numbers, with notable progress in housing applicants over time.</p>
      </div>
 
    </div>
    );
}

export default HousingWaitlistChart;
