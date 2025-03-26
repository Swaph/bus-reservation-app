// Wait for Firebase to initialize
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Wait for Firebase to be initialized
            await window.firebaseInitialized;
            
            // Attempt to sign in
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            
            if (userCredential.user) {
                alert("Login successful! Redirecting...");
                window.location.href = '../index.html';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = error.message;
        }
    });
}); 