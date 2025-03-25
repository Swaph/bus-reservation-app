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
    let routeInfo = `${route.split('-').join(' to ')}, ${departureTime} to ${arrivalTime}`;

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

    // Company name and Reservation number
    doc.setFontSize(20);
    doc.text('Pinque Bus Lines', 10, 10);
    doc.setFontSize(12);
    doc.text(`Reservation Number: ${summaryNumber}`, 10, 20);

    // Add passenger details
    doc.setFontSize(12);
    doc.text('Passenger Details', 10, 30);
    let yOffset = 40;
    Object.entries(passengerInfo).forEach(([seatNumber, passenger]) => {
        doc.text(`First Name: ${passenger.firstName}`, 10, yOffset);
        doc.text(`Last Name: ${passenger.lastName}`, 10, yOffset + 5);
        doc.text(`National ID: ${passenger.nationalID}`, 10, yOffset + 10);
        doc.text(`Phone: ${passenger.phone}`, 10, yOffset + 15);
        yOffset += 20;
    });

    // Add booking details
    doc.setFontSize(12);
    doc.text('Booking Details', 10, yOffset);
    yOffset += 10;
    doc.text(`Bus Name: ${busName}`, 10, yOffset);
    doc.text(`Number Plate: ${numberPlate}`, 10, yOffset + 5);
    doc.text(`Route: ${route.split('-').join(' to ')}`, 10, yOffset + 10);
    doc.text(`Time and Travel Date: ${date}`, 10, yOffset + 15);
    doc.text(`Bus Type: ${busType}`, 10, yOffset + 20);
    doc.text(`Booking Date: ${new Date().toLocaleDateString()}`, 10, yOffset + 25);

    // Add payment details
    doc.setFontSize(12);
    doc.text('Payment Details', 10, yOffset + 35);
    yOffset += 45;
    let totalPrice = 0;
    Object.entries(passengerInfo).forEach(([seatNumber, passenger]) => {
        const seatFare = parsedFare;
        totalPrice += seatFare;
        doc.text(`Seat Type: ${passenger.seatType || 'Adult'}`, 10, yOffset);
        doc.text(`Seat Number: ${seatNumber}`, 10, yOffset + 5);
        doc.text(`Price: Ksh ${seatFare.toFixed(2)}`, 10, yOffset + 10);
        doc.text(`Quantity: 1`, 10, yOffset + 15);
        doc.text(`Total: Ksh ${seatFare.toFixed(2)}`, 10, yOffset + 20);
        yOffset += 25;
    });

    // Add ticket subtotal
    doc.setFontSize(12);
    doc.text(`Ticket Subtotal: Ksh ${totalPrice.toFixed(2)}`, 10, yOffset + 30);

    // Save the PDF
    doc.save('reservation_summary.pdf');
}
