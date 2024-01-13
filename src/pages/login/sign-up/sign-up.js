import { connection_icons, general_icons, profile_pictures } from '../../../../public/assets_constants';
import { fetchSingularCategoryPreview } from '../../../../public/api/fetch.js';
import { postRegistration } from '../../../data/local-storage-mock';
import './sign-up.css';

export const Signup = () => {
  let signup_form_template = `
	<img src="${general_icons.fetch_loading}">
		<form id="signup_container" autocomplete="off">
			<label for="emailField">Email</label>
			<input type="email" id="emailField" name="emailField" placeholder="Email">
			<label for="usernameField">Username</label>
			<input type="text" id="usernameField" name="usernameField" placeholder="Username">
			<label for="passwordField">Create password</label>
			<input type="text" id="passwordField" name="passwordField" placeholder="Password">
			<label for="confirmPasswordField">Confirm password</label>
			<input type="text" id="confirmPasswordField" name="confirmPasswordField" placeholder="Password">
			<button type="submit">Sign Up</button>
		</form>
`;
  // Article Inner HTML
  document.querySelector('#signup').innerHTML = signup_form_template;
  // Main Functionality
  formRegistrationFields();
  formClassSelection();
};

// > Form Checks And Requirements for Registration

// Requirements
let form_requirements = {
  email: false,
  username: false,
  password: false,
  cat: false,
};

const formRegistrationFields = () => {
  // Elements
  let text_inputs$$ = document.querySelectorAll('#signup_container input');
  let submit_btn$$ = document.querySelector('#signup_container button');
  // Input Listeners
  text_inputs$$.forEach((input) => {
    // Prevent 'Enter' key to send form
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
    input.addEventListener('input', checkDataForSubmit);
    input.addEventListener('blur', checkDataForSubmit);
  });
  // Submit Button Listener
  submit_btn$$.addEventListener('click', async (e) => {
    e.preventDefault();
    // New User
    let newUser = {
      id: randomUserID(),
      email: validateEmailField(),
      username: validateUsername(),
      password: validatePasswordField(),
      category: validateCategorySelection(),
      timestamps: {
        A_plus: 0,
        A: 0,
        G: 0,
        R: 0,
      },
      profile_picture: profile_pictures.blood,
    };
    // Post Registration
    postRegistration(newUser);
  });
};

// > Validation Entries

function randomUserID() {
  const timestamp = new Date().getTime().toString(36);
  const randomString = Math.random().toString(36).substring(2, 8);
  const ID = (timestamp + randomString).substring(4);
  return '#' + ID.toUpperCase();
}

const validateUsername = () => {
  // Input
  let username = document.querySelector('#signup_container [name="usernameField"]');
  // Empty Field
  if (username.value === '') {
    username.style.border = '';
    username.style.color = '';
    form_requirements.username = false;
    return;
  }
  // Check
  if (username.value.length > 3) {
    username.style.border = '1px solid var(--green-valid-field)';
    form_requirements.username = true;
  } else {
    username.style.border = '1px solid var(--red-valid-field)';
    form_requirements.username = false;
  }
  //
  return username.value;
};

export const validateEmailField = () => {
  // Input
  let email = document.querySelector('#signup_container [name="emailField"]');
  let validEmail;
  // Empty Field
  if (email.value === '') {
    email.style.border = '';
    email.style.color = '';
    form_requirements.email = false;
    return;
  }
  // Check
  let check = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (check.test(email.value)) {
    email.style.border = '1px solid var(--green-valid-field)';
    form_requirements.email = true;
  } else {
    email.style.border = '1px solid var(--red-valid-field)';
    form_requirements.email = false;
  }
  // Validate
  validEmail = email.value;
  return validEmail;
};

const validatePasswordField = () => {
  // Inputs
  let password = document.querySelector('#signup_container [name="passwordField"]');
  let confirm = document.querySelector('#signup_container [name="confirmPasswordField"]');
  let validPassword;
  // Empty Field
  if (password.value.length === 0 || confirm.value.length === 0) {
    password.style.border = '';
    form_requirements.password = false;
    return;
  }
  // Check
  if (password.value === confirm.value && password.value.length !== 0) {
    password.style.border = '1px solid var(--green-valid-field)';
    form_requirements.password = true;
  } else {
    password.style.border = '1px solid var(--red-valid-field)';
    confirm.style.border = '';
    form_requirements.password = false;
  }
  // Validate
  validPassword = password.value;
  return validPassword;
};

const validateCategorySelection = () => {
  // Category Card
  let selected_card$$ = document.querySelector('.selected-preview');
  // Check
  if (selected_card$$) {
    form_requirements.cat = true;
    // Validate
    let category = selected_card$$.getAttribute('cat');
    return category;
  } else {
    form_requirements.cat = false;
  }
};

