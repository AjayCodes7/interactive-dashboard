// Define LatLngExpression type if not imported from a library
type LatLngExpression = [number, number];

export const fetchWeatherData = async (lat: number, lon: number) => {
    const startDate = "2025-07-18";
    const endDate = "2025-07-18";
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m`;

    const res = await fetch(url);
    const data = await res.json();
    return data.hourly;
};

// Calculate centroid of polygon
export const getCentroid = (coords: LatLngExpression[]) => {
    const latLngs = coords as [number, number][];
    let latSum = 0,
        lngSum = 0;
    latLngs.forEach(([lat, lng]) => {
        latSum += lat;
        lngSum += lng;
    });
    return [latSum / latLngs.length, lngSum / latLngs.length];
};
