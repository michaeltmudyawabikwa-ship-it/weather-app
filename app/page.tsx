'use client';
import {WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiHumidity, WiStrongWind } from "react-icons/wi";
import {useState, useEffect} from 'react';
import { ImInsertTemplate } from "react-icons/im";

export default function Home() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ error, setError] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []); 

  const saveFavorites = (cityName: string) => {
    const city = cityName.toLocaleLowerCase();
    if (!favorites.includes(cityName)) {
      const newFavs = [...favorites, cityName];
      setFavorites(newFavs);
      localStorage.setItem('favorites', JSON.stringify(newFavs));
    }
  };

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError('')
    setWeather(null);
    setForecast([]);

    try{
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
      if (!res.ok) throw new Error('OOPS! city not found');
      const data = await res.json();
      setWeather(data);

      const resForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await resForecast.json();

      const dailyForecast = forecastData.list?.filter(item => 
        item.dt_txt.includes("12:00:00")
      ).slice(0, 5) || [];
      setForecast(dailyForecast);

      saveFavorites(cityName);
      
    } catch (err: any)  {
      setError(err.message);
    }
    setLoading(false);
  };

return (
  <main className={`${isDark? 'bg-gray-900 text-white': 'bg-gradient-to-b from-blue-400 to-blue-900 text-white'} min-h-screen p-6`}>

    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold ">Weather App</h1>
      <button onClick={() => setIsDark(! isDark)} className="text-2xl">
        {isDark? '☀️' : '🌙'}
      </button>
    </div>
    
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Enter city name...."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="p-3 rounded-lg text-black w-full"
      />
      <button onClick={() => fetchWeather(city)} className="bg-white text-blue-900 px-4  rounded-lg font-bold">
        {loading? 'Loading....' : 'Search'}
      </button>
    </div>

    <div className="flex gap-2 flex-wrap mb-4">
      {favorites.map(fav => (
        <button key={fav} onClick={() => fetchWeather(fav)} className="bg-white/20 px-3 py-1 rounded-full text-sm">
          {fav}
        </button>
      ))}
    </div>

    {error && (
      <div className="bg-red-500/30 p-4 rounded-2x text-center mb-4">
        <p className="text-2xl fon-bold">OOPS!</p>
        <p>{error}</p>
      </div>
    )}

{weather && (
  <div className= "mx-auto mb-4">
    {weather.weather[0].main === "Clear" && <WiDaySunny className="text-8xl text-yellow-400 mx-auto" />}
    {weather.weather[0].main === "Clouds" && <WiCloudy className="text-8xl text-gray-400" />}
    {weather.weather[0].main === "Rain" && <WiRain className="text-8xl text-blue-400" />}
    {weather.weather[0].main === "Snow" && <WiSnow className="text-8xl text-white" />}
    {weather.weather[0].main === "Thunderstorm" && <WiThunderstorm className="text-8xl text-purple-400" />}
    {weather.weather[0].main === "Drizzle" && <WiRain className="text-8xl text-blue-300" />}

    <p className="text-6xl font-bold mt-4">{Math.round(weather.main.temp)}°C</p>
    <p className="text-xl capitalize">{weather.weather[0].description}</p>

    <div className="flex justify-around mt-4">
      <p className="flex items-center gap-1"><WiHumidity /> {weather.main.humidity}%</p>
      <p className="flex items-center gap-1"><WiStrongWind /> {weather.main.speed} m/s</p>
    </div>

  </div>
)}
    
      
    

{forecast.length > 0 && (
  <div className="mt-8">
    <h3 className="text-2xl font-bold mb-4">5-Day Forecast</h3>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
    {forecast.map((day, index) => (
      <div key={index} className="bg-white/20 backdrop-blur-md rounded-xl">
      <p className="text-sm font-semibold">
        {new Date(day.dt * 1000).toLocaleDateString('en-US', {weekday: 'short'})}
      </p>
      {day.weather[0].main === "Clear" && <WiDaySunny className="text-8xl text-yellow-400" />}
      {day.weather[0].main === "Clouds" && <WiCloudy className="text-8xl text-gray-400" />}
      {day.weather[0].main === "Rain" && <WiRain className="text-8xl text-blue-400" />}
      {day.weather[0].main === "Snow" && <WiSnow className="text-8xl text-white" />}
      {day.weather[0].main === "Thunderstorm" && <WiThunderstorm className="text-8xl text-purple-400" />}
      <p className="text-lg font-bold">{Math.round(day.main.temp)}°C</p>
      </div>
    ))}
    </div>
  </div>
)}
</main>
);

}


