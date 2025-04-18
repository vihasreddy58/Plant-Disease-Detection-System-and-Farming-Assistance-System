import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PesticideFinder.css';

const PesticideFinder = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/pesticides')
      .then(res => {
        setData(res.data);
        setFiltered(res.data);
      });
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFiltered(data.filter(item =>
      item.crop.toLowerCase().includes(value)
    ));
  };

  return (
    <div>
      <header>
        <h1>Pesticide Finder 🌿</h1>
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search by crop..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </header>

      <main className="card-container">
        {filtered.map((item, idx) => (
          <div className="card" key={idx}>
            <h3>{item.crop} - {item.disease}</h3>
            <p><strong>Pesticide:</strong> {item.pesticide}</p>
            <button className="view-details" onClick={() => setSelected(item)}>
              View Details
            </button>
          </div>
        ))}
      </main>

      {/* Modal */}
      {selected && (
  <div className="modal" onClick={() => setSelected(null)}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <span className="closeBtn" onClick={() => setSelected(null)}>&times;</span>
      <h2>{selected.crop} - {selected.disease}</h2>
      <p><strong>Pesticide:</strong> {selected.pesticide}</p>

      <strong>Application:</strong>
      <ul>
        {selected.application.split(/(?=\d+\.)/).map((step, i) => (
          <li key={i}>{step.trim()}</li>
        ))}
      </ul>

      <strong>Precaution:</strong>
      <ul>
        {selected.precaution.split(/(?=\d+\.)/).map((item, i) => (
          <li key={i}>{item.trim()}</li>
        ))}
      </ul>
    </div>
  </div>
)}

    </div>
  );
};

export default PesticideFinder;
