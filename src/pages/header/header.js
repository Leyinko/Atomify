import { MAIN_ELEMENT$$ } from '../main/main';
import { fetchSongsBySearch } from '../../../public/api/fetch.js';
import {
  active_general,
  config_panel_icons,
  general_icons,
  navigation_icons,
  search_icons,
} from '../../../public/assets_constants';
import { router } from '../../router/router';
import { resetRecommendationsAlgorithmTimestamps } from '../../data/local-storage-mock';
import './header.css';

// > DOM Creation & Insertion

const HEADER_ELEMENT$$ = document.createElement('header');
HEADER_ELEMENT$$.setAttribute('role', 'region');
HEADER_ELEMENT$$.setAttribute('arial-label', 'Main-Navigation');

const header_template = `
  <div class="header-container">
    <div class="app-logo-container">
      <img src="${general_icons.app_header}" alt="app_logo_container">
    </div>
    <nav id="navigation_links"></nav>
    <div class="search_container">
      <img src="${search_icons.search}" alt="search_icon">
      <label for="search"></label>
      <input href="/search" type="text" id="search" name="search">
      <img src="${search_icons.cancel}" alt="cancel_search_icon">
    </div>
    <div id="panel_config"></div>
  </div>
	`;

HEADER_ELEMENT$$.innerHTML = header_template;
document.querySelector('#app').insertBefore(HEADER_ELEMENT$$, MAIN_ELEMENT$$);

// > Handlers

window.addEventListener('load', headerElementsHandlers);

// > Global Elements & Data
// Search Input
const search_input$$ = document.querySelector('header input[type="text"]');
const cancel_search_btn$$ = document.querySelector('.search_container img:last-of-type');
const panel_config_container$$ = document.getElementById('panel_config');
// Variables
const placeholder = 'What do you want to listen to?';
// Selected ID

// > Navigation Links

function headerLogoRedirectHandler() {
  let logo$$ = document.querySelector('.app-logo-container');
  logo$$.addEventListener('click', () => {
    history.pushState(null, null, '/home');
    router();
  });
}

function navigationLink$$() {
  // Container
  const navigation_container$$ = document.getElementById('navigation_links');
  // Links creation
  Object.entries(navigation_icons).forEach(([nav, img]) => {
    // Div
    let div = document.createElement('div');
    div.setAttribute('role', 'button');
    div.id = `${nav}_anchor`;
    // Img
    let icon = document.createElement('img');
    icon.src = img;
    icon.alt = `${nav}_icon`;
    // Anchors
    let anchor = document.createElement('a');
    anchor.href = `/${nav}`;
    anchor.textContent = nav.charAt(0).toUpperCase() + nav.substring(1);
    // DOM
    div.append(icon, anchor);
    navigation_container$$.appendChild(div);
  });
  // Link Router Listeners
  const rendered_links$$ = document.querySelectorAll('#navigation_links div');
  rendered_links$$.forEach((link) => {
    link.addEventListener('click', (e) => {
      let anchor = e.target.children[1];
      e.preventDefault();
      let href = anchor.getAttribute('href');
      history.pushState(null, null, href);
      router();
    });
  });
}

// > Search Input Handlers

search_input$$.setAttribute('placeholder', placeholder);

search_input$$.addEventListener('input', async (e) => {
  // Location change
  if (location.pathname !== '/explore') {
    history.pushState(null, null, '/explore');
    router();
  }
  //
  await fetchSongsBySearch(e.target.value);
  // Hide the cancel button
  e.target.value.length >= 1
    ? (cancel_search_btn$$.style.visibility = 'visible')
    : (cancel_search_btn$$.style.visibility = 'hidden');
});

// Cross Cancel Search Btn

cancel_search_btn$$.addEventListener('click', cancelSearchClose);

function cancelSearchClose() {
  search_input$$.value = '';
  fetchSongsBySearch(search_input$$.value);
  cancel_search_btn$$.style.visibility = 'hidden';
}

// > Config Panel

function panelConfig$$() {
  // Buttons creation
  Object.entries(config_panel_icons).forEach(([btn, img]) => {
    // Icon
    let icon = document.createElement('img');
    icon.setAttribute('role', 'button');
    icon.src = img;
    icon.alt = `${btn}_icon`;
    // DOM
    panel_config_container$$.appendChild(icon);
  });
  // Handlers
  let rendered_config_btns$$ = document.querySelectorAll('#panel_config img');
  rendered_config_btns$$.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      let att = e.target.getAttribute('alt').replace(/_[a-z]+/g, '');
      let keys = Object.keys(panelFunctions);

      keys.includes(att) ? panelFunctions[att](e) : null;
    });
  });
}

// > Panel Config (Configuration/Help)

