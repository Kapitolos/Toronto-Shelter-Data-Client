import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
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
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [shelters, setShelters] = useState([]);
    const [backfilling, setBackfilling] = useState(false);
    const [backfillMessage, setBackfillMessage] = useState(null);

    // Fetch available dates
    useEffect(() => {
        fetch(`${API_BASE}/api/historical-dates`)
            .then(res => res.json())
            .then(data => {
                setAvailableDates(data.dates || []);
                if (data.dates && data.dates.length > 0) {
                    setDate1(data.dates[data.dates.length - 1]);
                    if (data.dates.length > 1) {
                        setDate2(data.dates[data.dates.length - 2]);
                    }
                }
            })
            .catch(err => {
                console.error('Error fetching dates:', err);
                setError('Failed to load historical dates');
            });
    }, []);

    // Fetch shelters list from current data
    useEffect(() => {
        fetch(`${API_BASE}/api/shelter-dashboard`)
            .then(res => res.json())
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
        if (!selectedShelter) {
            setError('Please select a shelter');
            return;
        }

        setLoading(true);
        setError(null);
        fetch(`${API_BASE}/api/shelter-history/${encodeURIComponent(selectedShelter)}`)
            .then(res => res.json())
            .then(data => {
                setShelterHistory(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching history:', err);
                setError('Failed to load shelter history');
                setLoading(false);
            });
    };

    // Backfill historical data
    const handleBackfill = async () => {
        setBackfilling(true);
        setBackfillMessage(null);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE}/api/backfill-historical-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setBackfillMessage(data.message || 'Backfill started successfully. Check server logs for progress.');
                // Refresh available dates after a delay
                setTimeout(() => {
                    fetch(`${API_BASE}/api/historical-dates`)
                        .then(res => res.json())
                        .then(data => {
                            setAvailableDates(data.dates || []);
                        })
                        .catch(err => console.error('Error refreshing dates:', err));
                }, 5000);
            } else {
                setError(data.error || 'Failed to start backfill');
            }
        } catch (error) {
            console.error('Error starting backfill:', error);
            setError('Failed to start backfill. Make sure the server is running.');
        } finally {
            setBackfilling(false);
        }
    };

    // Compare dates
    const handleCompareDates = () => {
        if (!date1 || !date2) {
            setError('Please select both dates');
            return;
        }

        setLoading(true);
        setError(null);
        fetch(`${API_BASE}/api/compare-dates?date1=${date1}&date2=${date2}`)
            .then(res => res.json())
            .then(data => {
                setComparison(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error comparing dates:', err);
                setError('Failed to compare dates');
                setLoading(false);
            });
    };

    // Prepare chart data for shelter history
    const getHistoryChartData = () => {
        if (!shelterHistory || !shelterHistory.history) return null;

        const dates = shelterHistory.dates.sort();
        const data = dates.map(date => {
            const shelterData = shelterHistory.history[date][0]; // Get first match
            return {
                date,
                capacity: shelterData?.capacity || 0,
                occupied: shelterData?.occupied || 0,
                unoccupied: shelterData?.unoccupied || 0
            };
        });

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
                        {shelters.map(shelter => (
                            <option key={shelter} value={shelter}>{shelter}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleFetchHistory}
                        disabled={!selectedShelter || loading}
                        className="ShelterHistory-button"
                    >
                        {loading ? 'Loading...' : 'View History'}
                    </button>
                </div>

                {shelterHistory && historyChartData && (
                    <div className="ShelterHistory-chart">
                        <h3>{shelterHistory.shelterName} - Historical Trends</h3>
                        <Line
                            data={historyChartData}
                            options={{
                                responsive: true,
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
                                    {shelterHistory.dates.sort().map(date => {
                                        const shelterData = shelterHistory.history[date][0];
                                        const capacity = shelterData?.capacity || 0;
                                        const occupied = shelterData?.occupied || 0;
                                        const unoccupied = shelterData?.unoccupied || 0;
                                        const occupancyRate = capacity > 0 
                                            ? ((occupied / capacity) * 100).toFixed(1) 
                                            : '0.0';
                                        return (
                                            <tr key={date}>
                                                <td>{date}</td>
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

            {/* Date Comparison Section */}
            <div className="ShelterHistory-section">
                <h2>Compare Dates</h2>
                <div className="ShelterHistory-controls">
                    <select
                        value={date1}
                        onChange={(e) => setDate1(e.target.value)}
                        className="ShelterHistory-select"
                    >
                        <option value="">Select first date...</option>
                        {availableDates.map(date => (
                            <option key={date} value={date}>{date}</option>
                        ))}
                    </select>
                    <select
                        value={date2}
                        onChange={(e) => setDate2(e.target.value)}
                        className="ShelterHistory-select"
                    >
                        <option value="">Select second date...</option>
                        {availableDates.map(date => (
                            <option key={date} value={date}>{date}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleCompareDates}
                        disabled={!date1 || !date2 || loading}
                        className="ShelterHistory-button"
                    >
                        {loading ? 'Loading...' : 'Compare'}
                    </button>
                </div>

                {comparison && (
                    <div className="ShelterHistory-comparison">
                        <h3>Comparison: {comparison.date1} vs {comparison.date2}</h3>
                        <div className="ShelterHistory-comparison-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Shelter</th>
                                        <th>{comparison.date1}</th>
                                        <th>{comparison.date2}</th>
                                        <th>Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparison.comparisons.map((comp, idx) => (
                                        <tr key={idx}>
                                            <td>{comp.shelter}</td>
                                            <td>
                                                Cap: {comp.date1.capacity}<br/>
                                                Occ: {comp.date1.occupied}<br/>
                                                Avail: {comp.date1.unoccupied}
                                            </td>
                                            <td>
                                                Cap: {comp.date2.capacity}<br/>
                                                Occ: {comp.date2.occupied}<br/>
                                                Avail: {comp.date2.unoccupied}
                                            </td>
                                            <td>
                                                Cap: <span className={comp.changes.capacityChange >= 0 ? 'positive' : 'negative'}>
                                                    {comp.changes.capacityChange >= 0 ? '+' : ''}{comp.changes.capacityChange}
                                                </span><br/>
                                                Occ: <span className={comp.changes.occupiedChange >= 0 ? 'positive' : 'negative'}>
                                                    {comp.changes.occupiedChange >= 0 ? '+' : ''}{comp.changes.occupiedChange}
                                                </span><br/>
                                                Avail: <span className={comp.changes.unoccupiedChange >= 0 ? 'positive' : 'negative'}>
                                                    {comp.changes.unoccupiedChange >= 0 ? '+' : ''}{comp.changes.unoccupiedChange}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Backfill Section */}
            <div className="ShelterHistory-section">
                <h2>Backfill Historical Data</h2>
                {availableDates.length === 0 ? (
                    <p>No historical data available yet. You can backfill historical data from the API.</p>
                ) : (
                    <p>Currently have {availableDates.length} dates stored. Backfill will fetch any missing dates from the API.</p>
                )}
                <button
                    onClick={handleBackfill}
                    disabled={backfilling}
                    className="ShelterHistory-button"
                    style={{ marginTop: '15px' }}
                >
                    {backfilling ? 'Backfilling...' : '🔄 Backfill Historical Data from API'}
                </button>
                {backfillMessage && (
                    <div className="ShelterHistory-success" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', border: '1px solid #10b981' }}>
                        {backfillMessage}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ShelterHistory;

