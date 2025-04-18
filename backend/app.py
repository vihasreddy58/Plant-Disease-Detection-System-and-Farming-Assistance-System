import os
import io
import numpy as np
from PIL import Image
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv
import google.generativeai as genai
import requests
from flask_pymongo import PyMongo
from datetime import datetime
from bson import ObjectId
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
import csv
import json
load_dotenv()
hugging_face_token = os.getenv('HUGGING_FACE_TOKEN')
gemini_api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=gemini_api_key)

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
MONGO_URI = "mongodb://localhost:27017/agriculture"
client = MongoClient(MONGO_URI)
db = client["AgriSathiDB"]
farmers_collection = db["farmers"]
admins_collection = db["admins"]
def initialize_admin():
    admins_collection.delete_many({"username": "admin"})  # <- clear old entries for testing
    hashed_password = bcrypt.generate_password_hash(os.getenv('ADMIN')).decode('utf-8')
    admins_collection.insert_one({"username": "admin", "password": hashed_password})

initialize_admin()
try:
    model = tf.keras.models.load_model("plant_disease_model.keras", compile=False)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
class_labels = {
    0: "Corn - Common Rust",
    1: "Corn - Gray Leaf Spot",
    2: "Corn - Healthy",
    3: "Corn - Northern Leaf Blight",
    4: "Potato - Early Blight",
    5: "Potato - Healthy",
    6: "Potato - Late Blight",
    7: "Rice - Brown Spot",
    8: "Rice - Healthy",
    9: "Rice - Leaf Blast",
    10: "Rice - Neck Blast",
    11: "Sugarcane - Bacterial Blight",
    12: "Sugarcane - Healthy",
    13: "Sugarcane - Red Rot",
    14: "Wheat - Brown Rust",
    15: "Wheat - Healthy",
    16: "Wheat - Yellow Rust",
}
def preprocess_image(image):
    """Resizes image to (256, 256), normalizes pixel values, and adds batch dimension."""
    try:
        image = image.resize((256, 256))
        image = np.array(image) / 255.0
        image = np.expand_dims(image, axis=0)
        return image
    except Exception as e:
        print(f"Error processing image: {e}")
        return None
users_collection = db["users"]  # Add this near top with other collections

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    mobile = data.get("mobile")
    village = data.get("village")
    password = data.get("password")
    role = data.get("role")

    # Check if mobile number already registered
    existing_user = users_collection.find_one({"mobile": mobile})
    if existing_user:
        return jsonify({"success": False, "message": "Mobile number already registered!"})

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Insert new user with role
    users_collection.insert_one({
        "name": name,
        "mobile": mobile,
        "village": village,
        "password": hashed_password,
        "role": role
    })

    return jsonify({
        "success": True,
        "message": f"{role.capitalize()} registered successfully!"
    })
# Login Route (Admin & Farmer)
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    user_type = data["user"]
    identifier = data["identifier"]
    password = data["password"]

    if user_type == "admin":
        admin = admins_collection.find_one({"username": identifier})
        if admin and bcrypt.check_password_hash(admin["password"], password):
            return jsonify({
                "success": True,
                "message": "Admin login successful!",
                "role": "admin"
            })
        return jsonify({"success": False, "message": "Invalid admin credentials!"})

    elif user_type == "user":
        user = db["users"].find_one({"mobile": identifier})
        if user and bcrypt.check_password_hash(user["password"], password):
            return jsonify({
                "success": True,
                "message": f"{user['role'].capitalize()} login successful!",
                "role": user["role"],
                "user_id": str(user["_id"]),
                "name": user["name"]
            })
        return jsonify({"success": False, "message": "Invalid phone number or password!"})

    return jsonify({"success": False, "message": "Invalid user type!"})

# Plant Disease Prediction
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        processed_image = preprocess_image(image)

        if processed_image is None:
            return jsonify({"error": "Image processing failed"}), 500

        predictions = model.predict(processed_image)
        predicted_class = np.argmax(predictions)
        disease_name = class_labels.get(predicted_class, "Unknown")

        # Load disease info from JSON
        with open("diseases.json", "r") as f:
            disease_data = json.load(f)

        info = disease_data.get(disease_name, {})
        affected_part = info.get("affected_part", "Not specified")
        steps = info.get("steps", [])
        cure = info.get("cure", "Not specified")
        prevention = info.get("prevention", "Not specified")

        return jsonify({
            "disease": disease_name,
            "affected_part": affected_part,
            "steps": steps,
            "cure": cure,
            "prevention": prevention
        })

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": "Prediction failed"}), 500

#  Chatbot Functionality (Google Gemini AI)
conversation_history = []

