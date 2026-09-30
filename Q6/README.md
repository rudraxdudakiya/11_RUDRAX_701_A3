# Question 6: Call Any Free API for a Useful Utility from Frontend and Backend

This project demonstrates how to consume **100% Free Public APIs** (requiring no API keys or paid accounts) for two practical, real-world utilities:

1. **Backend API Call (Node.js / Express)**: Real-time Global Weather Forecast Utility using the **Open-Meteo API**.
2. **Frontend API Call (Browser `fetch()`)**: Real-time Global Currency Converter Utility using the **ExchangeRate-API**.

---

## 🌟 Architecture & Utilities Explained

### 1. Backend API Call: Live Weather Utility
- **External Public API**: [Open-Meteo Free Forecast API](https://open-meteo.com/) (No API Key Required).
- **Backend Flow**:
  1. Client sends a request to local Express endpoint: `GET /api/weather?city=Ahmedabad`.
  2. Express server uses server-side `fetch()` to query Open-Meteo Geocoding to translate the city name into coordinates (`latitude`, `longitude`).
  3. Express server queries Open-Meteo Meteorological API for live weather, temperature, humidity, wind speed, and precipitation.
  4. Server transforms raw WMO weather codes into human-readable descriptions and emojis (☀️, 🌧️, ⛅), tracks response latency, and returns formatted JSON.
- **Why Call via Backend in Industry?**:
  - Hides sensitive third-party API keys and secrets.
  - Avoids browser CORS (Cross-Origin Resource Sharing) restrictions.
  - Allows server-side response caching (e.g., Redis) to conserve API quotas.
  - Sanitizes and structures third-party responses before client delivery.

---

### 2. Frontend API Call: Live Currency Converter Utility
- **External Public API**: [Open ExchangeRate API](https://open.er-api.com/) (No API Key Required).
- **Frontend Flow**:
  1. Client browser JavaScript executes native `fetch('https://open.er-api.com/v6/latest/{currency}')`.
  2. External API returns live rates with `Access-Control-Allow-Origin: *` headers.
  3. Client calculates currency conversions (`amount * rate`) and updates the DOM immediately without putting load on our own backend server.
- **Why Call via Frontend in Industry?**:
  - Zero computational and bandwidth load on your backend server.
  - Distributed requests directly from user devices.
  - Highly responsive for public, read-only utilities.

---

## 🚀 How to Run

1. Open your terminal and navigate to `Q6`:
   ```powershell
   cd d:\Sem_7\701-fullstack\Asiignment-3\Q6
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start the application:
   ```powershell
   npm start
   ```
   *(or `node server.js`)*

4. Open your browser:
   👉 **`http://localhost:3006`**

---

## 🔍 Features in UI

- **Interactive Weather Search**: Search any city worldwide or click quick preset chips (Ahmedabad, Mumbai, Delhi, London, Tokyo).
- **Interactive Currency Converter**: Convert between USD, EUR, GBP, INR, JPY, CAD, AUD, AED with live rates and a ⇄ swap button.
- **Code & Payload Inspectors**: Expand the dropdown under each utility to inspect the raw JSON response and copy it with one click.
- **Architectural Comparison Table**: Detailed comparison comparing Backend vs. Frontend API consumption.
