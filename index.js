document.addEventListener('DOMContentLoaded', () => {
  const apiKey = '4DNL8K8ZY2HK39ADCMH3KJRFQ';



  async function getData() {
    const locationInput = document.getElementById('location');
    const location = locationInput.value;
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=${apiKey}&contentType=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log('getData: ', data);
      displayWeatherData(data);
      formatResolvedAddress(data.resolvedAddress);
      displayNextDaysForecast(data);
      displayNext10Hours(data);

    } catch (error) {
      console.error('getData: ', error);
    }
  }





  function displayNextDaysForecast(data) {

    // Select all forecast items for the next days
    const nextdayForecastItems = document.querySelectorAll('.nextday-forecast-item');
    
    // Iterate over each forecast item
    nextdayForecastItems.forEach((foreCastItem, index) => {
      
      // Format and display the date
      const dateElement = foreCastItem.querySelector('.exact-date');
      const date = new Date(data.days[index].datetimeEpoch * 1000);
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      const dayNumber = date.getDate();
      const nth = (dayNumber > 3 && dayNumber < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th'][dayNumber % 10];
      dateElement.innerHTML = `${dayName}, ${dayNumber}${nth}`;
      
      // Format and display the weather description
      const descriptionElement = foreCastItem.querySelector('.weather-description');
      descriptionElement.innerHTML = `<b>${formatResolvedForecastDescription(data.days[index].conditions)}</b>`;
      
      // Retrieve and display the weather icon
      const iconToDisplay = retrieveIconSet(formatResolvedForecastDescription(data.days[index].conditions));
      const iconElement = foreCastItem.querySelector('.icon');
      iconElement.src = `./${iconToDisplay}`;
    
      
      // Display the maximum temperature
      const maxTempElement = foreCastItem.querySelector('.minmax-temp > .temperature:first-child');
      const roundedMaxTempElement = data.days[index].tempmax.toFixed(0);  
      maxTempElement.innerHTML = '<img src="./high.png" class="extremesTempIcon" alt="">' + roundedMaxTempElement + '<span>&deg;C</span>';

        // Display the minimum temperature
        const minTempElement = foreCastItem.querySelector('.minmax-temp > .temperature:last-child');
        const roundedMinTempElement = data.days[index].tempmin.toFixed(0);
        minTempElement.innerHTML = '<img src="./low.png" class="extremesTempIcon" alt="">' + roundedMinTempElement + '<span>&deg;C</span>';


    });
  }
  



function formatResolvedForecastDescription(description) {
  const splitDescription = description.split(',');
  let formattedDescription;
  if (splitDescription.length > 1) {
    formattedDescription = splitDescription[0].trim();
  } else {
    formattedDescription = description;
  }
  return formattedDescription;
}
    function formatResolvedAddress(resolvedAddress) {
    const splitAddress = resolvedAddress.split(',');
    console.log(splitAddress);
    let formattedAddress;
    if (splitAddress.length > 2) {
      formattedAddress =  `
      <h2 class="location-name">
        ${splitAddress[0]}<br>${splitAddress[2]}
      </h2>
    `
      formattedAddress = formattedAddress.trim();
      const locationNameElement = document.querySelector('.location-name');
      locationNameElement.innerHTML = formattedAddress;
    } else {
      const locationNameElement = document.querySelector('.location-name');
      locationNameElement.textContent = resolvedAddress;
    }
  }

  


  async function initialLoad() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&key=${apiKey}&contentType=json`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          displayWeatherData(data);
          const currentDateElement = document.querySelector('.current-date');
          const today = new Date();
          const options = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          };
          const formattedDate = today.toLocaleString('en-US', options);
          currentDateElement.textContent = formattedDate;

        } catch (error) {
          console.error('initialLoad: ', error);
        }
      });
    }
  }

  initialLoad();

  document.getElementById('search-button').addEventListener('click', getData);

  function displayWeatherData(data) {
    const videoGroups = [
        // Cloudy-related weather conditions
        ['Sky Coverage Increasing', 'Sky Coverage Decreasing', 'Sky Unchanged', 'Overcast', 'Partially cloudy', 'Mist', 'Fog', 'Freezing Fog', 'Smoke or Haze'],

        // Clear-related weather conditions
        ['Clear'],

        // Rain-related weather conditions
        ['Rain', 'Heavy Rain', 'Light Rain', 'Rain Showers', 'Heavy Drizzle/Rain', 'Light Drizzle/Rain', 'Drizzle', 'Heavy Drizzle', 'Light Drizzle', 'Hail', 'Hail Showers', 'Precipitation in Vicinity'],

        // Snow-related weather conditions
        ['Heavy Snow', 'Light Snow', 'Snow', 'Snow Showers', 'Snow and Rain Showers', 'Heavy Freezing Drizzle/Freezing Rain', 'Light Freezing Drizzle/Freezing Rain', 'Freezing Drizzle/Freezing Rain', 'Heavy Freezing Rain', 'Light Freezing Rain', 'Ice'],

        // Sun-related (or unusual) conditions
        ['Thunderstorm', 'Thunderstorm Without Precipitation', 'Lightning Without Thunder', 'Dust Storm', 'Funnel Cloud/Tornado', 'Squalls']
    ];

    const videoSource = {
        0: './Cloudy.mp4',
        1: './Clear.mp4',
        2: './Rain.mp4',
        3: './Snowy.mp4',
        4: './Sun.mp4',
    };

    // Find the appropriate video index based on the weather condition
    let videoIndex = videoGroups.findIndex(group => group.includes(data.currentConditions.conditions));
    
    // Default to a specific video if no match is found (optional)
    if (videoIndex === -1) {
        videoIndex = 1; // Default to "Clear" video, or change as needed
    }

    // Select the video element itself (not the source)
    const videoElement = document.querySelector('.background-video');
    if (videoElement) {
        // Set the source URL directly on the video element
        videoElement.src = videoSource[videoIndex];
        
        // Reload the video to apply the new source
        videoElement.load();
    }

    // Update temperature display
    const temperatureElement = document.querySelector('.temperature');
    if (temperatureElement) {
        temperatureElement.textContent = data.currentConditions.temp;
    }

    // Update weather condition display
    const footerWeatherConditionElement = document.querySelector('.weatherHeader');
    if (footerWeatherConditionElement) {
        footerWeatherConditionElement.innerText = data.currentConditions.conditions;
    }
}

  


  function displayNext10Hours(data) {

    const now = new Date();
    const roundedTime = Math.round(now / 3600000) * 3600000;
    const currentTimeString = new Date(roundedTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const hours = data.days[0].hours;
    const currentIndex = hours.findIndex(hour => hour.datetime === currentTimeString);
    const hourBoxes = document.querySelectorAll('.hour-box');

    hourBoxes.forEach((hourBox, index) => {
      const hourDataIndex = (currentIndex + index) % 24;
      const standAloneIcon = removeCommas(hours[hourDataIndex].conditions);
      const iconToDisplay = retrieveIconSet(standAloneIcon);
      const iconElement = hourBox.querySelector('.icon');
      iconElement.src = `./${iconToDisplay}`;

      const hourTextElement = hourBox.querySelector('.hour');
      const hourlyTempElement = hourBox.querySelector('.hourly-temp');
      hourTextElement.textContent = hours[hourDataIndex].datetime.slice(0, 5);
      hourlyTempElement.innerHTML = `${hours[hourDataIndex].temp.toFixed(0)}<span>&deg;C</span>`;

    });
  }
  


  function removeCommas(description) {
    const index = description.indexOf(',');
    if (index === -1) {
      return description;
    } else {
      return description.slice(0, index).trim();
    }
  }



  const iconGroups = [
    ['Heavy Snow', 'Light Snow', 'Snow', 'Snow Showers', 'Snow and Rain Showers'],
    ['Heavy Freezing Drizzle/Freezing Rain', 'Light Freezing Drizzle/Freezing Rain', 'Freezing Drizzle/Freezing Rain', 'Freezing Fog', 'Heavy Freezing Rain', 'Light Freezing Rain'],
    ['Rain', 'Heavy Rain', 'Light Rain', 'Rain Showers', 'Heavy Drizzle/Rain', 'Light Drizzle/Rain'],
    ['Drizzle', 'Heavy Drizzle', 'Light Drizzle'],
    ['Thunderstorm', 'Thunderstorm Without Precipitation', 'Lightning Without Thunder'],
    ['Mist', 'Fog', 'Freezing Fog'],
    ['Sky Coverage Increasing', 'Sky Coverage Decreasing', 'Sky Unchanged', 'Overcast', 'Partially cloudy'],
    ['Hail', 'Hail Showers', 'Ice'],
    ['Dust Storm', 'Smoke or Haze'],
    ['Funnel Cloud/Tornado', 'Precipitation in Vicinity', 'Squalls'],
    ['Clear']
  ];
  const iconMap = {
    0: 'Snow.svg',
    1: 'Hail.svg',
    2: 'Rain.svg',
    3: 'Hail.svg',
    4: 'Thunderstorm.svg',
    5: 'Mist.svg',
    6: 'Cloudy.svg',
    7: 'Hail.svg',
    8: 'Tornado.svg',
    9: 'Sun.svg',
    10: 'Sun.svg' // Added a new mapping for the "Clear" condition
  };
  function retrieveIconSet (data){
    const groupIndex = iconGroups.findIndex(group => group.includes(data));
    if (groupIndex === -1) {
      return null;
    }
    return iconMap[groupIndex];

  }


  


});