const checkDataForSubmit = () => {
  // Fields Checks
  validateEmailField();
  validateUsername();
  validatePasswordField();
  validateCategorySelection();
  // Result
  Object.values(form_requirements).filter((requirement) => requirement === true).length === 4
    ? accountCreationConfirmed()
    : accountCreationDenied();
};

export const emailAlreadyTaken = () => {
  let email = document.querySelector('#signup_container [name="emailField"]');
  // Message
  email.value = '❌ This email is already taken.';
  email.style.border = '1px solid var(--red-valid-field)';
  email.style.color = 'var(--red-valid-field)';
  // Requirements
  form_requirements.email = false;
  // Launch re-check
  checkDataForSubmit();
};

const accountCreationConfirmed = () => {
  let submit_btn$$ = document.querySelector('#signup_container button');
  submit_btn$$.classList.add('signup-confirmed');
};

const accountCreationDenied = () => {
  let submit_btn$$ = document.querySelector('#signup_container button');
  submit_btn$$.classList.remove('signup-confirmed');
};

// > Fetch User Category Selection

const formClassSelection = async () => {
  // Container
  let category_container$$ = document.createElement('div');
  category_container$$.id = 'category_selection_account';

  // Information Box
  let category_information$$ = document.createElement('div');
  category_information$$.id = 'information_class';
  category_information$$.innerHTML = `
    <span>Choose a track</span>
    <img role="button" src="${connection_icons.info}">
  `;

  // Information Modal
  let info_text_container$$ = document.createElement('div');
  info_text_container$$.className = 'information-text';

  let info_text$$ = document.createElement('span');
  info_text$$.innerText = `Select one of the three tracks, each representing a different genre, to personalize your music recommendations. 

  Your initial choice influences the algorithm, yet remains flexible to adapt as your preferences evolve over time.`;

  info_text_container$$.appendChild(info_text$$);
  category_information$$.appendChild(info_text_container$$);
  category_container$$.appendChild(category_information$$);

  // Fetch Tracks & Add Cards
  let categorySelection = await fetchSingularCategoryPreview();
  categorySelection.forEach((item) => {
    category_container$$.innerHTML += previewCard$$(item);
  });

  // Audio
  let audio_preview$$ = document.createElement('audio');
  category_container$$.appendChild(audio_preview$$);

  // Append ALL
  let submit_btn$$ = document.querySelector('#signup_container button');
  document.querySelector('#signup_container').insertBefore(category_container$$, submit_btn$$);

  // Cards Handlers
  let preview_cards$$ = document.querySelectorAll('[preview]');
  preview_cards$$.forEach((card) => {
    card.addEventListener('click', (e) => {
      // Elements
      let audio = document.querySelector('#category_selection_account audio');
      let url = e.target.getAttribute('preview');
      // Audio
      audio.volume = 0;
      audio.addEventListener('canplay', fadeIn);
      audio.addEventListener('timeupdate', fadeOut);
      // Actions
      audio.src = url;
      audio.play();
      e.target.classList.add('selected-preview');
      // Selected Class Toggle
      preview_cards$$.forEach((img) => {
        if (img.classList.contains('selected-preview') && img !== e.target) {
          img.classList.remove('selected-preview');
        }
      });
      // Requirements Update Card Check
      checkDataForSubmit();
    });
  });

  // Information Box
  let info_btn$$ = document.querySelector('#information_class img');
  info_btn$$.addEventListener('click', () => {
    document.querySelector('.information-text').classList.toggle('information-active');
  });
};

// > Selection Class Card

const previewCard$$ = (sel) => {
  return `
	<img cat="${sel.class}" src="${sel.image}" preview="${sel.url}">
`;
};

// > Fade Audio Effects

const fadeIn = () => {
  let audio = document.querySelector('#signup_container audio');
  let fadeStep = 0.02;
  // Fade In
  const fadeInInterval = setInterval(() => {
    if (audio.currentTime < 3 && audio.volume < 0.9) {
      audio.volume += fadeStep;
    } else {
      audio.volume = 1;
      clearInterval(fadeInInterval);
    }
  }, 70);
};

export const fadeOut = () => {
  let audio = document.querySelector('#signup_container audio');
  let duration = audio.duration - audio.currentTime;
  let fadeStep = 0.02;
  // Fade Out
  if (duration < 3) {
    const fadeOutInterval = setInterval(() => {
      if (duration < 3 && audio.volume > 0.1) {
        audio.volume -= fadeStep;
      } else {
        audio.volume = 0;
        clearInterval(fadeOutInterval);
      }
    }, 70);
  }
};
