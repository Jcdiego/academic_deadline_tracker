const loginForm = document.querySelector('#loginForm');
const loginMessage = document.querySelector('#loginMessage');

loginForm.addEventListener('submit', (event) => {
	event.preventDefault();

	if (!loginForm.reportValidity()) return;

	const email = loginForm.elements.username.value.trim().toLowerCase();
	const password = loginForm.elements.password.value;

	if (!email || !password) {
		loginMessage.textContent = 'Enter your email and password to continue.';
		loginMessage.hidden = false;
		return;
	}

	try {
		sessionStorage.setItem('academic-tracker-user', email);
	} catch {
		// Continue into the demo even when browser storage is unavailable.
	}

	loginMessage.textContent = 'Demo sign-in complete. Opening your tracker...';
	loginMessage.hidden = false;
	window.setTimeout(() => {
		window.location.assign('../githubfiles/academic_deadline_tracker/academicdeadlinetracker.html');
	}, 500);
});
