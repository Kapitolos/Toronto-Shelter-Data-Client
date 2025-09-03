import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [shelters, setShelters] = useState([]);
    const [deaths, setDeaths] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/shelter-dashboard') // Call the Express server
            .then(response => response.json())
            .then(data => {
                setShelters(data['data'][0]); // Store data in state
                setDeaths(data['data'][4]);
            })
            .catch(error => console.error('Error fetching shelters:', error));
    }, []);

    return (
        <div className='App'>
           <div className='column'>
                <h1>Available Shelters</h1>
                    <div className="Shelter">
                        <ul>
                        {shelters.map((shelter, index) => (
                            <li key={index}>
                            <strong>{shelter.LOCATION_NAME}</strong> - {shelter.LOCATION_ADDRESS} ({shelter.UNOCCUPIED_BEDS} beds)
                            </li>
                         ))}
                        </ul>
                    </div>
            </div>
            <div className='column'>
                <h1>Deaths By Month Within Citywide Shelters</h1>
                    <div className='Deaths'>
                        <ul>
                         {deaths.map((death, index) => (
                            <li key={index}>
                            <strong>{death.Year}</strong> - {death.Month} (Death Male: {death.Male}) - (Death Female: {death.female})
                            </li>
                        ))}
                        </ul>
                    </div>
             </div>
        </div>
    );
}

export default App;

