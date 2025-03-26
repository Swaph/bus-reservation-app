// Wait for Firebase to initialize
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const errorMessage = document.getElementById('error-message');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            errorMessage.textContent = "Passwords do not match!";
            return;
        }

        try {
            // Wait for Firebase to be initialized
            await window.firebaseInitialized;
            
            // Attempt to create user
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
            if (userCredential.user) {
                // Update user profile with name
                await userCredential.user.updateProfile({ displayName: name });
                alert("Account created successfully! Redirecting...");
                window.location.href = '../index.html';
            }
        } catch (error) {
            console.error('Signup error:', error);
            errorMessage.textContent = error.message;
        }
    });
}); 