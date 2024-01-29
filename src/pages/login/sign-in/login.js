import { resetOnlineStatus, userAuthentication } from '../../../data/local-storage-mock';
import { router } from '../../../router/router';
import './login.css';

export async function Login() {
  // Reset 'Token'
  let user = localStorage.getItem('users');
  if (user) {
    resetOnlineStatus();
  }
  //
  let login_template = `
		<img src="/assets/icons/general/app_icon.svg">
			<form id="login_container">
				<label for="emailField">Email</label>
				<input type="email" id="emailField" name="emailField" placeholder="Email" autocomplete="off">
				<label for="passwordField">Password</label>
				<input type="password" id="passwordField" name="passwordField" placeholder="Password" autocomplete="off">
				<button>Log In</button>
				<span>Don't have an account? <a href="/signup">Sign up</a></span>
			</form>
	`;
  // DOM
  document.querySelector('#login').innerHTML = login_template;
  // Handlers
  userLoginFields();
}

// > Authentication

const userLoginFields = () => {
  let text_inputs$$ = document.querySelectorAll('#login_container input');
  let log_in_btn$$ = document.querySelector('#login_container button');
  let sign_up$$ = document.querySelector('#login_container span:last-of-type a');
  // Reset Listener
  text_inputs$$.forEach((input) => {
    input.addEventListener('input', resetUserConnectionChecks);
    input.addEventListener('blur', resetUserConnectionChecks);
  });
  // Submit
  log_in_btn$$.addEventListener('click', async (e) => {
    e.preventDefault();

    let email = text_inputs$$[0].value;
    let password = text_inputs$$[1].value;
    // Login
    userAuthentication(email, password);
  });
  // Sign Up
  sign_up$$.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, null, '/signup');
    router();
  });
};

// > Validation Entries

const resetUserConnectionChecks = () => {
  let username = document.querySelector('#login_container [name="emailField"]');
  let password = document.querySelector('#login_container [name="passwordField"]');
  if (username.value.length < 1) {
    username.style.border = '';
    username.style.color = '';
  }
  if (password.value.length < 1) {
    password.style.border = '';
    password.style.color = '';
    password.type = 'password';
  }
};

export const wrongPassword = () => {
  let password = document.querySelector('#login_container [name="passwordField"]');
  password.type = 'text';
  password.value = '❌ Wrong password';
  password.style.border = '1px solid var(--red-valid-field)';
  password.style.color = 'var(--red-valid-field)';
};

export const wrongUser = () => {
  let email = document.querySelector('#login_container [name="emailField"]');
  email.value = '❌ Invalid email';
  email.style.border = '1px solid var(--red-valid-field)';
  email.style.color = 'var(--red-valid-field)';
};
