// Global variables
let selectedSeatsTable;
let totalPrice = 0;
let ticketSubtotal;
let passengerInfo;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const route = urlParams.get('route');
  const date = urlParams.get('date');
  const busName = urlParams.get('busName');
  const departureTime = urlParams.get('departureTime');
  const arrivalTime = urlParams.get('arrivalTime');
  const busType = urlParams.get('busType');
  const fare = parseFloat(urlParams.get('fare'));
  const numberPlate = urlParams.get('numberPlate');

  console.log('seatSelection.js loaded with:', {
    route, date, busName, departureTime, arrivalTime, busType, fare, numberPlate,
  });

  // Display bus details
  const busDetails = document.createElement('div');
  busDetails.className = 'bus-card';
  busDetails.innerHTML = `
        <img src="images/${busType.toLowerCase().replace(' ', '_')}.png" alt="${busName}" style="width:100px;height:auto;">
        <div class="bus-info">
            <h3>${busName}</h3>
            <p>Number Plate: ${numberPlate}</p>
            <p>${route.split('-').join(' to ')}, ${departureTime} to ${arrivalTime}</p>
            <p>${busType}</p>
        </div>
    `;
  document.querySelector('.container').prepend(busDetails);

  // Initialize references to key DOM elements
  selectedSeatsTable = document.getElementById('selected-seats-table');
  ticketSubtotal = document.getElementById('ticket-subtotal');
  passengerInfo = document.getElementById('passenger-info');

  if (!selectedSeatsTable || !ticketSubtotal || !passengerInfo) {
    console.error('Required DOM elements not found');
    alert('Required DOM elements not found. Please reload the page.');
    return;
  }

  fetch(`/api/available-seats?route=${route}&date=${date}`)
    .then(response => response.json())
    .then(data => {
      console.log('Fetched bus data:', data);
      const bus = data[0];
      if (!bus || !bus.seats) {
        console.error('Bus data or seats not available');
        alert('Bus data or seats not available. Please try again later.');
        return;
      }

      // Mark unavailable, staff, and booked seats
      const seatsElements = document.querySelectorAll('.seat');
      seatsElements.forEach(seat => {
        const seatNumber = seat.dataset.seat;
        if (seatNumber === 'Driver' || seatNumber === 'ICE' || seatNumber === '38') {
          seat.classList.add('unavailable');
        } else if (!bus.seats[seatNumber].available) {
          seat.classList.add('booked');
        }

        seat.addEventListener('click', () => {
          if (seat.classList.contains('unavailable') || seat.classList.contains('booked')) {
            return;
          }

          const isSelected = seat.classList.toggle('selected'); // Toggle selection state
          if (isSelected) {
            selectSeat(seat, seatNumber, fare);
          } else {
            removeSeat(seatNumber, fare, 'seat-map');
          }
        });
      });
    })
    .catch(error => {
      console.error('Error fetching bus data:', error);
      alert('Error fetching bus data. Please try again later.');
    });

  // Add event listeners for navigation buttons
  document.getElementById('backButton').addEventListener('click', navigateBack);
  document.getElementById('proceedButton').addEventListener('click', proceedToBooking);
});

function selectSeat(seat, seatNumber, fare) {
  console.log(`Selecting seat ${seatNumber}`);

  // Create a new row in the selected seats table
  const seatRow = document.createElement('tr');
  seatRow.dataset.seat = seatNumber; // Assign the seat number for easy lookup
  seatRow.innerHTML = `
        <td>${seatNumber}</td>
        <td id="price-${seatNumber}">Ksh ${fare.toFixed(2)}</td>
        <td><button class="btn btn-danger remove-seat" data-seat="${seatNumber}" data-fare="${fare}">Remove</button></td>
    `;
  selectedSeatsTable.querySelector('tbody').appendChild(seatRow);

  // Update total price
  totalPrice += fare;
  if (ticketSubtotal) {
    ticketSubtotal.textContent = `Ksh ${totalPrice.toFixed(2)}`;
  } else {
    console.error('Error: Could not find ticket-subtotal element.');
  }

  // Add passenger info fields
  addPassengerInfo(seatNumber);

  // Add click event to the remove button in the table
  const removeButton = seatRow.querySelector('.remove-seat');
  removeButton.addEventListener('click', () => {
    removeSeat(seatNumber, fare, 'table');
  });
}