const panelFunctions = {
  config: (e) => {
    // Element
    let modal_config$$ = document.querySelector('#modal-config');
    // Active Icon
    e.target.src = active_general.config;
    //
    if (!modal_config$$) {
      // Creation
      let modal_container$$ = document.createElement('div');
      modal_container$$.id = 'modal-config';

      modal_container$$.innerHTML = `
         <h3 role="button" id="log-out">Log Out</h3>
         <h3 role="button" id="reset-btn">Reset PC Account</h3>
      `;

      panel_config_container$$.appendChild(modal_container$$);
      // Toggle Visibility
      modal_container$$.classList.add('selection-active');
      // Menu Selection
      let modal_selection$$ = document.querySelectorAll('#modal-config h3');
      // Log Out
      modal_selection$$[0].addEventListener('click', () => {
        modal_container$$.classList.remove('selection-active');
        logOutActiveUser();
      });
      // Reset User Recommendations
      modal_selection$$[1].addEventListener('click', () => {
        resetUserRecommendations();
      });
    } else {
      // Toggle Visibility and Active icon by Removing from DOM
      e.target.src = config_panel_icons.config;
      modal_config$$.remove();
    }
  },
  help: () => {
    // Element
    let help_btn$$ = document.querySelectorAll('#panel_config img')[1];
    let article$$ = document.querySelector('#home');
    let help_container$$ = document.querySelector('#help-container');
    let home_userInfo$$ = document.querySelector('.user-information');
    let home_userSongs$$ = document.querySelector('#user-songs-section');
    let current_date$$ = document.querySelector('.current-date');
    // Visibility
    if (help_container$$) {
      help_container$$.remove();
      home_userSongs$$.classList.remove('blurred');
      home_userInfo$$.classList.remove('blurred');
      current_date$$.style.visibility = 'visible';
      // Btn Switch
      help_btn$$.src = config_panel_icons.help;
      return;
    }
    // Check if /home
    if (article$$) {
      // Btn On
      help_btn$$.classList.add('help-active');
      home_userSongs$$.classList.add('blurred');
      home_userInfo$$.classList.add('blurred');
      current_date$$.style.visibility = 'hidden';
      // Btn Switch
      help_btn$$.src = active_general.help;
      // Elements + DOM
      let help_container = document.createElement('div');
      help_container.id = 'help-container';

      help_container.innerHTML = `
        <div info="user"></div>
        <nav id="#user-songs-section">
          <div info="likes"></div>
          <div info="daily"></div>
          <div info="rec"></div>
        </nav>
      `;

      article$$.appendChild(help_container);
      // Information
      let boxes$$ = document.querySelectorAll('#help-container div');
      boxes$$.forEach((box) => {
        let att = box.getAttribute('info');
        //
        if (box.getAttribute('info') === att) {
          // Text info
          let text = document.createElement('p');
          text.innerText = text_information[att];

          box.className = `${att}_box`;
          box.appendChild(text);
        }
      });
    } else {
      history.pushState(null, null, '/home');
      router();
      // Recursive
      panelFunctions.help();
    }
    //
  },
};

// > Blur Handler for Configuration Btn

document.addEventListener('click', (e) => {
  let modal_config$$ = document.querySelector('#modal-config');
  let config_btn$$ = document.querySelectorAll('#panel_config img')[0];

  if (e.target !== config_btn$$ && modal_config$$ && !modal_config$$.contains(e.target)) {
    modal_config$$.remove();
    config_btn$$.src = config_panel_icons.config;
    return;
  }
});

// > Help Text Information

const text_information = {
  user: `PR (Official Spotify Popularity Rate)
  Represents the popularity of your liked songs.
  Higher rates indicate more popular and mainstream choices, while lower rates showcase a more unique and distinctive taste.

  PC (Predominant Category)
  Reflects the predominant genre of your playlist, giving insight into the overarching theme of your musical preferences.`,
  likes: `Likes list.

  Press the play button to start from the beginning, or choose a song to start from there.`,
  daily: `Daily Track

  Reset Time at 00:00`,
  rec: `
  Daily genre-based recommendations.
 
  The algorithm dynamically updates the flag in the top right of the recommendations box to showcase the Genre based on the account's most-listened genre.

  Despite flag changes, recommendations align with the genre indicated by the flag at the time of the reset.
 
  R : Rocky
  G : Groovy
  A : Alternative
  A+ : ++
  
  *Reset your algorithm anytime via the Configuration panel.`,
};

// > Configuration Modal Buttons

const logOutActiveUser = () => {
  history.pushState(null, null, '/login');
  router();
  window.location.reload();
};

const resetUserRecommendations = () => {
  // Elements
  let confirmation_box$$ = document.querySelector('#reset-confirmation');
  let config_modal$$ = document.querySelector('#modal-config');
  // Condition
  if (!confirmation_box$$) {
    // Elements
    let confirmation_box$$ = document.createElement('div');
    confirmation_box$$.id = 'reset-confirmation';

    confirmation_box$$.innerHTML = `
      <span class="yes">Y</span>
      <span class="no">N</span>
    `;
    // DOM
    document.querySelector('#modal-config').appendChild(confirmation_box$$);
    // Handlers
    let choices = confirmation_box$$.querySelectorAll('span');
    choices.forEach((choice) => {
      choice.addEventListener('click', (e) => {
        // Yes
        if (e.target.innerText === 'Y') {
          resetRecommendationsAlgorithmTimestamps();
          config_modal$$.remove();
          // No
        } else {
          confirmation_box$$.remove();
        }
      });
    });
  }
};

// > Handlers Function

function headerElementsHandlers() {
  headerLogoRedirectHandler();
  panelConfig$$();
  navigationLink$$();
}
