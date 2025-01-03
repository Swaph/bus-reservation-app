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

## Project Structure

bus-reservation-app/
│
├── backend/
│   ├── data/
│   │   └── busData.json
│   │   └── reservations.json
│   ├── routes/
│   │   └── busRoutes.js
│   ├── app.js
│   └── package.json
│
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── script.js
│   ├── index.html
│   ├── searchResults.html
│   ├── seatSelection.html
│   └── reservationSummary.html
│
└── README.md

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

Contributing

Contributions are welcome! Please follow these steps:

    Fork the repository.
    Create a new branch (git checkout -b feature/your-feature).
    Commit your changes (git commit -m 'Add some feature').
    Push to the branch (git push origin feature/your-feature).
    Open a Pull Request.

License

This project is licensed under the MIT License - see the LICENSE file for details.
