function getBusImage(busType) {
  const type = busType.toLowerCase().replace(' ', '_');
  if (type === 'ac_coach') return 'ac_coach.png';
  if (type === 'bolt_bus') return 'bolt_bus.png';
  return 'mega_bus.png';
}

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
        const row = document.createElement('tr');
        const busImage = getBusImage(bus.type);

        // Calculate the number of available seats
        const totalSeats = Object.keys(bus.seats).length;
        const availableSeats = Object.values(bus.seats).filter(seat => seat.available).length;

        row.innerHTML = `
          <td><img src="images/${busImage}" alt="${bus.type}" style="width:50px;height:50px;"></td>
          <td>${bus.name}</td>
          <td>${bus.route.split('-').join(' to ')}</td>
          <td>${formatTime(bus.departureTime)}</td>
          <td>${formatTime(bus.arrivalTime)}</td>
          <td>${bus.type}</td>
          <td>${availableSeats}/${totalSeats - 3}</td>
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

function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour > 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
}

function selectSeats(busId) {
  const queryParams = new URLSearchParams(window.location.search);
  queryParams.append('busId', busId);
  window.location.href = `/seatSelection.html?${queryParams.toString()}`;
}
