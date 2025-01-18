var successMessageDiv = document.querySelector('.successful');
successMessageDiv.style.setProperty('top', `-${successMessageDiv.clientHeight}px`);

document.querySelectorAll('input').forEach((field) => {
    field.addEventListener('focus', () => {
        field.nextElementSibling.style.setProperty('font-size', '18px');
        field.nextElementSibling.style.setProperty('transform', 'translateY(-30px)');
    });

    field.addEventListener('mouseenter', () => {
        field.nextElementSibling.style.setProperty('font-size', '18px');
        field.nextElementSibling.style.setProperty('transform', 'translateY(-30px)');
    });

    field.addEventListener('mouseleave', () => {
        if (document.activeElement === field) { return; }
        if (field.value === '') {
            field.nextElementSibling.style.setProperty('font-size', '20px');
            field.nextElementSibling.style.setProperty('transform', 'translateY(0px)');
        }
    });

    field.addEventListener('focusout', () => {
        if (field.value === '') {
            field.nextElementSibling.style.setProperty('font-size', '20px');
            field.nextElementSibling.style.setProperty('transform', 'translateY(0px)');
        }
    })

    field.setAttribute('autocomplete', 'off');
})

if (document.getElementById('sign-in-form'))
    document.getElementById('sign-in-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const loginRequest = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username, password: password })
            });
            const loginResult = await loginRequest.json();
            if (loginRequest.ok)
                showMessageDiv('Sign in successful! Redirecting...');
            else
                setErrorMessage(loginResult['message']);
        }
        catch (error) {
            setErrorMessage('Server error :(');
        }
    });

if (document.getElementById('sign-up-form'))
    document.getElementById('sign-up-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const cpassword = document.getElementById('confirm-password').value;
        if (password !== cpassword) {
            setErrorMessage("Passwords don't match!");
            return;
        }
        try {
            const registerRequest = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username, firstName: firstName, lastName: lastName, password: password })
            });
            const registerResult = await registerRequest.json();
            if (registerRequest.ok) {
                showMessageDiv('Sign up successful! Redirecting...');
            }
            else
                setErrorMessage(registerResult['message']);
        }
        catch (error) {
            setErrorMessage('Server error :(');
        }
    });

if (document.getElementById('change-password-form'))
    document.getElementById('change-password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('password').value;
        const oldPassword = document.getElementById('old-password').value;
        const confirmNew = document.getElementById('confirm-password').value;
        if (newPassword !== confirmNew) {
            setErrorMessage("Passwords don't match!");
            return;
        }
        try {
            const changePasssReq = await fetch('/new-password', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: oldPassword, newPassword: newPassword })
            });
            const changePassResult = await changePasssReq.json();
            if (changePasssReq.ok)
                showMessageDiv('Password change successful! Redirecting...');
            else
                setErrorMessage(changePassResult['message']);
        }
        catch (error) {
            setErrorMessage('Server error :(');
        }
    })

function showMessageDiv(message) {
    successMessageDiv.innerHTML = message;
    successMessageDiv.style.setProperty('left', `calc(50% - ${successMessageDiv.clientWidth / 2}px)`);
    successMessageDiv.style.setProperty('transform', `translateY(calc(${innerHeight * 0.03}px + ${successMessageDiv.clientHeight}px))`);
    document.querySelector('.main-div').style.display = 'none';
    document.querySelector('.error-message').style.display = 'none';
    document.querySelector('.title-bar').style.display = 'none';
    setTimeout(() => {
        window.open('/', '_self');
    }, 1500);
}

function setErrorMessage(message) {
    document.querySelector('.error-message').classList.remove('hidden-error');
    document.querySelector('.error-message').textContent = message;
}

document.getElementById('password-shown').addEventListener('click', () => {
    document.getElementById('password-shown').classList.add('hidden-icon');
    document.getElementById('password-hidden').classList.remove('hidden-icon');
    document.getElementById('password').setAttribute('type', 'text');
});

document.getElementById('password-hidden').addEventListener('click', () => {
    document.getElementById('password-hidden').classList.add('hidden-icon');
    document.getElementById('password-shown').classList.remove('hidden-icon');
    document.getElementById('password').setAttribute('type', 'password');
});

if (document.getElementById('confirm-password-shown'))
    document.getElementById('confirm-password-shown').addEventListener('click', () => {
        document.getElementById('confirm-password-shown').classList.add('hidden-icon');
        document.getElementById('confirm-password-hidden').classList.remove('hidden-icon');
        document.getElementById('confirm-password').setAttribute('type', 'text');
    });

if (document.getElementById('confirm-password-hidden'))
    document.getElementById('confirm-password-hidden').addEventListener('click', () => {
        document.getElementById('confirm-password-hidden').classList.add('hidden-icon');
        document.getElementById('confirm-password-shown').classList.remove('hidden-icon');
        document.getElementById('confirm-password').setAttribute('type', 'password');
    });

if (document.getElementById('old-password-shown'))
    document.getElementById('old-password-shown').addEventListener('click', () => {
        document.getElementById('old-password-shown').classList.add('hidden-icon');
        document.getElementById('old-password-hidden').classList.remove('hidden-icon');
        document.getElementById('old-password').setAttribute('type', 'text');
    });

if (document.getElementById('old-password-hidden'))
    document.getElementById('old-password-hidden').addEventListener('click', () => {
        document.getElementById('old-password-hidden').classList.add('hidden-icon');
        document.getElementById('old-password-shown').classList.remove('hidden-icon');
        document.getElementById('old-password').setAttribute('type', 'password');
    });