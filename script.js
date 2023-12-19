import config from "./config.js";

document.addEventListener("DOMContentLoaded", function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log(latitude, ", ", longitude);
        const defaultCity = await getCityName(latitude, longitude);

        document.getElementById("cityInput").value = defaultCity;

        await getWeather();
      },
      function (error) {
        console.error("Error getting user's location:", error);

        getWeatherDefault();
      }
    );
  } else {
    getWeatherDefault();
  }
});

async function getCityName(latitude, longitude) {
  const apiKey = config.openCageApiKey;
  const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const cityName = data.results[0].components.city;
      return cityName;
    } else {
      console.error("No results found for reverse geocoding.");
      return "London";
    }
  } catch (error) {
    console.error("Error during reverse geocoding API request:", error);
    return "London";
  }
}

async function getWeatherDefault() {
  const defaultCity = "London";
  document.getElementById("cityInput").value = defaultCity;
  await getWeather();
}

async function getWeather() {
  const apiKey = config.weatherBitApiKey;
  const city = document.getElementById("cityInput").value;

  const apiUrl = `https://api.weatherbit.io/v2.0/current?city=${city}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const temperature = data.data[0].temp;
    const humidity = data.data[0].rh;
    const windSpeed = data.data[0].wind_spd;
    const weatherIcon = data.data[0].weather.icon;
    const weatherDescription = data.data[0].weather.description;

    async function getIconUrl(weatherIcon) {
      return new Promise((resolve) => {
        const url = `https://www.weatherbit.io/static/img/icons/${weatherIcon}.png`;
        resolve(url);
      });
    }

    const iconUrl = await getIconUrl(weatherIcon);

    const weather_icon = document.getElementById("weather-icon");
    const temp = document.getElementById("temperature");
    const description = document.getElementById("weather-description");
    const cityName = document.getElementById("city-name");
    const hmdt = document.getElementById("humidity");
    const wind = document.getElementById("wind-speed");

    temp.innerHTML = ` ${temperature} °C`;
    hmdt.innerHTML = `<p> ${humidity}% </p>`;
    wind.innerHTML = `<p> ${windSpeed}m/s </p>`;
    cityName.innerHTML = ` ${city}`;
    description.innerHTML = ` ${weatherDescription}`;
    weather_icon.innerHTML = `<img src="${iconUrl}" alt="Weather Icon" />`;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}
