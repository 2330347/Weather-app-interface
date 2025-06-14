const cityInput = document.querySelector('.city-input')
const searchBtn = document.querySelector('.search-btn')

const weatherInfoSection = document.querySelector('.weather-info')
const notFoundSection = document.querySelector('.not-found')
const searchCitySection = document.querySelector('.search-city')

const countryTxt = document.querySelector('.country-txt')
const tempTxt = document.querySelector('.temp-txt')
const conditionTxt = document.querySelector('.condition-txt')
const humidityValueTxt = document.querySelector('.humidity-value-txt')
const windValueTxt = document.querySelector('.wind-value-txt')
const weatherSummaryImg = document.querySelector('.weather-summary-img')
const currentDateTxt = document.querySelector('.current-date-txt')

const forecastItemsContainers = document.querySelector('.forecast-items-containers')
console.log("Forecast container:", forecastItemsContainers)


const apiKey = 'c63c398699d8b78634249ca219532690'

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})
cityInput.addEventListener('keydown', (event) => {
    if(event.key == 'Enter' &&
        cityInput.value.trim() != ''
    ) {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})

async function getFetchData(endPoint, city){
        const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`


    const response = await fetch(apiUrl)

    return response.json()
}

function getweatherIcon(id) {
    if (id >= 200 && id <= 232) return 'thunderstorm.svg'
    if (id >= 300 && id <= 321) return 'drizzle.svg'
    if (id >= 500 && id <= 531) return 'rain.svg'
    if (id >= 600 && id <= 622) return 'snow.svg'
    if (id >= 700 && id <= 781) return 'atmosphere.svg'
    if (id === 800) return 'clear.svg'
    if (id >= 801 && id <= 804) return 'cloud.svg'
    return 'unknown.svg'
}

function getCurrentDate() {
    const currentDate = new Date()
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    }
    return currentDate.toLocaleDateString('en-GB', options)
}


async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city)
    console.log("Weather data:", weatherData)
    if(parseInt(weatherData.cod) !== 200) {
        console.log("City not found. Showing Not Found section.")
        showDisplaySection(notFoundSection)
        return
    }
    console.log("City found. Showing weather info.")

    const{
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }
    } = weatherData

    countryTxt.textContent = country
    tempTxt.textContent = Math.round(temp) + ' °C'
    conditionTxt.textContent = main
    humidityValueTxt.textContent = humidity + '%'
    windValueTxt.textContent = speed + ' M/s'
    
    currentDateTxt.textContent = getCurrentDate()
    
    console.log("Image Element:", weatherSummaryImg) 
    weatherSummaryImg.src = `image/weather/${getweatherIcon(id)}`

    await updateForecastsInfo(city)
    showDisplaySection(weatherInfoSection)
}

async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city)

    const timeTaken = '12:00:00'
    const todayDate = new Date().toISOString().split('T')[0]
    
    forecastItemsContainers.innerHTML = ''
    forecastsData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) &&
            !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastsItems(forecastWeather)
        }
    })
}

function updateForecastsItems(weatherData) {
    console.log(weatherData)
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData

    const dateTaken = new Date(date)
    const dateOption = {
        day: '2-digit',
        month: 'short'
    }
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption)

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="image/weather/${getweatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `

    forecastItemsContainers.insertAdjacentHTML('beforeend', forecastItem)
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(sec => sec.style.display = 'none')

    section.style.display = 'block'
}

