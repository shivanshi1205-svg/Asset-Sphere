# AssetSphere - Premium Asset Management React Frontend

A modern, highly professional, responsive SaaS-style Asset Management frontend inspired by [RentMySpace](https://rentmyspace.co/) design guidelines. Built using React 19, Vite, Tailwind CSS, TanStack Query, and Framer Motion, it replaces outdated AdminLTE UI conventions with a sleek, premium, card-based interface for managing corporate IT inventories.

## Tech Stack
*   **Core**: React 19, Vite 6
*   **Routing**: React Router DOM 6
*   **State & Cache Management**: TanStack Query v5 (React Query)
*   **Styling**: Tailwind CSS v3, PostCSS, Autoprefixer
*   **Forms & Validation**: React Hook Form, Zod Validation, Hook Form Resolvers
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Data Visualization**: Recharts

---

## Folder Structure
The codebase conforms to professional React project architecture:
```
react-frontend/
├── .env                  # Development environment configuration
├── .env.example          # Template for environment variables
├── index.html            # App document markup and font configurations
├── package.json          # Dependency registrations and script declarations
├── postcss.config.js     # PostCSS styling configuration
├── tailwind.config.js    # Custom styling configuration (Colors, Typography, Shadows)
├── vite.config.js        # Vite bundler configurations and path aliases
├── README.md             # Project documentation and deployment guides
└── src/
    ├── App.jsx           # Root application wrapper and provider setup
    ├── main.jsx          # Render script mounting index
    ├── index.css         # Tailwind imports, custom scrollbar and animation definitions
    ├── components/
    │   ├── common/       # Buttons, Cards, Inputs, Toasts, Skeletons
    │   └── layout/       # Responsive Sidebar, Header, Notification Center, Footer
    ├── context/
    │   ├── AuthContext.jsx   # Handles local & API login, token cache, session persistence
    │   └── ToastContext.jsx  # Context provider for slide-in notification toasts
    ├── layouts/
    │   └── DashboardLayout.jsx # Master layout handling overlays and Framer Motion page transitions
    ├── pages/
    │   ├── Login.jsx     # Modern split-screen authentication with Autofill helpers
    │   ├── Dashboard.jsx # Asset status donut charts, category bar charts, KPI summaries, alerts
    │   ├── Assets.jsx    # Laptops/Desktops table, details specs, Check-In/Check-Out, Create/Edit
    │   ├── Licenses.jsx  # Software licenses seats allocation tables, Checkout/Checkin seats
    │   ├── Accessories.jsx # Inventory tables, checkout, checkin stock count updates
    │   ├── Consumables.jsx # Consumable item tracking, Checkout (Stock consumption) actions
    │   ├── Components.jsx # Internal hardware parts (RAM, SSD), associate with parent Asset
    │   ├── Users.jsx     # People directory, employee IDs, department, active checkout counts
    │   ├── Settings.jsx  # Tabbed metadata configs (Companies, Locations, Labels, Suppliers, etc.)
    │   └── NotFound.jsx  # Elegant custom 404 handler page
    ├── routes/
    │   └── AppRoutes.jsx # Route configurations with Guest and Protected route barriers
    └── services/
        ├── apiClient.js       # Axios base instance with JWT inject and 401 redirect intercepts
        ├── assetService.js    # Hardware assets CRUD with locally filterable offline fallbacks
        ├── licenseService.js  # Software licenses seats checkouts/checkins fallbacks
        ├── accessoryService.js # Accessories inventory updates and allocations
        ├── consumableService.js # Consumables stock levels and consumption tracking
        ├── componentService.js # Internal component parts assignments to parent devices
        └── userService.js     # User profiles and checkout records mapping
```

---

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### Installation
1.  Navigate to the React project directory:
    ```bash
    cd react-frontend
    ```
2.  Install all dependencies:
    ```bash
    npm install
    ```

### Running Locally
To launch the hot-reloading development server:
```bash
npm run dev
```
By default, the server runs on [http://localhost:3000/](http://localhost:3000/).

### Mock Data & API Seamless Fallbacks
To provide immediate visual feedback and testing capability, all services (`assetService`, `licenseService`, `accessoryService`, `consumableService`, `componentService`, `userService`, `AuthContext`) are equipped with **seamless mock fallbacks**.
*   If the backend API specified in `.env` is unreachable, the services will automatically log the warnings and transition to rich, interactive in-memory mock datasets.
*   You can log in instantly by using the **Quick Autofill** shortcut on the Login page (Username: `demo`, Password: `87654321`) even if you do not have a running API server!

---

## Deployment & Production Build

### Compile for Production
To generate a production-ready bundled folder:
```bash
npm run build
```
This compiles, minifies, and optimizes the assets, saving them in the `dist/` directory.

### Preview Production Build
To preview the generated production folder locally:
```bash
npm run preview
```

### Server Integration
To connect to the PHP Laravel Snipe-IT or API backend, adjust the environment variable inside the `.env` file before building:
```env
VITE_API_BASE_URL=http://3.6.21.202:8000/api/v1
```
All API requests (Axios) are configured with authorization headers automatically injecting the token.
