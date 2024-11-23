function loginUser(email, password) {
    fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                sessionStorage.setItem('token', data.token);
                window.location.href = 'dashboard.html'; // Redirect to dashboard
            } else {
                showError(data.error || 'Login failed');
            }
        })
        .catch(err => {
            console.error('Login Error:', err);
            showError('An error occurred during login');
        });
}

// Define the signupUser function in auth.js
function signupUser(email, username, password) {
    fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert('Registration successful!');
                window.location.href = 'login.html';
            } else {
                showError(data.error || 'Registration failed');
            }
        })
        .catch(err => {
            console.error('Registration Error:', err);
            showError('An error occurred during registration');
        });
}

// Google Sign-In handling function
function handleCredentialResponse(response) {
    const idToken = response.credential;  // Extract the ID token from the response

    // Send the ID token to your backend server to verify the user's identity
    fetch('http://localhost:8000/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                sessionStorage.setItem('token', data.token); // Store the JWT token
                window.location.href = 'dashboard.html'; // Redirect to the dashboard
            } else {
                showError('Google login failed.');
            }
        })
        .catch(err => {
            console.error('Error during Google login:', err);
            showError('An error occurred during Google login.');
        });
}

// Display error message
function showError(message) {
    const errorMessage = document.getElementById('error-message');

    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}