function removeSeat(seatNumber, fare, source) {
  console.log(`Removing seat ${seatNumber} (source: ${source})`);

  // Remove the row from the table
  const rowToRemove = Array.from(selectedSeatsTable.querySelectorAll('tr')).find(row => row.dataset.seat === seatNumber);
  if (rowToRemove) {
    rowToRemove.remove();
  }

  // Update total price
  totalPrice -= fare;
  if (ticketSubtotal) {
    ticketSubtotal.textContent = `Ksh ${totalPrice.toFixed(2)}`;
  }

  // Remove passenger information (if exists)
  removePassengerInfo(seatNumber);

  // Unselect the seat in the seat map if the action came from the table
  if (source === 'table') {
    const seatElement = document.querySelector(`.seat[data-seat="${seatNumber}"]`);
    if (seatElement) {
      seatElement.classList.remove('selected');
    }
  }
}

function addPassengerInfo(seatNumber) {
  const passengerDiv = document.createElement('div');
  passengerDiv.className = 'form-group';
  passengerDiv.innerHTML = `
        <label>Passenger Information for Seat ${seatNumber}</label>
        <input type="text" class="form-control passenger-first-name" id="first-name-${seatNumber}" name="first-name-${seatNumber}" placeholder="First Name" required>
        <div class="error-message" id="first-name-error-${seatNumber}"></div>
        <input type="text" class="form-control passenger-last-name" id="last-name-${seatNumber}" name="last-name-${seatNumber}" placeholder="Last Name" required>
        <div class="error-message" id="last-name-error-${seatNumber}"></div>
        <input type="text" class="form-control passenger-national-id" id="national-id-${seatNumber}" name="national-id-${seatNumber}" placeholder="National ID" required>
        <div class="error-message" id="national-id-error-${seatNumber}"></div>
        <input type="text" class="form-control passenger-phone" id="phone-${seatNumber}" name="phone-${seatNumber}" placeholder="Phone Number" value="+254" required>
        <div class="error-message" id="phone-error-${seatNumber}"></div>
    `;
  passengerInfo.appendChild(passengerDiv);

  // Add real-time validation
  const firstNameInput = document.getElementById(`first-name-${seatNumber}`);
  const lastNameInput = document.getElementById(`last-name-${seatNumber}`);
  const nationalIdInput = document.getElementById(`national-id-${seatNumber}`);
  const phoneInput = document.getElementById(`phone-${seatNumber}`);

  firstNameInput.addEventListener('input', () => validateName(firstNameInput.value, `first-name-error-${seatNumber}`));
  lastNameInput.addEventListener('input', () => validateName(lastNameInput.value, `last-name-error-${seatNumber}`));
  nationalIdInput.addEventListener('input', () => validateNationalID(nationalIdInput.value, `national-id-error-${seatNumber}`));
  phoneInput.addEventListener('input', () => validatePhone(phoneInput.value, `phone-error-${seatNumber}`));
}

function removePassengerInfo(seatNumber) {
  const passengerDiv = Array.from(passengerInfo.children).find(div => div.querySelector('label').textContent.includes(`Passenger Information for Seat ${seatNumber}`));
  if (passengerDiv) {
    passengerInfo.removeChild(passengerDiv);
  }
}

function validateName(name, errorId) {
  const errorElement = document.getElementById(errorId);

  if (name.length < 2) {
    errorElement.textContent = 'Name must have at least 2 characters.';
    return false;
  }
  if (!/^[A-Za-z]+$/.test(name)) {
    errorElement.textContent = 'Name must contain only letters.';
    return false;
  }
  if (name.length > 50) {
    errorElement.textContent = 'Name cannot exceed 50 characters.';
    return false;
  }

  errorElement.textContent = ''; // Clear error if valid
  return true;
}

function validatePhone(phone, errorId) {
  const errorElement = document.getElementById(errorId);

  if (!/^\+254[0-9]{9}$/.test(phone)) {
    errorElement.textContent = 'Phone number must be in the format +254XXXXXXXXX.';
    return false;
  }

  errorElement.textContent = ''; // Clear error if valid
  return true;
}

