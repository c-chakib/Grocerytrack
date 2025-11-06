<!-- # GroceryTrack - Food Expiration Tracker

MEAN Stack Project (MongoDB, Express, Angular, Node.js)

## Quick Start

### Backend
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
ng serve
\`\`\`

## Deployment
- Backend: Render
- Frontend: Vercel
- Database: MongoDB Atlas -->

# GroceryTrack

A modern, real-time grocery tracking app with internationalization, analytics, and a beautiful UI/UX.

## Features

- 🛒 Track groceries with categories, expiration dates, quantities, and locations
- 🔔 Real-time updates (Socket.IO)
- 🌍 Multi-language support (English, French, Arabic)
- 📊 Analytics dashboard for waste reduction and savings
- 🥇 Achievements and statistics
- 🚀 Responsive, mobile-friendly design
- 🔐 Authentication (register, login, logout)
- 🧹 Filtering, sorting, and search
- 🥬 Professional UI with toast notifications

## Tech Stack

- **Frontend:** Angular 17+, RxJS, ngx-translate
- **Backend:** Node.js, Express, MongoDB, Socket.IO
- **Other:** PWA support, modern CSS, i18n

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/c-chakib/GROCERYTRACK.git
cd GROCERYTRACK

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

- Copy `.env.example` to `.env` in the backend folder and set your MongoDB URI and JWT secret.
- Update `environment.ts` in the frontend with your backend API URL if needed.

### Running the App

```bash
# Start backend
cd backend
npm start

# Start frontend
cd ../frontend
ng serve -o
```

## Folder Structure

```
GROCERYTRACK/
├── backend/
│   ├── src/
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── angular.json
│   └── ...
└── README.md
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT

---
Made with ❤️ by c-chakib
