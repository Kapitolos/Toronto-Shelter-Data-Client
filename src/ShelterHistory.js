import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import './App.css';
import { API_BASE } from './config';

// Parse JSON only when server returns JSON (avoids "Unexpected token '<'" when server returns HTML 404/waking page)
async function apiJson(res) {
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(text.startsWith('<') ? 'Server unavailable or starting (try again in 30–60s)' : text || `Request failed ${res.status}`);
    }
    return res.json();
}

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function ShelterHistory() {
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedShelter, setSelectedShelter] = useState('');
    const [shelterHistory, setShelterHistory] = useState(null);
    const [date1, setDate1] = useState('');
    const [date2, setDate2] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [shelters, setShelters] = useState([]);
    // Fetch available dates and trigger async backfill automatically
    useEffect(() => {
        const initializeHistory = async () => {
            try {
                const datesResponse = await fetch(`${API_BASE}/api/historical-dates`);
                const datesData = await apiJson(datesResponse);
                const initialDates = datesData.dates || [];

                setAvailableDates(initialDates);
                if (initialDates.length > 0) {
                    setDate1(initialDates[0]);
                    setDate2(initialDates[initialDates.length - 1]);
                }

                console.log(`[Backfill] Dates before backfill: ${initialDates.length}`);
                const backfillResponse = await fetch(`${API_BASE}/api/backfill-historical-data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const backfillData = await apiJson(backfillResponse);
                console.log('[Backfill] Started:', backfillData.message || 'Request accepted');

                // Backfill is async on the server; refresh the date list shortly after.
                setTimeout(async () => {
                    try {
                        const refreshedResponse = await fetch(`${API_BASE}/api/historical-dates`);
                        const refreshedData = await apiJson(refreshedResponse);
                        const refreshedDates = refreshedData.dates || [];
                        const addedCount = Math.max(refreshedDates.length - initialDates.length, 0);
                        console.log(`[Backfill] Dates after refresh: ${refreshedDates.length}`);
                        console.log(`[Backfill] Added dates: ${addedCount}`);

                        setAvailableDates(refreshedDates);
                        setDate1((prev) => prev || refreshedDates[0] || '');
                        setDate2((prev) => prev || refreshedDates[refreshedDates.length - 1] || '');
                    } catch (refreshErr) {
                        console.error('[Backfill] Error refreshing dates:', refreshErr);
                    }
                }, 7000);
            } catch (err) {
                console.error('Error fetching dates:', err);
                setError(err.message || 'Failed to load historical dates');
            }
        };

        initializeHistory();
    }, []);

    // Fetch shelters list from current data
    useEffect(() => {
        fetch(`${API_BASE}/api/shelter-dashboard`)
            .then(res => apiJson(res))
            .then(data => {
                if (data.data && data.data[0]) {
                    const shelterNames = [...new Set(
                        data.data[0]
                            .map(s => s.LOCATION_NAME)
                            .filter(Boolean)
                    )].sort();
                    setShelters(shelterNames);
                }
            })
            .catch(err => console.error('Error fetching shelters:', err));
    }, []);

    // Fetch shelter history
    const handleFetchHistory = () => {
        if (!selectedShelter || !date1 || !date2) {
            setError('Please select a shelter and date range');
            return;
        }
        if (date2 < date1) {
            setError('End date must be on or after the start date');
            return;
        }
        const shelterParam = selectedShelter === '__all__' ? '__all__' : selectedShelter;
        if (!shelterParam) {
            setError('Please select a shelter');
            return;
        }

        setLoading(true);
        setError(null);
        fetch(`${API_BASE}/api/shelter-history/${encodeURIComponent(shelterParam)}`)
            .then(res => apiJson(res))
            .then(data => {
                setShelterHistory(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching history:', err);
                setError(err.message || 'Failed to load shelter history');
                setLoading(false);
            });
    };

    // Ensure end date never predates start date
    useEffect(() => {
        if (date1 && date2 && date2 < date1) {
            setDate2('');
        }
    }, [date1, date2]);

    // Keep only selected shelter rows (or aggregate all shelters) inside selected date range
    const getFilteredShelterRows = () => {
        if (!shelterHistory || !shelterHistory.history) return [];

        const isAllShelters = selectedShelter === '__all__';
        const shelterName = (selectedShelter || '').trim().toLowerCase();
        const start = date1 || '0000-00-00';
        const end = date2 || '9999-12-31';

        const filteredDates = (shelterHistory.dates || [])
            .slice()
            .sort()
            .filter((date) => date >= start && date <= end);

        return filteredDates.map((date) => {
            const entries = shelterHistory.history[date] || [];
            if (isAllShelters) {
                const aggregate = entries.reduce((acc, entry) => {
                    acc.capacity += Number(entry?.capacity || 0);
                    acc.occupied += Number(entry?.occupied || 0);
                    acc.unoccupied += Number(entry?.unoccupied || 0);
                    return acc;
                }, { capacity: 0, occupied: 0, unoccupied: 0 });

                return {
                    date,
                    capacity: aggregate.capacity,
                    occupied: aggregate.occupied,
                    unoccupied: aggregate.unoccupied
                };
            }

            const exactEntry = entries.find((entry) => (entry.name || '').trim().toLowerCase() === shelterName);
            const shelterData = exactEntry;
            if (!shelterData) {
                return null;
            }

            return {
                date,
                capacity: shelterData?.capacity || 0,
                occupied: shelterData?.occupied || 0,
                unoccupied: shelterData?.unoccupied || 0
            };
        }).filter(Boolean);
    };

    // Prepare chart data for shelter history
    const getHistoryChartData = () => {
        const data = getFilteredShelterRows();
        if (data.length === 0) return null;
        const dates = data.map((d) => d.date);

        return {
            labels: dates,
            datasets: [
                {
                    label: 'Capacity',
                    data: data.map(d => d.capacity),
                    borderColor: 'rgba(54, 162, 235, 0.5)', // More transparent
                    backgroundColor: 'rgba(54, 162, 235, 0.05)', // Very transparent fill
                    borderDash: [5, 5], // Dashed line
                    borderWidth: 2,
                    tension: 0.1,
                    order: 3 // Render last (behind other lines)
                },
                {
                    label: 'Occupied Beds',
                    data: data.map(d => d.occupied),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 3, // Thicker line for visibility
                    tension: 0.1,
                    order: 1 // Render first (on top)
                },
                {
                    label: 'Available Beds',
                    data: data.map(d => d.unoccupied),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    borderWidth: 2,
                    tension: 0.1,
                    order: 2 // Render second
                }
            ]
        };
    };

    const historyChartData = getHistoryChartData();
    const filteredShelterRows = getFilteredShelterRows();
    const endDateOptions = date1 ? availableDates.filter((date) => date >= date1) : availableDates;

    return (
        <div className="ShelterHistory-container">
            <h1>Shelter Historical Data & Trends</h1>

            {error && (
                <div className="ShelterHistory-error">
                    {error}
                </div>
            )}

            {/* Shelter History Section */}
            <div className="ShelterHistory-section">
                <h2>View Shelter History</h2>
                <div className="ShelterHistory-controls">
                    <select
                        value={selectedShelter}
                        onChange={(e) => setSelectedShelter(e.target.value)}
                        className="ShelterHistory-select"
                    >
                        <option value="">Select a shelter...</option>
                        <option value="__all__">All Shelters</option>
                        {shelters.map(shelter => (
                            <option key={shelter} value={shelter}>{shelter}</option>
                        ))}
                    </select>
                    <select
                        value={date1}
                        onChange={(e) => setDate1(e.target.value)}
                        className="ShelterHistory-select"
                    >
                        <option value="">Select start date...</option>
                        {availableDates.map(date => (
                            <option key={date} value={date}>{date}</option>
                        ))}
                    </select>
                    <select
                        value={date2}
                        onChange={(e) => setDate2(e.target.value)}
                        className="ShelterHistory-select"
                    >
                        <option value="">Select end date...</option>
                        {endDateOptions.map(date => (
                            <option key={date} value={date}>{date}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleFetchHistory}
                        disabled={!selectedShelter || !date1 || !date2 || loading}
                        className="ShelterHistory-button"
                    >
                        {loading ? 'Loading...' : 'View History'}
                    </button>
                </div>

                {shelterHistory && historyChartData && (
                    <div className="ShelterHistory-chart">
                        <h3>{selectedShelter === '__all__' ? 'All Shelters - Historical Trends' : `${shelterHistory.shelterName} - Historical Trends`}</h3>
                        <div className="ShelterHistory-chart-canvas">
                            <Line
                                data={historyChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: 'Shelter Capacity and Occupancy Over Time'
                                        },
                                        legend: {
                                            display: true
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="ShelterHistory-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Capacity</th>
                                        <th>Occupied</th>
                                        <th>Available</th>
                                        <th>Occupancy Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredShelterRows.map((row) => {
                                        const capacity = row.capacity;
                                        const occupied = row.occupied;
                                        const unoccupied = row.unoccupied;
                                        const occupancyRate = capacity > 0 
                                            ? ((occupied / capacity) * 100).toFixed(1) 
                                            : '0.0';
                                        return (
                                            <tr key={row.date}>
                                                <td>{row.date}</td>
                                                <td>{capacity}</td>
                                                <td>{occupied}</td>
                                                <td>{unoccupied}</td>
                                                <td>{occupancyRate}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

export default ShelterHistory;

