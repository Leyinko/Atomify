import { pushStateHomeRefresh } from '../components/cards/playing-card/playing-card';
import { wrongPassword, wrongUser } from '../pages/login/sign-in/login';
import { emailAlreadyTaken, fadeOut } from '../pages/login/sign-up/sign-up';
import { router } from '../router/router';

// > Register New User (/signup)

export const postRegistration = (user) => {
  if (checkAvailableEmail(user)) {
    // Retrieve Users
    let getUsers = localStorage.getItem('users');
    // Parse the existing data
    const existingData = getUsers ? JSON.parse(getUsers) : [];
    // Combined Data
    existingData.push(user);
    // Convert back to String
    const combinedDataString = JSON.stringify(existingData);
    // Store the updated string back in localStorage
    localStorage.setItem('users', combinedDataString);
    // Redirect
    accountCreatedWithSuccessLS();
  } else {
    emailAlreadyTaken();
  }
};

export const checkAvailableEmail = (created) => {
  let isEmailAvailable;
  // Retrieve Users
  let getUsers = JSON.parse(localStorage.getItem('users'));
  // Checks for Available Email / First E-mail in DDBB
  if (getUsers) {
    getUsers.forEach((user) => {
      if (user.email === created.email) {
        isEmailAvailable = false;
      } else {
        isEmailAvailable = true;
      }
    });
  } else {
    isEmailAvailable = true;
  }
  //
  return isEmailAvailable;
};

const accountCreatedWithSuccessLS = () => {
  // Elements
  let preview_audio$$ = document.querySelector('#category_selection_account audio');
  let article_signup$$ = document.querySelector('#signup');
  let logo_img$$ = article_signup$$.children[0];

  // Reset Article
  preview_audio$$.removeEventListener('timeupdate', fadeOut);
  article_signup$$.children[1].remove();
  article_signup$$.children[0].remove();

  // Message
  const creation_message_container$$ = document.createElement('div');
  creation_message_container$$.className = 'creation-container-message';

  let success$$ = document.createElement('span');
  success$$.innerText = `Account created successfully`;

  // Appending Elements
  article_signup$$.append(logo_img$$, creation_message_container$$);
  creation_message_container$$.appendChild(success$$);

  // Redirect to Login page
  setTimeout(() => {
    history.pushState(null, null, '/login');
    router();
  }, 3000);
};

// > Connection to Account (/login)

export const userAuthentication = (email, password) => {
  let exists;
  // Retrieve Users
  let getUsers = JSON.parse(localStorage.getItem('users')) || [];
  // Retrieve Target User
  let user = getUsers.find((user) => user.email === email);
  // Check for Existing user
  !user ? (exists = false) : (exists = true);
  // Pass Data
  return checkLoginData([exists, user], password);
};

export const checkLoginData = ([exists, user], password) => {
  if (!exists) {
    wrongUser();
  } else if (exists && user.password !== password) {
    wrongPassword();
  } else if (exists && user.password === password) {
    // "Token" granted at connection
    setUserData(user.id, 'status', 'online');
    usersTestLS();
    // Redirect /home
    userAccessGranted();
  }
};

const userAccessGranted = () => {
  // Reset Current Article
  document.querySelector('main article').innerHTML = null;
  // Initial Launching (Temporal)
  let header$$ = document.querySelector('header');
  header$$.style.visibility = 'visible';
  // Start to Explore
  history.pushState(null, null, '/explore');
  router();
};

// > Getting/Setting User Data

export const setUserData = (ID, key, value) => {
  // Retrieve User
  let getUsers = JSON.parse(localStorage.getItem('users'));
  let user = getUsers.find((user) => user.id === ID);
  // Set Data
  user[key] = value;
  // Send to LS
  localStorage.setItem('users', JSON.stringify(getUsers));
};

export const deleteUserData = (ID, key) => {
  // Retrieve User
  let getUsers = JSON.parse(localStorage.getItem('users'));
  let user = getUsers.find((user) => user.id === ID);
  // Set Data
  delete user[key];
  // Send to LS
  localStorage.setItem('users', JSON.stringify(getUsers));
};