function validateNationalID(nationalID, errorId) {
  const errorElement = document.getElementById(errorId);

  if (!/^[0-9]{8}$/.test(nationalID)) {
    errorElement.textContent = 'National ID must be an 8-digit number.';
    return false;
  }

  errorElement.textContent = ''; // Clear error if valid
  return true;
}

function bookSeats() {
  const selectedSeats = document.querySelectorAll('.seat.selected');
  const passengerInfoData = {};
  let isValid = true;

  if (selectedSeats.length === 0) {
    alert('You must select at least one seat to book.');
    return; // Prevent further execution
  }

  selectedSeats.forEach(seat => {
    const seatNumber = seat.dataset.seat;
    const passengerDiv = Array.from(passengerInfo.children).find(div => div.querySelector('label').textContent.includes(`Passenger Information for Seat ${seatNumber}`));

    if (passengerDiv) {
      const firstName = passengerDiv.querySelector('.passenger-first-name').value.trim();
      const lastName = passengerDiv.querySelector('.passenger-last-name').value.trim();
      const nationalID = passengerDiv.querySelector('.passenger-national-id').value.trim();
      const phone = passengerDiv.querySelector('.passenger-phone').value.trim();

      // Validate each field separately
      const isFirstNameValid = validateName(firstName, `first-name-error-${seatNumber}`);
      const isLastNameValid = validateName(lastName, `last-name-error-${seatNumber}`);
      const isNationalIDValid = validateNationalID(nationalID, `national-id-error-${seatNumber}`);
      const isPhoneValid = validatePhone(phone, `phone-error-${seatNumber}`);

      // Track overall validity
      if (!isFirstNameValid || !isLastNameValid || !isNationalIDValid || !isPhoneValid) {
        isValid = false; // Prevent submission for invalid fields
      } else {
        passengerInfoData[seatNumber] = {
          firstName,
          lastName,
          nationalID,
          phone,
        };
      }
    }
  });

  if (!isValid) {
    alert('Please correct the errors in the passenger details before proceeding.');
    return;
  }

  // Collect additional route and bus details
  const urlParams = new URLSearchParams(window.location.search);
  const route = urlParams.get('route');
  const date = urlParams.get('date');
  const busName = urlParams.get('busName');
  const departureTime = urlParams.get('departureTime');
  const arrivalTime = urlParams.get('arrivalTime');
  const busType = urlParams.get('busType');
  const fare = parseFloat(urlParams.get('fare'));
  const numberPlate = urlParams.get('numberPlate');

  console.log('Booking seats:', {
    route, date, seats: Object.keys(passengerInfoData), passengerInfo: passengerInfoData,
  });

  // Send booking data to the backend API
  fetch('/api/reserve-seat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route, date, seats: Object.keys(passengerInfoData), passengerInfo: passengerInfoData,
    }),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Booking response:', data);
      if (data.success) {
        // Store reservation summary in sessionStorage
        const reservationSummary = {
          route,
          date,
          busName,
          departureTime,
          arrivalTime,
          busType,
          fare,
          numberPlate,
          seats: Object.keys(passengerInfoData),
          passengerInfo: passengerInfoData,
        };
        sessionStorage.setItem('reservationSummary', JSON.stringify(reservationSummary));
        sessionStorage.setItem('hasBooked', true); // Set a booking flag
        window.location.href = '/reservationSummary.html';
      } else {
        alert('Failed to book seats. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error booking seats:', error);
      alert('Error booking seats. Please try again later.');
    });
}

function navigateBack() {
  window.history.back();
}

function proceedToBooking() {
  const selectedSeats = getSelectedSeats();
  if (selectedSeats.length === 0) {
    alert('Please select at least one seat.');
    return;
  }

  const queryParams = new URLSearchParams(window.location.search);
  queryParams.append('selectedSeats', selectedSeats.join(','));
  window.location.href = `/payment.html?${queryParams.toString()}`;
}

function getSelectedSeats() {
  const selectedSeats = [];
  document.querySelectorAll('.seat.selected').forEach(seat => {
    selectedSeats.push(seat.dataset.seatNumber);
  });
  return selectedSeats;
}