def get_answer_gemini(question):
    global conversation_history
    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    
    conversation_history.append({"role": "user", "parts": [{"text": question}]})
    
    response = model.generate_content(conversation_history)
    
    if response and hasattr(response, 'text'):
        conversation_history.append({"role": "assistant", "parts": [{"text": response.text}]} )
        return response.text
    else:
        return "I can only assist with agriculture-related queries."

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    text = data.get('text')
    if text:
        response_text = get_answer_gemini(text)
        return jsonify({'text': response_text})
    return jsonify({'text': 'Invalid request'})

API_KEY = "579b464db66ec23bdd000001df526c4244f44d9f7071b809bab8e846"
AGMARKNET_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

@app.route('/get-prices')
def get_prices():
    state = request.args.get("state")
    district = request.args.get("district")  # optional
    #commodities = request.args.getlist("commodities")  # multiple values

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": 40,  # increase to get more records
        "filters[state]": state,
        "filters[district]":district
    }

    # Optional district filter
    #if district:
        #params["filters[district]"] = district

    # Add commodity filters if selected
    # if commodities:
    #     # AGMARKNET API accepts multiple values like this:
    #     # filters[commodity]=Tomato&filters[commodity]=Onion...
    #     for i, commodity in enumerate(commodities):
    #         params[f"filters[commodity][{i}]"] = commodity

    response = requests.get(AGMARKNET_URL, params=params)

    try:
        data = response.json()
        return jsonify(data.get("records", []))
    except Exception as e:
        return jsonify({"error": "Failed to fetch data", "details": str(e)}), 500

# Route: Get All Discussions
@app.route("/api/discussions", methods=["GET"])
def get_all_discussions():
    discussions = db.discussions.find().sort("timestamp", -1)
    result = []
    for d in discussions:
        result.append({
            "_id": str(d["_id"]),
            "title": d["title"],
            "content": d["content"],
            "timestamp": d["timestamp"]
        })
    return jsonify(result)

# Route: Post a New Discussion
@app.route("/api/discussions", methods=["POST"])
def create_discussion():
    data = request.json
    if not data.get("title") or not data.get("content"):
        return jsonify({"error": "Title and content required"}), 400

    new_discussion = {
        "title": data["title"],
        "content": data["content"],
        "timestamp": datetime.utcnow().isoformat()
    }

    inserted = db.discussions.insert_one(new_discussion)
    return jsonify({
        "message": "Discussion posted successfully",
        "id": str(inserted.inserted_id)
    }), 201
# Route: Post a Reply to a Discussion
@app.route("/api/discussions/<discussion_id>/reply", methods=["POST"])
def post_reply(discussion_id):
    data = request.json
    reply_content = data.get("content")  # instead of "reply"

    if not reply_content:
        return jsonify({"error": "Reply content is required"}), 400

    discussion = db.discussions.find_one({"_id": ObjectId(discussion_id)})
    if not discussion:
        return jsonify({"error": "Discussion not found"}), 404

    reply = {
        "content": reply_content,
        "timestamp": datetime.utcnow().isoformat()
    }

    db.discussions.update_one(
        {"_id": ObjectId(discussion_id)},
        {"$push": {"replies": reply}}
    )

    return jsonify({"message": "Reply added successfully"}), 201

#   Route: Upvote a Discussion
@app.route("/api/discussions/<discussion_id>/upvote", methods=["POST"])
def upvote_discussion(discussion_id):
    discussion = db.discussions.find_one({"_id": ObjectId(discussion_id)})
    if not discussion:
        return jsonify({"error": "Discussion not found"}), 404

    db.discussions.update_one(
        {"_id": ObjectId(discussion_id)},
        {"$inc": {"upvotes": 1}}
    )

    return jsonify({"message": "Upvoted successfully"}), 200
@app.route('/api/pesticides', methods=['GET'])
def get_pesticides():
    df = pd.read_csv('pesticides_updated.csv')
    return jsonify(df.to_dict(orient='records'))
@app.route("/api/products", methods=["POST"])
def post_product():
    data = request.json
    product = {
        "name": data.get("name"),
        "description": data.get("description"),
        "price": data.get("price"),
        "unit": data.get("unit"),
        "location": data.get("location"),
        "user_id": data.get("user_id"),
        "date_posted": datetime.now()
    }
    db.products.insert_one(product)
    return jsonify({"success": True, "message": "Product posted successfully!"})
@app.route("/api/farmer/orders/<farmer_id>", methods=["GET"])
def get_farmer_orders(farmer_id):
    products = list(db.products.find({"user_id": farmer_id}))
    product_ids = [str(p["_id"]) for p in products]

    orders = list(db.orders.find({"product_id": {"$in": product_ids}}))
    for order in orders:
        order["_id"] = str(order["_id"])
    return jsonify(orders)