export const getActiveUserData = () => {
  // Retrieve User
  let getUsers = JSON.parse(localStorage.getItem('users'));
  //Check User
  const user = getUsers.length === 1 ? getUsers[0] : getUsers.find((user) => user.status === 'online');
  return user;
};

// > Like Section & Recommendations

export const addLikeTrack = (song) => {
  // Retrieve User
  let getUsers = JSON.parse(localStorage.getItem('users')) || [];
  let user = getActiveUserData();
  // Likes
  if (!user.hasOwnProperty('likes')) {
    user.likes = [song];
  } else if (user.likes.includes(song)) return;
  else {
    user.likes.push(song);
  }
  // Updated User
  const updatedUser = getUsers.map((ls) => (ls.id === user.id ? user : ls));
  // Send to LS
  localStorage.setItem('users', JSON.stringify(updatedUser));
};

export const deleteLikeTrack = (song) => {
  // Retrieve User
  let getUsers = JSON.parse(localStorage.getItem('users')) || [];
  let user = getActiveUserData();
  // Likes
  user.likes = user.likes.filter((liked) => liked !== song);
  // Updated User
  const updatedUser = getUsers.map((ls) => (ls.id === user.id ? user : ls));
  // Send to LS
  localStorage.setItem('users', JSON.stringify(updatedUser));
};

export const setRecommendations = (array) => {
  // Retrieve User
  let getUsers = JSON.parse(localStorage.getItem('users')) || [];
  let user = getActiveUserData();
  // Reset Recommendations
  user.recommendations = [];
  // Recommendations
  array.forEach((id) => {
    if (!user.hasOwnProperty('recommendations')) {
      user.recommendations = [id];
    } else {
      user.recommendations.push(id);
    }
  });
  // Updated User
  const updatedUser = getUsers.map((ls) => (ls.id === user.id ? user : ls));
  // Send to LS
  localStorage.setItem('users', JSON.stringify(updatedUser));
};

// > Recommendations Timestamps & Category Update

export const countGenreSeconds = (genre) => {
  // Retrieve User
  let getUsers = JSON.parse(localStorage.getItem('users')) || [];
  let user = getActiveUserData();
  // Conditions
  if (genre === 'A') {
    user.timestamps[genre] += 0.1;
  } else if (genre === 'G') {
    user.timestamps[genre] += 0.1;
  } else if (genre === 'R') {
    user.timestamps[genre] += 0.1;
  } else if (!genre) {
    return;
  } else {
    user.timestamps.A_plus += 0.1;
  }
  // Updated User
  const updatedUser = getUsers.map((ls) => (ls.id === user.id ? user : ls));
  // Send to LS
  localStorage.setItem('users', JSON.stringify(updatedUser));
  // User Category Changes
  userCategoryUpdate();
};

export const resetRecommendationsAlgorithmTimestamps = () => {
  // Retrieve User
  let getUsers = JSON.parse(localStorage.getItem('users')) || [];
  let user = getActiveUserData();
  // Reset all values
  for (let key in user.timestamps) {
    user.timestamps[key] = 0;
  }
  // Updated User
  const updatedUser = getUsers.map((ls) => (ls.id === user.id ? user : ls));
  // Send to LS
  localStorage.setItem('users', JSON.stringify(updatedUser));
  // Refresh
  pushStateHomeRefresh();
};

export const userCategoryUpdate = () => {
  // Retrieve User
  let user = getActiveUserData();
  // Higher Category Score
  let obj = user.timestamps;
  let highest = Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b));
  highest === 'A_plus' ? (highest = 'A+') : null;
  // Set new Category
  setUserData(user.id, 'category', highest);
};

// > Reset Online Status on Reload

export const resetOnlineStatus = () => {
  let getUsers = JSON.parse(localStorage.getItem('users'));
  // Delete Status
  getUsers.forEach((user) => delete user.status);
  // Send to LS
  localStorage.setItem('users', JSON.stringify(getUsers));
};

// * Checking localStorage Functions * //

// Status Delete
// deleteUserData('#COTXKYOHFI', 'recommendations');

export const usersTestLS = () => {
  const users = localStorage.getItem('users');
  console.log(`Users DDBB:`, JSON.parse(users));
  // console.log(JSON.parse(users)[0].likes);
};

usersTestLS();

function clearAllLS() {
  localStorage.clear();
}

// clearAllLS();
