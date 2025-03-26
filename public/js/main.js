// Function to get Firebase ID token
async function getAuthToken() {
    const user = firebase.auth().currentUser;
    if (user) {
        return await user.getIdToken();
    }
    return null;
}

// Function to make authenticated API requests
async function makeAuthenticatedRequest(url, options = {}) {
    const token = await getAuthToken();
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        window.location.href = '/login.html';
        return;
    }
    return response;
}

// Example usage:
// Instead of fetch('/api/available-seats')
// Use: makeAuthenticatedRequest('/api/available-seats') 