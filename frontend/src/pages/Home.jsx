import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Microscope,
  MessageSquare,
  Cloud,
  Sprout,
  FileText,
  ShoppingCart,
  Users,
  BarChart,
  Shield,
} from "lucide-react";
import { FaUpload, FaSearch, FaComments, FaStore } from 'react-icons/fa'; // Import icons

import ChatBot from "./ChatBot";
import "./Home.css";

export default function Home() {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        const texts = data.map((ann) => ann.text);
        setAnnouncements(texts);
      })
      .catch((err) => console.error("Failed to fetch announcements:", err));
  }, []);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,pressure_msl,precipitation,weathercode`
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.current) {
                setWeatherData(data.current);
              } else {
                setError("Weather data is unavailable.");
              }
            })
            .catch((error) => setError("Failed to fetch weather data."));
        },
        (error) => {
          setError("Location access denied. Enable location services.");
        }
      );
    } else {
      setError("Geolocation not supported.");
    }
  }, []);

  const weatherDescriptions = {
    0: "Clear sky ☀️",
    1: "Mainly clear 🌤️",
    2: "Partly cloudy ⛅",
    3: "Overcast ☁️",
    45: "Fog 🌫️",
    48: "Depositing rime fog 🌁",
    51: "Light drizzle 🌦️",
    53: "Moderate drizzle 🌧️",
    55: "Dense drizzle 🌧️",
    61: "Light rain ☔",
    63: "Moderate rain 🌧️",
    65: "Heavy rain ⛈️",
    71: "Light snow ❄️",
    73: "Moderate snow ❄️",
    75: "Heavy snow ❄️",
    80: "Light showers 🌦️",
    81: "Moderate showers 🌧️",
    82: "Violent showers ⛈️",
    95: "Thunderstorm ⛈️",
  };

  const features = [
    {
      icon: <Microscope />,
      title: "Plant Disease Detection",
      description: "Upload plant images to identify diseases and get treatment recommendations.",
      link: "/predict",
    },
    {
      icon: <MessageSquare />,
      title: "Farming Chatbot",
      description: "Get instant AI-powered answers to your farming questions.",
      link: "/home",
    },
    {
      icon: <Cloud />,
      title: "Weather Alerts",
      description: "Stay updated with real-time weather forecasts and alerts.",
      link: "/home",
    },
    {
      icon: <Sprout />,
      title: "Pest Control & Pesticide Info",
      description: "Search for pesticides and eco-friendly pest management solutions.",
      link: "/pesticide-finder",
    },
    {
      icon: <ShoppingCart />,
      title: "Farmer's Marketplace",
      description: "Buy and sell agricultural products with other farmers.",
      link: "/marketplace",
    },
    {
      icon: <Users />,
      title: "Expert Consultation",
      description: "Book consultations with experienced agricultural experts.",
      link: "/experts",
    },
    {
      icon: <BarChart />,
      title: "Market Analytics",
      description: "Analyze crop price trends, forecasts, and direct selling options.",
      link: "/price-forecast",
    },
    // {
    //   icon: <Shield />,
    //   title: "Community Forum",
    //   description: "Engage in discussions, ask questions, and share farming tips.",
    //   link: "/discussion",
    // },
  ];

  // Sample data for scrolling information
 
  return (
    <div>
      <section className="hero">
        <div className="overlay"></div>
        <div className="hero-content">
          <h1>Smart Farming System</h1>
          <p>
            Revolutionize farming with AI-powered disease detection, personalized recommendations, and real-time
            weather updates.
          </p>
          <div className="buttons">
            <Link to="/predict" className="btn primary">
              Get Started
            </Link>
            
          </div>
          <div className="weather">
            {error ? (
              <p className="error">{error}</p>
            ) : weatherData ? (
              <div className="weather-card">
                <div className="weather-item">
                  <span className="weather-icon">🌡️</span> {weatherData.temperature_2m}°C
                </div>
                <div className="weather-item">
                  <span className="weather-icon">💧</span> {weatherData.relative_humidity_2m}%
                </div>
                <div className="weather-item">
                  <span className="weather-icon">🌬️</span> {weatherData.wind_speed_10m} km/h
                </div>
                <div className="weather-item">
                  <span className="weather-icon">🌍</span> {weatherData.pressure_msl} hPa
                </div>
                <div className="weather-item">
                  <span className="weather-icon">☔</span> {weatherData.precipitation} mm
                </div>
                <div className="weather-item">
                  <span className="weather-icon">⛅</span>{" "}
                  {weatherDescriptions[weatherData.weathercode] || "Unknown"}
                </div>
              </div>
            ) : (
              <p className="loading">Loading weather data...</p>
            )}
          </div>
        </div>
      </section>
      {/* Scrolling Information Section */}
      <section className="scrolling-info">
        <div className="scrolling-container">
          <div className="scrolling-text">
          {announcements.length === 0 ? (
  <span>Loading announcements...</span>
) : (
  announcements.map((info, index) => <span key={index}>{info}</span>)
)}

          </div>
        </div>
      </section>

      

      <section className="features">
        <h2>Our Features</h2>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link to={feature.link} className="btn explore">
                Explore
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* <section className="testimonials">
        <h2>Success Stories</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>"This system has helped me increase my yield significantly..."</p>
            <p>- John Doe, Farmer</p>
          </div>
          <div className="testimonial-card">
            <p>"The AI-powered disease detection saved my crops..."</p>
            <p>- Jane Smith, Agriculturist</p>
          </div>
        </div>
      </section> */}
      <section className="how-it-works">
  <div className="how-it-works-content"> {/* Added wrapper div */}
    <h2>How It Works</h2>
    <div className="steps-container">
      <div className="step">
        <FaUpload className="step-icon" />
        <h3>Upload Image</h3>
        <p>1. Upload a plant leaf image for disease analysis.</p>
      </div>
      <div className="step">
        <FaSearch className="step-icon" />
        <h3>Disease Detection</h3>
        <p>2. Get AI-generated disease detection and solutions.</p>
      </div>
      <div className="step">
        <FaComments className="step-icon" />
        <h3>Consult Expert</h3>
        <p>3. Chat with AI or consult an agricultural expert.</p>
      </div>
      <div className="step">
        <FaStore className="step-icon" />
        <h3>Use Marketplace</h3>
        <p>4. Use marketplace, weather alerts, and farm insights.</p>
      </div>
    </div>
  </div>
</section>

      <div className="chatbot-container">
        <ChatBot />
      </div>
    </div>
  );
}