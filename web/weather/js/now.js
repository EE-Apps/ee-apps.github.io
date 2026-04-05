// DOM - используем функции для отложенного поиска элементов
const getNOWtemperatureElement = () => document.querySelector("#home .page-header h1")
/*const getNOWwindSpeedElement = () => document.getElementById("wind-speed")
const getNOWhumidityElement = () => document.getElementById("humidity")
const getNOWpressureElement = () => document.getElementById("pressure")*/
const getNOWwindSpeedElement = () => document.querySelector("#home .page-header #wenow .wind")
const getNOWhumidityElement = () => document.querySelector("#home .page-header #wenow .humidity")
const getNOWpressureElement = () => document.querySelector("#home .page-header #wenow .pressure")

const backgroundWeatherIcons = {
    0: "sun", 1: "cloudy", 2: "cloudy", 3: "cloudy",
    45: "fog", 48: "fog",
    51: "rain", 53: "rain", 55: "rain",
    56: "rain", 57: "rain",
    61: "rain", 63: "rain", 65: "rain",
    66: "rain", 67: "rain",
    71: "snow", 73: "snow", 75: "snow", 77: "snow",
    80: "rain", 81: "rain", 82: "rain",
    85: "snow", 86: "snow",
    95: "thunderstorm", 96: "thunderstorm", 99: "thunderstorm",
};

const hPaToMm = hPa => (hPa * 0.75006375541921).toFixed(1);
const kmhToMs = kmh => (kmh / 3.6).toFixed(1);

/**
 * Использует объект current из общего ответа Open-Meteo
 */
function NOWrenderCurrent(current) {
    if (!current) return;

    if (!document.getElementById('wenow')) {
        const wenow = document.createElement('div')
        wenow.id = 'wenow'
        document.querySelector("#home .page-header").appendChild(wenow)

        const wind = document.createElement('div')
        wind.className = 'row'
        wind.innerHTML = `<img src="img/wind.svg" class="detalis-ico"><h2 class="wind"></h2>`
        const humidity = document.createElement('div')
        humidity.className = 'row'
        humidity.innerHTML = `<img src="img/humidity.svg" class="detalis-ico"><h2 class="humidity"></h2>`
        const pressure = document.createElement('div')
        pressure.className = 'row'
        pressure.innerHTML = `<img src="img/pressure.svg" class="detalis-ico"><h2 class="pressure"></h2>`

        wenow.appendChild(wind)
        wenow.appendChild(humidity)
        wenow.appendChild(pressure)
    }

    const tempEl = getNOWtemperatureElement();
    const windEl = getNOWwindSpeedElement();
    const humidEl = getNOWhumidityElement();
    const pressEl = getNOWpressureElement();

    if (!tempEl || !windEl || !humidEl || !pressEl) {
        console.warn('Элементы для отображения текущей погоды ещё не инициализированы');
        return;
    }

    tempEl.textContent = `${current.temperature_2m}°`;
    windEl.textContent = `${kmhToMs(current.wind_speed_10m)} м/с`;
    humidEl.textContent =
        current.relative_humidity_2m != null ? `${current.relative_humidity_2m}%` : (isRuLang ? 'н/д' : 'unknow');
    pressEl.textContent =
        current.surface_pressure != null
            ? `${hPaToMm(current.surface_pressure)} ${isRuLang ? 'мм рт. ст.' : 'mmHg Art.'}`
            : "н/д";

    setBackground(backgroundWeatherIcons[current.weather_code] || "default");

}
