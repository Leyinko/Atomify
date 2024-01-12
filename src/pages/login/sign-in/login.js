import { general_icons } from '../../../../public/assets_constants';
import { resetOnlineStatus, userAuthentication } from '../../../data/local-storage-mock';
import './login.css';

export const Login = async () => {
  // Reset 'Online Status' if Existing user
  let user = localStorage.getItem('users');
  if (user) {
    resetOnlineStatus();
  }
  // Login Template
  let login_template = `
		<img src="${general_icons.fetch_loading}">
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
};

// > Authentication

const userLoginFields = () => {
  // Elements
  let text_inputs$$ = document.querySelectorAll('#login_container input');
  let log_in_btn$$ = document.querySelector('#login_container button');
  // Input Listener for Reset
  text_inputs$$.forEach((input) => {
    input.addEventListener('input', resetUserConnectionChecks);
    input.addEventListener('blur', resetUserConnectionChecks);
  });
  // Submit Button Listener
  log_in_btn$$.addEventListener('click', async (e) => {
    e.preventDefault();
    // Values
    let email = text_inputs$$[0].value;
    let password = text_inputs$$[1].value;
    // Login
    userAuthentication(email, password);
  });
};

// > Validation Entries

const resetUserConnectionChecks = () => {
  // Inputs
  let username = document.querySelector('#login_container [name="emailField"]');
  let password = document.querySelector('#login_container [name="passwordField"]');
  // Checks
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
  // Message
  password.type = 'text';
  password.value = '❌ Wrong password';
  password.style.border = '1px solid var(--red-valid-field)';
  password.style.color = 'var(--red-valid-field)';
};

export const wrongUser = () => {
  let email = document.querySelector('#login_container [name="emailField"]');
  // Message
  email.value = '❌ Invalid email';
  email.style.border = '1px solid var(--red-valid-field)';
  email.style.color = 'var(--red-valid-field)';
};
