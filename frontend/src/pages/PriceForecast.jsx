import React, { useEffect, useState } from "react";
import "./PriceForecast.css";

const PriceForecast = () => {
  const [location, setLocation] = useState({ state: "", district: "" });
  const [prices, setPrices] = useState([]);
  const [filteredPrices, setFilteredPrices] = useState([]);
  const [commodityList, setCommodityList] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Reverse geocoding
        const locRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`);
        const locData = await locRes.json();
        console.log(locData)
        const state = locData.address.state || "Unknown";
        const district = locData.address.state_district

        setLocation({ state, district });

        const priceRes = await fetch(
          `http://127.0.0.1:5000/get-prices?state=${state}&district=${district}`
        );
        
                const priceData = await priceRes.json();
        setPrices(priceData);

        const allCommodities = [...new Set(priceData.map(item => item.commodity))];
        setCommodityList(allCommodities);
        setFilteredPrices(priceData.slice(0, 10)); // default top 10
        setLoading(false);
      },
      (err) => {
        console.error("Location access denied", err);
        setLoading(false);
      }
    );
  }, []);

  const handleCommodityChange = (e) => {
    const selected = e.target.value;
    setSelectedCommodity(selected);
    if (selected === "") {
      setFilteredPrices(prices.slice(0, 10));
    } else {
      const filtered = prices.filter(item => item.commodity === selected);
      setFilteredPrices(filtered);
    }
  };

  return (
    <div className="forecast-container">
      <h2 className="forecast-title">
        🧺 Mandi Prices in {location.district}, {location.state}
      </h2>

      {loading ? (
        <p className="loading-text">Loading prices...</p>
      ) : prices.length === 0 ? (
        <p className="no-data">No data available for your region.</p>
      ) : (
        <>
          <div className="dropdown-section">
            <label htmlFor="commodity">Filter by Commodity:</label>
            <select id="commodity" value={selectedCommodity} onChange={handleCommodityChange}>
              <option value="">-- Show Top Commodities --</option>
              {commodityList.map((commodity, idx) => (
                <option key={idx} value={commodity}>
                  {commodity}
                </option>
              ))}
            </select>
          </div>

          <div className="table-wrapper">
            <table className="price-table">
              <thead>
                <tr>
                  <th>Commodity</th>
                  <th>Market</th>
                  <th>Modal Price</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.map((item, index) => (
                  <tr key={index}>
                    <td>{item.commodity}</td>
                    <td>{item.market}</td>
                    <td>{item.modal_price}</td>
                    <td>{item.min_price}</td>
                    <td>{item.max_price}</td>
                    <td>{item.arrival_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PriceForecast;
