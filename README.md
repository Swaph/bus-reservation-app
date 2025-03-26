# Bus Reservation App

## Overview

The Bus Reservation App is a web application that allows users to reserve bus seats for travel within Kenya. The app enables users to:

- View available buses and seats.
- Select a seat and input passenger details.
- Receive a reservation summary.
- Be notified that payment will be made in cash upon boarding.

## Features

- Dynamic data handling using JSON files.
- Frontend built with plain HTML, CSS, and JavaScript.
- Backend implemented using Node.js and Express.
- Real-time updates and interactive user interface.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- A code editor (e.g., VSCode, Sublime Text).

### Installation

1. **Clone the repository**:
   ```sh
   git clone https://github.com/your-username/bus-reservation-app.git
   cd bus-reservation-app

    Install dependencies:

    cd backend
    npm install

Running the Application

    Start the backend server:

    cd backend
    npm start

    Open the frontend:
        Open frontend/index.html in your browser to start using the app.

Usage

    Search for Buses:
        Enter the departure location, destination, and journey date.
        Click the "Search" button to view available buses.

    Seat Selection:
        Click on a bus to view available seats.
        Select a seat and enter passenger details.
        Proceed to the reservation summary.

    Reservation Summary:
        Review the reservation details.
        Download the reservation summary if needed.

API Endpoints

    GET /api/bus-routes: Fetch all bus routes.
    GET /api/available-seats: Fetch available seats for a specific route and date.
    POST /api/reserve-seat: Make a reservation.
    POST /api/cancel-reservation: Cancel a reservation.

### Version 1.0
- Initial version of the Bus Reservation App.

### Version 1.1 (Upcoming)

#### Planned Features:
- Add user authentication for enhanced security.
- Introduce a payment integration feature (e.g., M-Pesa or PayPal).
- Transition from using JSON files to a database for data storage and management.

#### Bug Fixes:
- Address the issue where seat bookings are not refreshed/cleared for the next day, causing booked seats to remain unavailable after the journey is completed.

Contributing

Contributions are welcome! Please follow these steps:

    Fork the repository.
    Create a new branch (git checkout -b feature/your-feature).
    Commit your changes (git commit -m 'Add some feature').
    Push to the branch (git push origin feature/your-feature).
    Open a Pull Request.

License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security Notes

This project contains sensitive information that should not be committed to version control:
- Firebase configuration
- Environment variables
- Service account keys
- API keys

## Setup Instructions

1. Clone the repository
```bash
git clone <repository-url>
cd bus-reservation-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
- Copy `.env.example` to `.env`
- Fill in your Firebase configuration values in `.env`

4. Start the development server
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
PORT=3001
NODE_ENV=development
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Security Best Practices

1. Never commit sensitive files:
   - `.env`
   - `firebase-service-account.json`
   - `node_modules/`
   - Any files containing API keys or secrets

2. Use environment variables for sensitive data
3. Keep your Firebase service account key secure
4. Regularly rotate API keys and secrets
5. Use appropriate Firebase security rules

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
