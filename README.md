# City of Toronto Shelter Dashboard - Client

A React-based web application that provides interactive visualizations and data insights for Toronto's shelter system, housing waitlists, and related social services.

## 🏠 Overview

This client application serves as the frontend for the City of Toronto Shelter Dashboard, offering users an intuitive interface to explore shelter occupancy data, housing waitlist information, system flow metrics, and historical trends. The application features interactive charts, maps, and tabbed navigation for easy data exploration.

## ✨ Features

### 📊 Data Visualizations
- **Shelter Occupancy Charts**: Current occupancy rates and capacity data for 2025
- **Housing Waitlist Analytics**: Centralized waiting list activity for social housing
- **System Flow Metrics**: Toronto Shelter System flow data and statistics
- **Historical Occupancy Data**: Daily shelter occupancy trends from 2020

### 🗺️ Interactive Map
- **Geographic Visualization**: Interactive map showing shelter locations across Toronto
- **Location Details**: Detailed information about each shelter including address and capacity
- **Real-time Data**: Integration with live data from Toronto's Open Data portal

### 🎨 User Interface
- **Responsive Design**: Optimized for desktop and mobile devices
- **Tabbed Navigation**: Easy switching between different data views
- **Modern UI**: Clean, professional interface with intuitive navigation
- **Real-time Updates**: Live data fetching from the backend API

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.0.0
- **Routing**: React Router DOM 7.1.5
- **Charts**: Chart.js 4.4.7 with React Chart.js 2 5.3.0
- **Maps**: Leaflet 1.9.4 with React Leaflet 5.0.0
- **Styling**: CSS3 with custom components
- **Build Tool**: Create React App 5.0.1

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js**: Version 14.0 or higher
- **npm**: Version 6.0 or higher (comes with Node.js)
- **Backend Server**: The companion Express.js server must be running on `localhost:3001`

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd toapi
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Backend Server
Before starting the client, ensure the backend server is running:
```bash
# Navigate to the server directory
cd ../toapiserver
npm install
npm start
```

### 4. Start the Development Server
```bash
# Return to the client directory
cd ../toapi
npm start
```

The application will open in your browser at `http://localhost:3000`.

## 📁 Project Structure

```
src/
├── components/
│   ├── ShelterDashboard.js      # Main dashboard with tabbed interface
│   ├── InteractiveMap.js        # Leaflet-based map component
│   ├── LandingPage.js           # Welcome/landing page
│   └── charts/
│       ├── ShelterOccupancyChart.js
│       ├── HousingWaitlistChart.js
│       ├── ShelterFlowChart.js
│       ├── HistoricalOccupancyChart.js
│       └── ShelterDeathsChart.js
├── data/
│   ├── shelter_coordinates.json # Shelter location data
│   └── updated_shelters.json    # Updated shelter information
├── App.js                       # Main application component with routing
├── App.css                      # Global styles
└── index.js                     # Application entry point
```

## 🔧 Available Scripts

### `npm start`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will reload when you make changes.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run eject`
**Note: This is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time.

## 🌐 API Integration

The client application communicates with the backend server through the following endpoints:

- **GET** `/api/shelter-dashboard` - Fetches comprehensive shelter and housing data

### Data Structure
The API returns data in the following format:
```json
{
  "metadata": [...],
  "data": [
    occupancyData,      // Shelter occupancy information
    waitlistData,       // Housing waitlist data
    flowData,          // System flow metrics
    deathsData,        // Shelter deaths data (optional)
    historicalData     // Historical occupancy data
  ]
}
```

## 🎨 Customization

### Adding New Charts
1. Create a new chart component in the `src/` directory
2. Import and add it to `ShelterDashboard.js`
3. Add a new tab button and case in the `renderContent()` function

### Styling
- Global styles are defined in `App.css`
- Component-specific styles can be added as CSS modules or styled-components
- The application uses a responsive design approach

### Data Sources
The application pulls data from Toronto's Open Data portal through the backend server. Key datasets include:
- Shelter occupancy and capacity data
- Centralized waiting list activity
- Shelter system flow metrics
- Historical occupancy records

## 🚀 Deployment

### Production Build
```bash
npm run build
```

This creates a `build` folder with optimized production files.

### Deployment Options
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload the `build` folder contents
- **Heroku**: Use the buildpack for static sites

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Thomas Gibson** - *Initial work* - [GitHub Profile]

## 🙏 Acknowledgments

- City of Toronto Open Data Portal for providing comprehensive datasets
- React and Chart.js communities for excellent documentation
- Leaflet for powerful mapping capabilities

## 📞 Support

For support, email [your-email@example.com] or create an issue in the repository.

---

**Note**: This application requires the companion backend server to be running for full functionality. Make sure to start the server before running the client application.