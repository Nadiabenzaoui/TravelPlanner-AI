# 🌍 TravelPlanner AI

**The next generation of travel planning, powered by AI.**  
Say goodbye to hours of research. TravelPlanner AI creates personalized, day-by-day itineraries in seconds, complete with budget estimates, local insights, and essential travel tools.

![TravelPlanner AI Hero Banner](public/web-app-manifest-512x512.png) 
*(Note: Replace with actual screenshot)*

## ✨ Key Features

### 🧠 AI-Powered Itineraries
Generates comprehensive travel plans tailored to your destination.
- **Smart Scheduling**: Morning, Afternoon, and Evening activities.
- **Dynamic Content**: Uses Gemini AI to find hidden gems and popular spots.
- **Interactive Map**: Visualize your trip with Google Places integration.

### 🔍 Destination Insights ("Discovery")
Explore countries before you book.
- **Visual Richness**: High-quality, curated images for every destination.
- **Key Stats**: Population, Currency, Language, and Capital at a glance.
- **Travel Toolkit**: 
    - 🛂 **Visa Info**: Instant summary of visa requirements.
    - 🚨 **Emergency**: Police & Ambulance numbers.
    - 📱 **Essential Apps**: Must-have local apps (Ride-sharing, Food delivery).

### 💰 Smart Budgeting
- **Cost Estimator**: AI predicts flight, hotel, and daily expenses.
- **Currency Conversion**: Live currency display for your destination.

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Sleek, modern interface with lucid-react icons.
- **Responsive**: Fully optimized for Desktop and Mobile.
- **Fast**: Built on Next.js 16 (Turbopack) for lightning speed.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, Framer Motion.
- **Backend**: Node.js, Express.
- **Database**: Supabase (PostgreSQL).
- **AI**: Google Gemini 1.5 Flash.
- **APIs**: RestCountries, Nominatim (OpenStreetMap), Google Maps/Places.
- **Containerization**: Docker & Docker Compose.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (optional, for containerized run)
- A Google Gemini API Key
- A Supabase Project

### Option A: Quick Start with Docker (Recommended)

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YourUsername/TravelPlanner-AI.git
    cd TravelPlanner-AI
    ```

2.  **Set up Environment Variables**
    Create a `.env` file in the root directory (see `.env.example`).
    ```env
    # Server
    GEMINI_API_KEY=your_gemini_key
    SUPABASE_URL=your_supabase_url
    SUPABASE_ANON_KEY=your_supabase_key

    # Client
    NEXT_PUBLIC_API_URL=http://localhost:4000
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
    ```

3.  **Run with Docker Compose**
    ```bash
    docker-compose up --build
    ```
    - Client: `http://localhost:3000`
    - Server: `http://localhost:4000`

### Option B: Local Development

1.  **Install Dependencies**
    ```bash
    # Client
    cd client && npm install
    # Server
    cd ../server && npm install
    ```

2.  **Start Services**
    ```bash
    # Terminal 1 (Server)
    cd server && npm run dev

    # Terminal 2 (Client)
    cd client && npm run dev
    ```

---

## 📸 Screenshots

| Home Page | Destination Discovery | Itinerary Planner |
|:---------:|:-------------------:|:-----------------:|
| *(Add Image)* | *(Add Image)* | *(Add Image)* |

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any features or bug fixes.

---

Made with ❤️ by [Nadia Benzaoui]
