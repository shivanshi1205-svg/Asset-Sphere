# AssetSphere Full-Stack IT Asset Management System

A highly professional, responsive, premium full-stack Asset Management application inspired by [RentMySpace](https://rentmyspace.co/) design layouts.

This project is completely self-contained and consists of:
1. **Node.js Express Backend**: Running on port `5000` with JSON-based file persistence (`express-backend/db.json`).
2. **React 19 + Vite Frontend**: Running on port `3000` with automated proxy configurations to bypass CORS.

---

## Folder Structure

```
assetspace-app/
├── README.md             # This file (root documentation)
├── express-backend/      # Custom Node.js Express API service
│   ├── package.json      # Dependencies and scripts
│   ├── server.js         # REST endpoints and DB handlers
│   └── db.json           # JSON Database file
└── react-frontend/       # Vite React 19 Frontend application
    ├── package.json      # Dependencies and scripts
    ├── vite.config.js    # Vite configuration & proxy routes
    └── src/              # React pages, components, layout and routes
```

---

## How to Run the Project Localy

Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 1. Launch the Backend API Server
Navigate to the `express-backend` folder, install dependencies, and start the server:
```bash
cd express-backend
npm install
npm start
```
By default, the backend API will run at [http://localhost:5000](http://localhost:5000).

### 2. Launch the React Frontend
Open a new terminal window, navigate to the `react-frontend` folder, install dependencies, and start the development server:
```bash
cd react-frontend
npm install
npm run dev
```
By default, the hot-reloading frontend development server will launch at [http://localhost:3000](http://localhost:3000).

---

## Log-In Credentials
Once the site loads in your browser:
*   **Username**: `demo`
*   **Password**: `87654321`

---

## Build for Production

To compile and optimize the frontend for live web hosting:
```bash
cd react-frontend
npm run build
```
This will compile static HTML/CSS/JS resources into the `react-frontend/dist/` folder, which is preconfigured with redirection scripts for deployment on **Netlify** or **Vercel**.
