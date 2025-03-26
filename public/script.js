document.addEventListener('DOMContentLoaded', () => {
  // Fetch bus routes and populate the dropdowns
  fetch('/api/bus-routes')
    .then(response => response.json())
    .then(routes => {
      const fromSelect = document.getElementById('from');
      const toSelect = document.getElementById('to');
      const fromOptions = [];
      const toOptions = [];

      routes.forEach(route => {
        if (!fromOptions.includes(route.from)) {
          fromOptions.push(route.from);
          fromSelect.innerHTML += `<option value="${route.from}">${route.from}</option>`;
        }
        if (!toOptions.includes(route.to)) {
          toOptions.push(route.to);
          toSelect.innerHTML += `<option value="${route.to}">${route.to}</option>`;
        }
      });
    });

  // Set minimum date for journey date input
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('journeyDate').setAttribute('min', today);
});

function searchBuses() {
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const journeyDate = document.getElementById('journeyDate').value;

  if (!from || !to || !journeyDate) {
    alert('Please fill in all required fields.');
    return;
  }

  if (from === to) {
    alert('The "From" and "To" locations cannot be the same.');
    return;
  }

  const route = `${from}-${to}`;
  const searchParams = new URLSearchParams({
    route,
    date: journeyDate,
  });

  window.location.href = `/search-results?${searchParams.toString()}`;
}
