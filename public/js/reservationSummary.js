document.addEventListener('DOMContentLoaded', () => {
    // Check if the user has completed booking
    const hasBooked = sessionStorage.getItem('hasBooked');
    if (!hasBooked) {
        alert('You must complete a booking before viewing the reservation summary.');
        window.location.href = '/seatSelection.html'; // Redirect to seat selection
        return;
    }

     // Retrieve reservation summary from session storage
    const reservationSummary = JSON.parse(sessionStorage.getItem('reservationSummary'));
    if (!reservationSummary) {
        alert('Reservation summary not found. Please try again.');
        return;
    }

    const { route, date, busName, departureTime, arrivalTime, busType, fare, numberPlate, seats, passengerInfo } = reservationSummary;

    // Ensure fare is a number
    const parsedFare = parseFloat(fare);
    if (isNaN(parsedFare)) {
        console.error('Invalid fare value:', fare);
        alert('Invalid fare value. Please try again.');
        return;
    }

    // Display passenger details
    const passengerDetails = document.getElementById('passenger-details');
    if (!passengerDetails) {
        console.error('Required DOM element not found: passenger-details');
        alert('Required DOM element not found. Please reload the page.');
        return;
    }

    passengerDetails.innerHTML = Object.entries(passengerInfo).map(([seatNumber, passenger]) => `
        <tr>
            <td>${passenger.firstName}</td>
            <td>${passenger.lastName}</td>
            <td>${passenger.nationalID}</td>
            <td>${passenger.phone}</td>
            <td>${seatNumber}</td>
        </tr>
    `).join('');

    // Display booking details
    const bookingDetails = document.getElementById('booking-details');
    if (!bookingDetails) {
        console.error('Required DOM element not found: booking-details');
        alert('Required DOM element not found. Please reload the page.');
        return;
    }

    const busImage = busType.toLowerCase().replace(' ', '_') === 'ac_coach' ? 'ac_coach.png' :
                     busType.toLowerCase().replace(' ', '_') === 'bolt_bus' ? 'bolt_bus.png' : 'mega_bus.png';
    let routeInfo = `${route.split('-').join(' to ')}`;

    bookingDetails.innerHTML = `
        <tr>
            <td><img src="images/${busImage}" alt="${busType}" class="bus-image"></td>
            <td>${numberPlate}</td>
            <td>${routeInfo}</td>
            <td>${departureTime}</td>
            <td>${arrivalTime}</td>
            <td>${busType}</td>
            <td>${new Date().toLocaleDateString()}</td>
        </tr>
    `;

    // Display payment details
    const paymentDetails = document.getElementById('payment-details');
    if (!paymentDetails) {
        console.error('Required DOM element not found: payment-details');
        alert('Required DOM element not found. Please reload the page.');
        return;
    }

    let totalPrice = 0;
    const paymentRows = Object.entries(passengerInfo).map(([seatNumber, passenger]) => {
        const seatFare = parsedFare;
        totalPrice += seatFare;
        return `
            <tr>
                <td>${passenger.seatType || 'Adult'}</td>
                <td>${seatNumber}</td>
                <td>Ksh ${seatFare.toFixed(2)}</td>
                <td>1</td>
                <td>Ksh ${seatFare.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    paymentDetails.innerHTML = paymentRows;

    // Update ticket subtotal
    const ticketSubtotal = document.getElementById('ticket-subtotal');
    if (!ticketSubtotal) {
        console.error('Required DOM element not found: ticket-subtotal');
        alert('Required DOM element not found. Please reload the page.');
        return;
    }

    ticketSubtotal.textContent = `Ksh ${totalPrice.toFixed(2)}`;
});

function goBack() {
    window.history.back();
}

function proceedBooking() {
    const proceedButton = document.querySelector('.btn-primary');
    proceedButton.disabled = true;
    proceedButton.textContent = 'Booking...';

    // Simulate booking process
    setTimeout(() => {
        proceedButton.textContent = 'Proceed';
        proceedButton.disabled = false;
        if (confirm('Booking successful! Do you want to download the reservation summary?')) {
            generatePDF();
        }
    }, 2000);
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const reservationSummary = JSON.parse(sessionStorage.getItem('reservationSummary'));
    const { route, date, busName, departureTime, arrivalTime, busType, fare, numberPlate, seats, passengerInfo } = reservationSummary;

    // Ensure fare is a number
    const parsedFare = parseFloat(fare);
    if (isNaN(parsedFare)) {
        console.error('Invalid fare value:', fare);
        alert('Invalid fare value. Please try again.');
        return;
    }

    // Generate a unique reservation number
    const summaryNumber = `RSV-${Math.floor(Math.random() * 1000000)}`;

    // Add branding header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Pinque Bus Lines', 70, 15);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Reservation Number: ${summaryNumber}`, 15, 25);
    doc.text(`Booking Date: ${new Date().toLocaleDateString()}`, 15, 30);

    // Trip Details
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Trip Details', 15, 40);
    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.text(`Bus Name: ${busName}`, 15, 50);
    doc.text(`Number Plate: ${numberPlate}`, 15, 55);
    doc.text(`Route: ${route.split('-').join(' to ')}`, 15, 60);
    doc.text(`Departure: ${departureTime}`, 15, 65);
    doc.text(`Arrival: ${arrivalTime}`, 15, 70);
    doc.text(`Bus Type: ${busType}`, 15, 75);
    doc.text(`Travel Date: ${date}`, 15, 80);

    // Passenger Details Table
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Passenger Details', 15, 90);

    let yOffset = 100;
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text('First Name', 15, yOffset);
    doc.text('Last Name', 55, yOffset);
    doc.text('ID Number', 95, yOffset);
    doc.text('Phone', 135, yOffset);
    doc.text('Seat No.', 170, yOffset);

    yOffset += 5;
    doc.setDrawColor(200);
    doc.line(15, yOffset, 190, yOffset); // Line separator

    Object.entries(passengerInfo).forEach(([seatNumber, passenger]) => {
        yOffset += 10;
        doc.text(passenger.firstName, 15, yOffset);
        doc.text(passenger.lastName, 55, yOffset);
        doc.text(passenger.nationalID, 95, yOffset);
        doc.text(passenger.phone, 135, yOffset);
        doc.text(seatNumber, 170, yOffset);
    });

    yOffset += 15;

    // Payment Details Table
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Payment Details', 15, yOffset);

    yOffset += 10;
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text('Seat Type', 15, yOffset);
    doc.text('Seat Number', 60, yOffset);
    doc.text('Price', 110, yOffset);
    doc.text('Qty', 140, yOffset);
    doc.text('Total', 170, yOffset);

    yOffset += 5;
    doc.setDrawColor(200);
    doc.line(15, yOffset, 190, yOffset); // Line separator

    let totalPrice = 0;
    Object.entries(passengerInfo).forEach(([seatNumber]) => {
        yOffset += 10;
        totalPrice += parsedFare;
        doc.text('Adult', 15, yOffset);
        doc.text(seatNumber, 60, yOffset);
        doc.text(`Ksh ${parsedFare.toFixed(2)}`, 110, yOffset);
        doc.text('1', 140, yOffset);
        doc.text(`Ksh ${parsedFare.toFixed(2)}`, 170, yOffset);
    });

    yOffset += 15;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Amount: Ksh ${totalPrice.toFixed(2)}`, 15, yOffset);
    doc.setDrawColor(50);
    doc.line(15, yOffset + 2, 190, yOffset + 2); // Line separator

    yOffset += 10;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text("Payment will be collected when boarding. Bus reservations are non-transferable.", 15, yOffset);
    doc.text("Please present this receipt when boarding.", 15, yOffset + 5);

    // Save the PDF
    doc.save('reservation_summary.pdf');
}

