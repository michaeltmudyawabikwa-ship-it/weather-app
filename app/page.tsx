'use client';
import {useState, useEffect} from 'react';

export default function Home() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ error, setError] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

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
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
      if (!res.ok) throw new Error('OOPS! city not found');
      const data = await res.json();
      setWeather(data);

      const resForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      const forecastData = await resForecast.json();
      setForecast(forecastData.list.filter((_: any, i: number) => i % 8 === 0).slice(0,5));

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
      <div className="mt-8 bg-white/20 p-6 rounded-2xl backdrop-blur-md">
        <h2 className="text-2xl font-bold">{weather.name}</h2>
        <img
          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
          alt="weather icon"
          className="w-32 h-32 mx-auto"
        />
        <p className="text-6xl font-bold mt-4">{Math.round(weather.main.temp)}°C</p>
        <p className="text-xl capitalize">{weather.weather[0].description}</p>

        <div className="flex justify-around mt-4">
        <p>💧 {weather.main.humidity}%</p>
        <p>💨 {weather.main.speed} m/s</p>
        </div>
      </div>
    )}

    {forecast.length > 0 && (
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">5-Day Forecast</h3>
        {forecast.map((day, i) => (
          <div key={i} className="flex justify-between bg-white/10 p-3 rounded-lg mb-2">
            <p>{new Date(day.dt_text).toLocaleDateString()}</p>
            <p>{day.weather[0].main}</p>
            <p>{Math.round(day.main.temp)}°C</p>
          </div>
        ))}
      </div>
    )}
  </main>
);

}


