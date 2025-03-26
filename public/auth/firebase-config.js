// Create a Promise that resolves when Firebase is initialized
window.firebaseInitialized = new Promise((resolve, reject) => {
  // Fetch Firebase configuration from server
  fetch('/firebase-config')
    .then(response => response.json())
    .then(config => {
      // Initialize Firebase with the fetched configuration
      firebase.initializeApp(config);
      resolve();
    })
    .catch(error => {
      console.error('Error loading Firebase configuration:', error);
      reject(error);
    });
});
