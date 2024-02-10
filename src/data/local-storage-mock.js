import { wrongPassword, wrongUser } from '../pages/login/sign-in/login';
import { emailAlreadyTaken, fadeOut } from '../pages/login/sign-up/sign-up';
import { pushStateHomeRefresh, router } from '../router/router';

// > Register (/signup)

export const postRegistration = (user) => {
  if (checkAvailableEmail(user)) {
    let getUsers = localStorage.getItem('users');
    const existingData = getUsers ? JSON.parse(getUsers) : [];
    // Data
    existingData.push(user);
    const combinedDataString = JSON.stringify(existingData);
    localStorage.setItem('users', combinedDataString);
    // Redirect
    accountCreatedWithSuccessLS();
  } else {
    emailAlreadyTaken();
  }
};

export const checkAvailableEmail = (created) => {
  let isEmailAvailable;
  let getUsers = JSON.parse(localStorage.getItem('users'));
  // Data
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
  return isEmailAvailable;
};

const accountCreatedWithSuccessLS = () => {
  let preview_audio$$ = document.querySelector('#category_selection_account audio');
  let article_signup$$ = document.querySelector('#signup');
  let logo_img$$ = article_signup$$.children[0];
  // Reset
  preview_audio$$.removeEventListener('timeupdate', fadeOut);
  article_signup$$.children[1].remove();
  article_signup$$.children[0].remove();
  // Message
  const creation_message_container$$ = document.createElement('div');
  creation_message_container$$.className = 'creation-container-message';

  let success$$ = document.createElement('span');
  success$$.innerText = `Account created successfully`;

  article_signup$$.append(logo_img$$, creation_message_container$$);
  creation_message_container$$.appendChild(success$$);

  // Redirect
  setTimeout(() => {
    history.pushState(null, null, '/login');
    router();
  }, 3000);
};

// > Connection (/login)

export const userAuthentication = (email, password) => {
  let exists;
  let getUsers = JSON.parse(localStorage.getItem('users')) || [];
  let user = getUsers.find((user) => user.email === email);
  // Data
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
    // "Token"
    setUserData(user.id, 'status', 'online');
    // Redirect
    userAccessGranted();
  }
};

const userAccessGranted = () => {
  document.querySelector('main article').innerHTML = null;
  let header$$ = document.querySelector('header');
  header$$.style.visibility = 'visible';
  // Start to Explore
  history.pushState(null, null, '/home');
  router();
};

// > Getting/Setting User Data

export const setUserData = (ID, key, value) => {
  let getUsers = JSON.parse(localStorage.getItem('users'));
  let user = getUsers.find((user) => user.id === ID);
  // Set Data
  user[key] = value;
  localStorage.setItem('users', JSON.stringify(getUsers));
};

export const deleteUserData = (ID, key) => {
  let getUsers = JSON.parse(localStorage.getItem('users'));
  let user = getUsers.find((user) => user.id === ID);
  // Delete Data
  delete user[key];
  localStorage.setItem('users', JSON.stringify(getUsers));
};

export const getActiveUserData = () => {
  let getUsers = JSON.parse(localStorage.getItem('users'));
  const user = getUsers.length === 1 ? getUsers[0] : getUsers.find((user) => user.status === 'online');
  return user;
};

// > User Preferences

export const addLikeTrack = (song) => {
  let getUsers = JSON.parse(localStorage.getItem('users')) || [];
  let user = getActiveUserData();
  // Data
  if (!user.hasOwnProperty('likes')) {
    user.likes = [song];
  } else if (user.likes.includes(song)) return;
  else {
    user.likes.push(song);
  }
  // Updated Data
  const updatedUser = getUsers.map((ls) => (ls.id === user.id ? user : ls));
  localStorage.setItem('users', JSON.stringify(updatedUser));
};

export const deleteLikeTrack = (song) => {
  let getUsers = JSON.parse(localStorage.getItem('users')) || [];
  let user = getActiveUserData();
  // Data
  user.likes = user.likes.filter((liked) => liked !== song);
  // Updated Data
  const updatedUser = getUsers.map((ls) => (ls.id === user.id ? user : ls));
  localStorage.setItem('users', JSON.stringify(updatedUser));
};

export const setRecommendations = (array) => {
  let getUsers = JSON.parse(localStorage.getItem('users')) || [];
  let user = getActiveUserData();
  // Data
  user.recommendations = [];
  // Recommendations
  array.forEach((id) => {
    if (!user.hasOwnProperty('recommendations')) {
      user.recommendations = [id];
    } else {
      user.recommendations.push(id);
    }
  });
  // Updated Data
  const updatedUser = getUsers.map((ls) => (ls.id === user.id ? user : ls));
  localStorage.setItem('users', JSON.stringify(updatedUser));
};

// > PC Algorithm

export const countGenreSeconds = (genre) => {
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
  // Updated Data
  const updatedUser = getUsers.map((ls) => (ls.id === user.id ? user : ls));
  localStorage.setItem('users', JSON.stringify(updatedUser));
  // PC Update
  userCategoryUpdate();
};

export const resetRecommendationsAlgorithmTimestamps = () => {
  let getUsers = JSON.parse(localStorage.getItem('users')) || [];
  let user = getActiveUserData();
  // Data
  for (let key in user.timestamps) {
    user.timestamps[key] = 0;
  }
  // Updated Data
  const updatedUser = getUsers.map((ls) => (ls.id === user.id ? user : ls));
  localStorage.setItem('users', JSON.stringify(updatedUser));
  // Redirect
  pushStateHomeRefresh();
};

export const userCategoryUpdate = () => {
  let user = getActiveUserData();
  // Data
  let obj = user.timestamps;
  let highest = Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b));
  highest === 'A_plus' ? (highest = 'A+') : null;
  // Set Data
  setUserData(user.id, 'category', highest);
};

// > Reset Online Status on Reload

export const resetOnlineStatus = () => {
  let getUsers = JSON.parse(localStorage.getItem('users'));
  // Delete "Token"
  getUsers.forEach((user) => delete user.status);
  localStorage.setItem('users', JSON.stringify(getUsers));
};

// // * ADMIN ZONE & RESET TEST * //

// // Status Delete
// // deleteUserData('#COTXKYOHFI', 'recommendations');

// export const usersTestLS = () => {
//   const users = localStorage.getItem('users');
//   console.log(`Users DDBB:`, JSON.parse(users));
//   // console.log(JSON.parse(users)[0].likes);
// };

// usersTestLS();

// function clearAllLS() {
//   localStorage.clear();
// }

// // clearAllLS();
