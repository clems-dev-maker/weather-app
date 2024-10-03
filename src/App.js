import React, { useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchLocation, faMapMarkerAlt, faStar, faTrash } from '@fortawesome/free-solid-svg-icons';
function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([])

  const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY; // Remplacez par votre clé OpenWeatherMap

  // Ajouter une ville aux favoris
  const addFavorite = (city) => {
    if (!favorites.includes(city)) {
      const newFavorites = [...favorites, city];
      setFavorites(newFavorites);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
    }
  };

  // Supprimer une ville des favoris
  const removeFavorite = (city) => {
    const newFavorites = favorites.filter((fav) => fav !== city);
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const getWeatherByCity = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      setWeatherData(response.data);
      setError("");
      getForecast(response.data.coord.lat, response.data.coord.lon);
    } catch (err) {
      setError("Ville non trouvée. Veuillez réessayer.");
      setWeatherData(null);
      setForecastData(null);
    }
  };

  const getWeatherByLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          setWeatherData(response.data);
          setError("");
          getForecast(latitude, longitude);
        } catch (err) {
          setError("Erreur lors de la récupération des données météo.");
          setWeatherData(null);
          setForecastData(null);
        }
      });
    } else {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  const getForecast = async (lat, lon) => {
    try {
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      setForecastData(forecastResponse.data);
    } catch (err) {
      setError("Erreur lors de la récupération des prévisions.");
      setForecastData(null);
    }
  };

  return (
    <div style={{backgroundColor: "#5AB2FF"}} className="d-flex flex-column min-vh-100">
      {/* Barre de navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark" >
        <div className="container">
          <a className="navbar-brand" href="/">Météo App</a>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="container mt-4 flex-grow-1">
        <div className="text-center">
          <h1 className="mb-4">Application Météo</h1>
          <div className="d-flex justify-content-center mb-4">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Entrez le nom de la ville"
              className="form-control w-50"
            />
            <button onClick={getWeatherByCity} className="btn btn-primary mx-2">
              <FontAwesomeIcon icon={faSearchLocation} /> Obtenir la météo
            </button>
            <button onClick={getWeatherByLocation} className="btn btn-secondary">
              <FontAwesomeIcon icon={faMapMarkerAlt} /> Localisation actuelle
            </button>
          </div>

          {error && <p className="text-danger">{error}</p>}

          {weatherData && (
            <div className="card p-4 mb-4" style={{backgroundColor: "#CAF4FF"}}>
              <h2>{weatherData.name}</h2>
              
              <p>Température : {weatherData.main.temp} °C</p>
              <p>Météo : {weatherData.weather[0].description}</p>
              {/* Icône météo */}
              <img
                src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt="Icône météo"
              />
              <p>Humidité : {weatherData.main.humidity} %</p>
              <p>Vitesse du vent : {weatherData.wind.speed} m/s</p>
              <button
                  onClick={() => addFavorite(weatherData.name)}
                  className="btn btn-warning"
                >
                  <FontAwesomeIcon icon={faStar} /> Ajouter aux favoris
              </button>
            </div>
          )}

          {/* Affichage des favoris */}
          {favorites.length > 0 && (
            <div>
              <h3>Villes favorites</h3>
              <ul className="list-group">
                {favorites.map((favorite, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <span onClick={() => getWeatherByCity(favorite)} style={{ cursor: "pointer" }}>
                      {favorite}
                    </span>
                    <button
                      onClick={() => removeFavorite(favorite)}
                      className="btn btn-danger btn-sm"
                    >
                      <FontAwesomeIcon icon={faTrash} /> Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {forecastData && (
            <div>
              <h3>Prévisions sur 5 jours</h3>
              <div className="row">
                {forecastData.list
                  .filter((_, index) => index % 8 === 0)
                  .map((forecast, index) => (
                    <div key={index} className="col-md-2 mb-4">
                      <div className="card p-3"  style={{backgroundColor: "#CAF4FF"}}>
                        <p>{new Date(forecast.dt * 1000).toLocaleDateString()}</p>
                        <p>Température : {forecast.main.temp} °C</p>
                        <p>Météo : {forecast.weather[0].description}</p>
                        {/* Icône météo pour les prévisions */}
                        <img
                          src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                          alt="Icône météo"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <p>&copy; 2024 Météo App. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

export default App;
