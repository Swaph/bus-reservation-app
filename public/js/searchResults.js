document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const route = urlParams.get('route');
    const date = urlParams.get('date');

    // Show loading indicator
    const busResults = document.getElementById('bus-results');
    busResults.innerHTML = '<tr><td colspan="9">Loading...</td></tr>';

    fetch(`/api/available-seats?route=${route}&date=${date}`)
        .then(response => response.json())
        .then(data => {
            busResults.innerHTML = ''; // Clear loading indicator
            if (data.length === 0) {
                busResults.innerHTML = '<tr><td colspan="9">No buses available for the selected route and date.</td></tr>';
                return;
            }

            data.forEach(bus => {
                const busType = bus.type ? bus.type.toLowerCase().replace(/\s+/g, '_') : "unknown";
                const busImage = busType === 'ac_coach' ? 'ac_coach.png' :
                    busType === 'bolt_bus' ? 'bolt_bus.png' : 'mega_bus.png';

                // Fix: Proper seat count calculation
                const totalSeats = bus.seats.length;
                const availableSeats = bus.seats.filter(seat => seat.available === 1).length;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="images/${busImage}" alt="${bus.type}" style="width:50px;height:50px;"></td>
                    <td>${bus.name}</td>
                    <td>${bus.route.split('-').join(' to ')}</td>
                    <td>${bus.departureTime}</td>
                    <td>${bus.arrivalTime}</td>
                    <td>${bus.type}</td>
                    <td>${availableSeats}/${totalSeats - 3}</td> <!-- Adjust for staff seats -->
                    <td>Ksh ${bus.fare.toFixed(2)}</td>
                    <td><button class="btn btn-primary" onclick="viewSeats('${bus.route}', '${date}', '${bus.name}', '${bus.departureTime}', '${bus.arrivalTime}', '${bus.type}', '${availableSeats}', '${bus.fare.toFixed(2)}', '${bus.numberPlate}')">View Seats</button></td>
                `;
                busResults.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching bus data:', error);
            busResults.innerHTML = '<tr><td colspan="9">Error loading bus data. Please try again later.</td></tr>';
        });
});

function viewSeats(route, date, busName, departureTime, arrivalTime, busType, availableSeats, fare, numberPlate) {
    const queryParams = new URLSearchParams();
    queryParams.append('route', route);
    queryParams.append('date', date);
    queryParams.append('busName', busName);
    queryParams.append('departureTime', departureTime);
    queryParams.append('arrivalTime', arrivalTime);
    queryParams.append('busType', busType);
    queryParams.append('seats', availableSeats);
    queryParams.append('fare', fare);
    queryParams.append('numberPlate', numberPlate);

    window.location.href = `/seatSelection.html?${queryParams.toString()}`;
}
