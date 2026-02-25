document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    console.log('Auth script loaded');
    console.log('Login form found:', !!loginForm);
    console.log('Register form found:', !!registerForm);

    // Redirect to dashboard if already logged in
    if (isAuthenticated() && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
        console.log('User is authenticated, redirecting to dashboard');
        window.location.href = '/';
        return;
    }

    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;

            try {
                const data = await apiRequest('/auth/login', {
                    method: 'POST',
                    body: { email, password }
                });

                console.log('Login successful:', data);

                // Store user data
                localStorage.setItem('studyPlannerToken', data.token);
                localStorage.setItem('userName', data.name);
                localStorage.setItem('userStreak', data.streak || 0);

                showNotification('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);

            } catch (error) {
                console.error('Login error:', error);
                showNotification(error.message || 'Login failed. Please try again.', 'error');
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Register form handler
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Register form submitted');
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            submitBtn.disabled = true;

            try {
                const data = await apiRequest('/auth/register', {
                    method: 'POST',
                    body: { name, email, password }
                });

                console.log('Registration successful:', data);

                showNotification('Registration successful! Redirecting to login...', 'success');
                
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);

            } catch (error) {
                console.error('Registration error:', error);
                showNotification(error.message || 'Registration failed. Please try again.', 'error');
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Debug: Log current path
    console.log('Current path:', window.location.pathname);
});