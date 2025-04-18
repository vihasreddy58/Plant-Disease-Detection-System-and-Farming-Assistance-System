import { useState } from "react";
import axios from "axios";
import "./Predict.css";
import potatoBlight from "../assets/Images/potato blight.jpg";
import potatoLateBlight from "../assets/Images/potato lateblight.jpg";
import SCredRot from "../assets/Images/SCredrot.jpg";
import SCbacterialBlight from "../assets/Images/SCbacterialblight.jpg";
import wheatYellowRust from "../assets/Images/wheat yello rust.jpg";
import wheatBrownRust from "../assets/Images/Wheatbrown rust.jpg";
import riceLeafBlast from "../assets/Images/rice leaf blast.jpg";
import riceBrownSpot from "../assets/Images/rice brown spot.jpg";

function PlantDiseaseDetection() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("potato");

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const analyzeImage = async () => {
        if (!selectedFile) {
            alert("Please upload an image first.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setPrediction(response.data);
        } catch (error) {
            console.error("Error analyzing image:", error);
            alert("Failed to analyze image.");
        }
        setLoading(false);
    };

    const diseases = {
        potato: [
            {
                img: potatoBlight,
                title: "Potato Early Blight",
                description: "A fungal disease caused by *Alternaria solani*, leading to dark brown spots with concentric rings on leaves, eventually causing leaf drop and reduced yield."
            },
            {
                img: potatoLateBlight,
                title: "Potato Late Blight",
                description: "A devastating disease caused by *Phytophthora infestans*, resulting in dark, water-soaked lesions on leaves and stems, often with a white fungal growth on the underside."
            }
        ],
        sugarcane: [
            {
                img: SCredRot,
                title: "Sugarcane Red Rot",
                description: "A fungal disease caused by *Colletotrichum falcatum*, leading to reddish discoloration of the cane’s internal tissues, accompanied by a foul smell and reduced sugar content."
            },
            {
                img: SCbacterialBlight,
                title: "Sugarcane Bacterial Blight",
                description: "A disease caused by *Xanthomonas albilineans*, resulting in yellowish streaks on leaves, wilting, and reduced cane growth, eventually lowering sugar yield."
            }
        ],
        wheat: [
            {
                img: wheatYellowRust,
                title: "Wheat Yellow Rust",
                description: "A fungal disease caused by *Puccinia striiformis*, characterized by yellowish-orange pustules on leaves, leading to reduced photosynthesis and lower grain yield."
            },
            {
                img: wheatBrownRust,
                title: "Wheat Brown Rust",
                description: "A fungal disease caused by *Puccinia triticina*, leading to reddish-brown pustules on leaves, which hinder photosynthesis and reduce crop productivity."
            }
        ],
        rice: [
            {
                img: riceLeafBlast,
                title: "Rice Blast",
                description: "A fungal disease caused by *Magnaporthe oryzae*, leading to diamond-shaped lesions with gray centers on leaves, stems, and panicles, severely affecting rice yield."
            },
            {
                img: riceBrownSpot,
                title: "Rice Brown Spot",
                description: "A fungal disease caused by *Bipolaris oryzae*, resulting in brown, oval spots with gray centers on leaves, causing leaf blight and reducing grain quality."
            }
        ]
    };
    

    return (
        <div className="container">
            <header className="header">
                <h1>Plant Disease Detection</h1>
            </header>
            <section className="uploader-section">
                <h2>Upload Plant Image</h2>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {preview && <img src={preview} alt="Preview" style={{ maxWidth: "100%", height: "auto" }} />}
                <button onClick={analyzeImage} disabled={loading}>{loading ? "Analyzing..." : "Analyze"}</button>
            </section>

            {prediction && (
  <section className="result-section">
    <h2>Prediction Result</h2>
    <p><strong>Disease:</strong> <span className="disease-name">{prediction.disease}</span></p>
    <p><strong>Affected Part:</strong> {prediction.affected_part}</p>

    <h3>Steps to Cure</h3>
    <ol>
      {prediction.steps && prediction.steps.map((step, index) => (
        <li key={index}>{step}</li>
      ))}
    </ol>

    <p><strong>Cure:</strong> {prediction.cure}</p>
    <p><strong>Prevention:</strong> {prediction.prevention}</p>
  </section>
)}


            <section className="disease-section">
                <h2>Common Plant Diseases</h2>
                <div className="plant-tabs">
                    {Object.keys(diseases).map((key) => (
                        <button 
                            key={key} 
                            className={activeTab === key ? "tab-button active" : "tab-button"} 
                            onClick={() => setActiveTab(key)}
                        >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="disease-content">
                    <ul>
                        {diseases[activeTab].map((disease, index) => (
                            <li key={index}>
                                <img src={disease.img} alt={disease.title} width="300" height="300" />
                                <div>
                                    <strong>{disease.title}</strong>
                                    <p>{disease.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="how-it-works-section">
                <h2>How It Works</h2>
                <div className="how-it-works">
                    <div className="step">
                        <div className="circle">1</div>
                        <h3>Upload Photo</h3>
                        <p>Take a clear photo of the affected plant part and upload it.</p>
                    </div>
                    <div className="step">
                        <div className="circle">2</div>
                        <h3>AI Analysis</h3>
                        <p>Our advanced AI model analyzes the image to identify diseases.</p>
                    </div>
                    <div className="step">
                        <div className="circle">3</div>
                        <h3>View Results</h3>
                        <p>Get a detailed report of the detected disease and its symptoms.</p>
                    </div>
                </div>
            </section>

           
        </div>
    );
}

export default PlantDiseaseDetection;
