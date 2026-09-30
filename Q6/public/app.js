// =========================================================================
// 1. BACKEND API CALL: Live Weather Utility
// Calls our local Express backend endpoint (/api/weather?city=...)
// The Express server consumes the free Open-Meteo API and returns clean data
// =========================================================================
document.getElementById('btnWeather').addEventListener('click', async () => {
  const city = document.getElementById('cityInput').value.trim();
  const resultDiv = document.getElementById('weatherResult');

  if (!city) {
    alert('Please enter a city name.');
    return;
  }

  resultDiv.style.display = 'block';
  resultDiv.innerHTML = 'Loading weather data from Express backend...';

  try {
    const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      resultDiv.innerHTML = `<span style="color: red;">Error: ${data.message || 'Failed to fetch weather'}</span>`;
      return;
    }

    const { location, weather } = data;
    resultDiv.innerHTML = `
      <h3>Weather in ${location.city}, ${location.country}</h3>
      <p><strong>Temperature:</strong> ${weather.temperature} ${weather.unit} (Feels like: ${weather.feelsLike} ${weather.unit})</p>
      <p><strong>Condition:</strong> ${weather.conditionText}</p>
      <p><strong>Humidity:</strong> ${weather.humidity} ${weather.humidityUnit}</p>
      <p><strong>Wind Speed:</strong> ${weather.windSpeed} ${weather.windSpeedUnit}</p>
      <p style="font-size: 12px; color: gray; margin-top: 8px;">
        &rarr; <strong>Called via Backend:</strong> Express server queried <code>https://api.open-meteo.com</code> on server-side.
      </p>
    `;
  } catch (err) {
    resultDiv.innerHTML = `<span style="color: red;">Backend Error: ${err.message}</span>`;
  }
});

// =========================================================================
// 2. FRONTEND API CALL: Currency Converter Utility
// Browser directly calls free public ExchangeRate API (no API key needed)
// =========================================================================
document.getElementById('btnConvert').addEventListener('click', async () => {
  const amount = parseFloat(document.getElementById('usdAmount').value) || 1;
  const target = document.getElementById('targetCurrency').value;
  const resultDiv = document.getElementById('currencyResult');

  resultDiv.style.display = 'block';
  resultDiv.innerHTML = 'Fetching live currency rates from frontend API...';

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();

    if (!res.ok || data.result !== 'success') {
      resultDiv.innerHTML = `<span style="color: red;">Failed to retrieve currency rates.</span>`;
      return;
    }

    const rate = data.rates[target];
    const converted = (amount * rate).toFixed(2);

    resultDiv.innerHTML = `
      <h3>Conversion Result</h3>
      <p><strong>${amount} USD</strong> = <strong>${converted} ${target}</strong></p>
      <p>Current Exchange Rate: 1 USD = ${rate} ${target}</p>
      <p style="font-size: 12px; color: gray; margin-top: 8px;">
        &rarr; <strong>Called via Frontend:</strong> Direct browser <code>fetch('https://open.er-api.com/v6/latest/USD')</code>.
      </p>
    `;
  } catch (err) {
    resultDiv.innerHTML = `<span style="color: red;">Frontend Error: ${err.message}</span>`;
  }
});

// =========================================================================
// 3. FRONTEND API CALL: Random Joke Utility
// Browser directly calls free public Official Joke API
// =========================================================================
document.getElementById('btnJoke').addEventListener('click', async () => {
  const resultDiv = document.getElementById('jokeResult');

  resultDiv.style.display = 'block';
  resultDiv.innerHTML = 'Fetching random joke from frontend API...';

  try {
    const res = await fetch('https://official-joke-api.appspot.com/random_joke');
    const data = await res.json();

    resultDiv.innerHTML = `
      <p><strong>Question:</strong> ${data.setup}</p>
      <p><strong>Answer:</strong> <em>${data.punchline}</em></p>
      <p style="font-size: 12px; color: gray; margin-top: 8px;">
        &rarr; <strong>Called via Frontend:</strong> Direct browser <code>fetch('https://official-joke-api.appspot.com/random_joke')</code>.
      </p>
    `;
  } catch (err) {
    resultDiv.innerHTML = `<span style="color: red;">Frontend Error: ${err.message}</span>`;
  }
});
