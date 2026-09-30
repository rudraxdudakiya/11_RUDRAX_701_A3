require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to map WMO Weather interpretation codes
function decodeWmoWeather(code) {
    const weatherMap = {
        0: { description: 'Clear Sky', icon: '☀️' },
        1: { description: 'Mainly Clear', icon: '🌤️' },
        2: { description: 'Partly Cloudy', icon: '⛅' },
        3: { description: 'Overcast', icon: '☁️' },
        45: { description: 'Foggy', icon: '🌫️' },
        48: { description: 'Depositing Rime Fog', icon: '🌫️' },
        51: { description: 'Light Drizzle', icon: '🌦️' },
        53: { description: 'Moderate Drizzle', icon: '🌦️' },
        55: { description: 'Dense Drizzle', icon: '🌧️' },
        61: { description: 'Slight Rain', icon: '🌧️' },
        63: { description: 'Moderate Rain', icon: '🌧️' },
        65: { description: 'Heavy Rain', icon: '⛈️' },
        71: { description: 'Slight Snow', icon: '🌨️' },
        73: { description: 'Moderate Snow', icon: '🌨️' },
        75: { description: 'Heavy Snow', icon: '❄️' },
        80: { description: 'Rain Showers', icon: '🌦️' },
        81: { description: 'Heavy Rain Showers', icon: '⛈️' },
        95: { description: 'Thunderstorm', icon: '⚡' },
        96: { description: 'Thunderstorm with Slight Hail', icon: '⛈️' },
        99: { description: 'Thunderstorm with Heavy Hail', icon: '⛈️' }
    };
    return weatherMap[code] || { description: 'Moderate Conditions', icon: '🌤️' };
}

// =========================================================================
// BACKEND API CALL: Live Weather Utility (Open-Meteo Free Public API)
// The Node.js Express server acts as the backend consumer and data processor
// =========================================================================
app.get('/api/weather', async (req, res) => {
    const startTime = Date.now();
    const city = req.query.city || 'Mumbai';

    try {
        // Step 1: Backend fetches coordinates from Geocoding Free API
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            return res.status(404).json({
                success: false,
                message: `City '${city}' not found in global geocoding registry.`
            });
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, country, admin1 } = location;

        // Step 2: Backend fetches real-time meteorological data from Open-Meteo Free API
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const current = weatherData.current;
        const condition = decodeWmoWeather(current.weather_code);
        const latencyMs = Date.now() - startTime;

        // Step 3: Backend transforms, filters, and formats the data for client consumption
        const processedResponse = {
            success: true,
            source: 'BACKEND_EXPRESS_API_CALL',
            provider: 'Open-Meteo Free Meteorological API (No Key Required)',
            requestLatency: `${latencyMs} ms`,
            timestamp: new Date().toISOString(),
            location: {
                city: name,
                region: admin1 || '',
                country: country || '',
                latitude,
                longitude,
                timezone: weatherData.timezone
            },
            weather: {
                temperature: current.temperature_2m,
                unit: weatherData.current_units.temperature_2m,
                feelsLike: current.apparent_temperature,
                humidity: current.relative_humidity_2m,
                humidityUnit: weatherData.current_units.relative_humidity_2m,
                windSpeed: current.wind_speed_10m,
                windSpeedUnit: weatherData.current_units.wind_speed_10m,
                precipitation: current.precipitation,
                precipitationUnit: weatherData.current_units.precipitation,
                isDay: current.is_day === 1,
                weatherCode: current.weather_code,
                conditionText: condition.description,
                conditionIcon: condition.icon
            }
        };

        res.json(processedResponse);
    } catch (err) {
        console.error('Backend weather API error:', err);
        res.status(500).json({
            success: false,
            source: 'BACKEND_EXPRESS_API_CALL',
            message: 'Failed to fetch weather data from external API: ' + err.message
        });
    }
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(` Q6 Utility Service running at http://localhost:${PORT}`);
    console.log(` Backend API Endpoint: http://localhost:${PORT}/api/weather?city=Mumbai`);
    console.log(` Frontend UI available at: http://localhost:${PORT}`);
    console.log(`================================================================`);
});
