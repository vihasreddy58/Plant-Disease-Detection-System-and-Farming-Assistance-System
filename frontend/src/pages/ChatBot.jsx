import { useState } from "react";
import axios from "axios";
import "./Chatbot.css";  // Create a new CSS file for styling
import { Send } from "lucide-react";
function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);  // State to toggle chatbot

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { text: input, sender: "user" }];
        setMessages(newMessages);
        setInput("");

        try {
            const response = await axios.post("http://127.0.0.1:5000/chat", { text: input });
            setMessages([...newMessages, { text: response.data.text, sender: "bot" }]);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div>
            {/* Floating Chat Button */}
            <button className="chatbot-btn" onClick={() => setIsOpen(!isOpen)}>
                💬
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-container">
                    <div className="chat-header">
                        <h3>Agri Chatbot</h3>
                        <button onClick={() => setIsOpen(false)}>✖</button>
                    </div>
                    <div className="chat-box">
                        {messages.map((msg, index) => (
                            <div key={index} className={msg.sender === "user" ? "user-message" : "bot-message"}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="input-box">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button onClick={sendMessage} title="Send Message">
    <Send size={18} color="white" />
</button>

                    </div>
                </div>
            )}
        </div>
    );
}

export default Chatbot;