@app.route("/api/products", methods=["GET"])
def get_products():
    products = list(db.products.find())
    for product in products:
        product["_id"] = str(product["_id"]) 
    return jsonify(products)

@app.route("/api/orders", methods=["POST"])
def place_order():
    data = request.json
    product_id = data.get("product_id")
    buyer_id = data.get("buyer_id")
    quantity = data.get("quantity")
    message = data.get("message", "")

    if not all([product_id, buyer_id, quantity]):
        return jsonify({"success": False, "message": "Missing order details!"})

    order = {
        "product_id": product_id,
        "buyer_id": buyer_id,
        "quantity": quantity,
        "message": message,
        "status": "Pending",
        "timestamp": datetime.now()
    }

    db.orders.insert_one(order)
    return jsonify({"success": True, "message": "Order placed successfully!"})
from bson import ObjectId

@app.route("/api/farmer/orders/action", methods=["POST"])
def update_order_status():
    data = request.json
    order_id = data.get("order_id")
    action = data.get("action")

    if not order_id or action not in ["accept", "reject"]:
        return jsonify({"success": False, "message": "Invalid data!"})

    order = db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        return jsonify({"success": False, "message": "Order not found!"})

    if action == "accept":
        # Decrease product quantity
        product = db.products.find_one({"_id": ObjectId(order["product_id"])})
        if not product:
            return jsonify({"success": False, "message": "Product not found!"})

        new_quantity = int(product.get("unit", 0)) - int(order["quantity"])
        if new_quantity < 0:
            return jsonify({"success": False, "message": "Not enough stock!"})

        db.products.update_one(
            {"_id": ObjectId(order["product_id"])},
            {"$set": {"unit": new_quantity}}
        )

        db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": "Accepted"}}
        )
        return jsonify({"success": True, "message": "Order accepted and stock updated!"})

    else:
        # Reject
        db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": "Rejected"}}
        )
        return jsonify({"success": True, "message": "Order rejected."})
#adminpanel
@app.route("/api/announcements", methods=["POST"])
def post_announcement():
    data = request.json
    db.announcements.insert_one({
        "text": data.get("text"),
        "date": datetime.now()
    })
    return jsonify({"success": True})

@app.route("/api/announcements", methods=["GET"])
def get_announcements():
    announcements = list(db.announcements.find().sort("date", -1))  # latest first
    for ann in announcements:
        ann["_id"] = str(ann["_id"])
    return jsonify(announcements)
#experts
expert_requests_collection = db["expert_requests"]

@app.route("/api/experts", methods=["GET"])
def get_experts():
    experts = list(users_collection.find({"role": "expert"}))
    for e in experts:
        e["_id"] = str(e["_id"])
    return jsonify(experts)

@app.route("/api/expert-requests", methods=["POST"])
def send_expert_request():
    data = request.json
    expert_requests_collection.insert_one({
        "expert_id": data.get("expert_id"),
        "farmer_id": data.get("farmer_id"),
        "message": data.get("message"),
        "status": "Pending",
        "reply": None,
        "conversation": [],
        "timestamp": datetime.now()
    })
    return jsonify({"success": True, "message": "Request sent successfully!"})

@app.route("/api/expert/<expert_id>/requests", methods=["GET"])
def get_requests_for_expert(expert_id):
    requests = list(expert_requests_collection.find({"expert_id": expert_id}))
    for r in requests:
        r["_id"] = str(r["_id"])
    return jsonify(requests)

@app.route("/api/expert-request/<request_id>/reply", methods=["PUT"])
def update_conversation(request_id):
    data = request.json
    role = data.get("role")  # "farmer" or "expert"
    message = data.get("message")

    expert_requests_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$push": {
            "conversation": {
                "from": role,
                "message": message,
                "timestamp": datetime.now()
            }
        }}
    )

    # If the expert is sending the first reply, update the 'reply' field and status
    if role == "expert" and not expert_requests_collection.find_one({"_id": ObjectId(request_id)}).get("reply"):
        expert_requests_collection.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"reply": message, "status": "Resolved"}}
        )

    return jsonify({"success": True, "message": "Reply added."})

@app.route("/api/farmer/<farmer_id>/requests", methods=["GET"])
def get_farmer_requests(farmer_id):
    requests = list(expert_requests_collection.find({"farmer_id": farmer_id}))
    for r in requests:
        r["_id"] = str(r["_id"])
    return jsonify(requests)

@app.route("/api/expert-request/<request_id>/close", methods=["PUT"])
def close_request(request_id):
    expert_requests_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "Closed"}}
    )
    return jsonify({"success": True, "message": "Request closed."})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)