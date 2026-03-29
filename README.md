# 🏷️ Real-Time British Auction RFQ System

A high-performance, real-time bidding platform designed to strictly facilitate and govern British-style Requests for Quotations (RFQs). Buyers can initiate timed auctions with custom rules, and Bidders can competitively engage in live scenarios equipped with dynamic extensions and instant websocket-powered rankings.

## 🔗 Live Demo

- **🌐 Frontend Live URL**: [https://british-bidding-system.vercel.app]


## ✨ Features

- **Dynamic RFQ Auctions**: Buyers launch multi-variable RFQs mapped with origins, destinations, and critical deadlines.
- **Live Bidding Ecosystem**: Bidders place bids in real-time. WebSockets deliver millisecond-accurate notifications for rank shifts and "Current Lowest Bid" updates without manual refreshing.
- **Intelligent Timer Extensions**: Employs trigger-based logic to auto-extend an auction's deadline if a competitive bid is placed in the final moments (Anti-Sniper protection).
- **Early Termination & Allocation**: Empowers Buyers to manually terminate an auction early or intentionally select a definitive winning bidder.
- **Full Analytics Dashboard**: Visualizes overarching platform metrics, completed auctions, and bidding trends.

## 🛠️ Tech Stack

**Frontend Layer**
- React.js Focus
- Tailwind CSS (For clean, responsive design)
- Socket.IO-Client (For live listeners)
- Axios (For HTTP Request Management)

**Backend Layer**
- Node.js & Express.js
- Socket.IO (WebSocket Broadcast Server)
- JSON Web Tokens (JWT Role Guards)

**Database Layer**
- MongoDB (Scalable Document Storage)
- Mongoose (ODM Validation)

## 🚀 Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/repo-name.git
   cd repo-name
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   
   # Create a .env file containing:
   # PORT=5000
   # MONGO_URI=your_mongodb_connection_string
   # JWT_SECRET=your_secret_key
   
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   
   # Create a .env file containing:
   # VITE_API_URL=http://localhost:5000/api
   
   npm run dev
   ```

## 📂 Folder Structure

```text
📦 RFQ System
 ┣ 📂 backend
 ┃ ┣ 📂 config          # Database connectivity & environments
 ┃ ┣ 📂 controllers     # Core route definitions and action logic
 ┃ ┣ 📂 middleware      # Protect APIs via JWT Role-Guards
 ┃ ┣ 📂 models          # Mongoose Schemas (User, RFQ, Bid)
 ┃ ┣ 📂 routes          # Express Routing
 ┃ ┣ 📂 services        # Websocket emitting & Auction timing rules
 ┃ ┗ 📜 server.js       # Main server and Socket.io initialization
 ┗ 📂 frontend
   ┣ 📂 public          # Static assets
   ┣ 📂 src
   ┃ ┣ 📂 components    # Reusable UI parts (Navbars, Timers, Toggles)
   ┃ ┣ 📂 context       # React Context APIs (Auth layer)
   ┃ ┣ 📂 pages         # Full-screen route views (Dashboard, Auction Details)
   ┃ ┣ 📂 services      # Socket initialization context and Axios interceptors
   ┃ ┗ 📜 App.jsx       # Component router implementation
```



## 🔮 Future Improvements

- Add email/SMS notifications specifically tied to WebSocket events to alert offline bidders.
- Add PDF Generation for printing official Purchase Orders when an RFQ is awarded.
- Enhance the analytics dashboard with interactive interactive charts mapping bid frequency over time.
- Implement an audit log export (CSV) feature for prolonged compliance tracking.
