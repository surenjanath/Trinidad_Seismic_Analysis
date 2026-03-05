
export interface SeismicEvent {
  id: string;
  date: string;
  cause: string;
  location: string;
  description: string;
  lat: number;
  lon: number;
  data_type: string;
  type: string;
  magnitude?: number;
  depth?: number;
}

const API_URL = "https://map.uwiseismic.com/data.php?data=EQ";

export const fetchSeismicData = async (): Promise<SeismicEvent[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Process data to map new format to SeismicEvent interface
    return data.map((event: any, index: number) => {
      // Parse magnitude
      const magnitude = parseFloat(event.magnitude) || 0;
      
      // Parse date
      // Format: "2026-03-02 06:07 PM"
      let dateStr = event.timestamp_utc;
      try {
        // Try to create a valid ISO string for sorting
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            dateStr = d.toISOString();
        }
      } catch (e) {
        console.warn("Failed to parse date:", dateStr);
      }

      // Clean up location/nearby_cities
      // "70 km NNW of Basseterre, Saint Kitts and Nevis~146 km NW of Brades..."
      let location = event.nearby_cities ? event.nearby_cities.replace(/~/g, ', ').replace(/, $/, '') : event.location;
      // If nearby_cities is empty or just ~, fallback to coordinates string
      if (!location || location.trim() === '') {
          location = `${event.lat.toFixed(2)}° N, ${Math.abs(event.lon).toFixed(2)}° W`;
      }

      return {
        id: event.name || `event-${index}-${Date.now()}`,
        date: dateStr,
        cause: event.details || 'Unknown',
        location: location,
        description: event.details || '',
        lat: parseFloat(event.lat),
        lon: parseFloat(event.lon),
        data_type: event.data_type || 'eq',
        type: event.data_type || 'eq',
        magnitude: magnitude,
        depth: parseFloat(event.depth) || 0,
      };
    });
  } catch (error) {
    console.error("Failed to fetch seismic data:", error);
    return [];
  }
};
