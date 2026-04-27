// ===== DOM ELEMENTS =====
const cityInput = document.querySelector('.city-input')
const searchBtn = document.querySelector('.search-btn')
const weatherInfoSection = document.querySelector('#weatherInfo')
const notFoundSection = document.querySelector('#notFoundSection')
const searchCitySection = document.querySelector('#searchCitySection')
const countryTxt = document.querySelector('#countryTxt')
const tempTxt = document.querySelector('#tempTxt')
const conditionTxt = document.querySelector('#conditionTxt')
const humidityValueTxt = document.querySelector('#humidityValueTxt')
const windValueTxt = document.querySelector('#windValueTxt')
const feelsLikeValueTxt = document.querySelector('#feelsLikeValueTxt')
const pressureValueTxt = document.querySelector('#pressureValueTxt')
const weatherSummaryImg = document.querySelector('#weatherSummaryImg')
const currentDateTxt = document.querySelector('#currentDateTxt')
const forecastItemsContainer = document.querySelector('#forecastItemsContainer')
const mainContainer = document.querySelector('#mainContainer')

const apiKey = 'c63c398699d8b78634249ca219532690'

// ===== PARTICLE SYSTEM =====
function createParticles() {
    const container = document.getElementById('bgParticles')
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div')
        particle.classList.add('particle')
        const size = Math.random() * 4 + 1
        particle.style.width = size + 'px'
        particle.style.height = size + 'px'
        particle.style.left = Math.random() * 100 + '%'
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's'
        particle.style.animationDelay = (Math.random() * 10) + 's'
        particle.style.opacity = Math.random() * 0.5 + 0.1
        container.appendChild(particle)
    }
}
createParticles()

// ===== THEME SYSTEM =====
const themeToggle = document.getElementById('themeToggle')
const themeIcon = document.getElementById('themeIcon')

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode'
}

// Initialize: check saved preference, else follow system
const savedTheme = localStorage.getItem('skyview-theme')
if (savedTheme) {
    applyTheme(savedTheme)
} else {
    applyTheme(getSystemTheme())
}

// Listen for system theme changes (when no manual override)
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('skyview-theme')) {
        applyTheme(e.matches ? 'light' : 'dark')
    }
})

// Manual toggle
themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || getSystemTheme()
    const next = current === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    localStorage.setItem('skyview-theme', next)
    // Animate the icon
    themeIcon.style.transform = 'rotate(360deg) scale(0)'
    setTimeout(() => { themeIcon.style.transform = 'rotate(0deg) scale(1)' }, 200)
})

// ===== EVENT LISTENERS =====
searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
})

// ===== API FETCH =====
async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`
    const response = await fetch(apiUrl)
    return response.json()
}

// ===== WEATHER ICONS (PNG) =====
function getWeatherIcon(id) {
    if (id >= 200 && id <= 232) return 'thunderstorm.png'
    if (id >= 300 && id <= 321) return 'drizzle.png'
    if (id >= 500 && id <= 531) return 'rain.png'
    if (id >= 600 && id <= 622) return 'snow.png'
    if (id >= 700 && id <= 781) return 'atmosphere.png'
    if (id === 800) return 'clear.png'
    if (id >= 801 && id <= 804) return 'cloud.png'
    return 'cloud.png'
}

// ===== DATE FORMATTER =====
function getCurrentDate() {
    const currentDate = new Date()
    const options = { weekday: 'short', day: '2-digit', month: 'short' }
    return currentDate.toLocaleDateString('en-GB', options)
}

// ===== LOADING STATE =====
function showLoading() {
    let overlay = mainContainer.querySelector('.loading-overlay')
    if (!overlay) {
        overlay = document.createElement('div')
        overlay.className = 'loading-overlay'
        overlay.innerHTML = '<div class="spinner"></div>'
        mainContainer.style.position = 'relative'
        mainContainer.appendChild(overlay)
    }
}

function hideLoading() {
    const overlay = mainContainer.querySelector('.loading-overlay')
    if (overlay) overlay.remove()
}

// ===== UPDATE WEATHER =====
async function updateWeatherInfo(city) {
    showLoading()
    try {
        const weatherData = await getFetchData('weather', city)
        if (parseInt(weatherData.cod) !== 200) {
            hideLoading()
            showDisplaySection(notFoundSection)
            return
        }

        const {
            name: country,
            main: { temp, humidity, feels_like, pressure },
            weather: [{ id, main }],
            wind: { speed }
        } = weatherData

        countryTxt.textContent = country
        tempTxt.textContent = Math.round(temp) + ' °C'
        conditionTxt.textContent = main
        humidityValueTxt.textContent = humidity + '%'
        windValueTxt.textContent = speed + ' M/s'
        feelsLikeValueTxt.textContent = Math.round(feels_like) + ' °C'
        pressureValueTxt.textContent = pressure + ' hPa'
        currentDateTxt.textContent = getCurrentDate()
        weatherSummaryImg.src = `image/${getWeatherIcon(id)}`

        await updateForecastsInfo(city)
        hideLoading()
        showDisplaySection(weatherInfoSection)
    } catch (error) {
        console.error('Error fetching weather:', error)
        hideLoading()
        showDisplaySection(notFoundSection)
    }
}

// ===== UPDATE FORECAST =====
async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city)
    const timeTaken = '12:00:00'
    const todayDate = new Date().toISOString().split('T')[0]
    forecastItemsContainer.innerHTML = ''

    forecastsData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) &&
            !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastItems(forecastWeather)
        }
    })
}

function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData

    const dateTaken = new Date(date)
    const dateOption = { day: '2-digit', month: 'short' }
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption)

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="image/${getWeatherIcon(id)}" class="forecast-item-img" alt="Forecast">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem)
}

// ===== SHOW/HIDE SECTIONS =====
function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(sec => sec.style.display = 'none')
    section.style.display = 'block'

    // Re-trigger animations
    section.style.animation = 'none'
    section.offsetHeight // reflow
    section.style.animation = ''
}
