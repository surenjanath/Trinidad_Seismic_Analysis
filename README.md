# Seismic Monitor v2.1

A professional-grade, real-time seismic monitoring dashboard built with React, TypeScript, and Tailwind CSS. This application visualizes global earthquake data with advanced geospatial mapping, 3D hypocenter visualization, and statistical analytics.

## Features

### 1. Real-Time Dashboard
- **Live Feed**: Displays the latest seismic events with auto-refresh capabilities.
- **Key Metrics**: Instant overview of total events, max magnitude, and average depth.
- **Recent Activity List**: Chronological feed of earthquakes with magnitude indicators.

### 2. Geospatial Intelligence (Live Map)
- **Interactive Map**: Leaflet-based map with dark, satellite, and terrain modes.
- **Tectonic Plates**: Overlay of major tectonic plate boundaries to contextualize events.
- **Magnitude Visualization**: Events sized and colored by magnitude (Green < M3, Yellow M3-5, Orange M5-7, Red > M7).
- **Intensity Zones**: Visual estimation of felt areas for significant events.

### 3. 3D Hypocenter Visualization
- **Subsurface View**: Explore the 3D structure of earthquake clusters.
- **Depth Perception**: Visualizes the relationship between epicenter location and focal depth.
- **Surface Intensity Estimation**: Calculates estimated Modified Mercalli Intensity (MMI) based on magnitude and depth attenuation.
- **Contextual Layers**: Includes 3D coastlines and a water surface plane for geographic reference.

### 4. Advanced Analytics
- **Trend Analysis**: Line charts showing frequency and magnitude trends over time.
- **Depth Distribution**: Scatter plots correlating depth vs. magnitude.
- **Energy Release**: Visualization of cumulative seismic energy release.
- **Gutenberg-Richter Law**: Statistical analysis of magnitude frequency distribution.

### 5. System Configuration
- **Custom Filters**: Filter by magnitude threshold (e.g., >M4.0) and date range (7d, 30d, 90d).
- **Export Data**: Download filtered datasets as CSV for external analysis.
- **Settings**: Configure units (km/mi), notifications, and refresh rates.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons
- **Visualization**: 
  - `react-leaflet` & `leaflet` (2D Maps)
  - `@react-three/fiber` & `@react-three/drei` (3D Visualization)
  - `recharts` (Statistical Charts)
- **Data Handling**: `date-fns` for time manipulation

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Data Sources

- **USGS (United States Geological Survey)**: Primary source for global seismic data.
- **EMSC (European-Mediterranean Seismological Centre)**: Secondary data verification.
- **Fraxen/TectonicPlates**: GeoJSON data for tectonic plate boundaries.

## Screenshots

*(Placeholders for screenshots)*

| Dashboard Overview | 3D Visualization |
|:---:|:---:|
| ![Dashboard](https://placehold.co/600x400/1e293b/white?text=Dashboard+View) | ![3D View](https://placehold.co/600x400/1e293b/white?text=3D+Hypocenter+View) |

| Analytics Suite | Live Map |
|:---:|:---:|
| ![Analytics](https://placehold.co/600x400/1e293b/white?text=Analytics+Charts) | ![Map](https://placehold.co/600x400/1e293b/white?text=Geospatial+Map) |

---

*Developed for educational and monitoring purposes.*
