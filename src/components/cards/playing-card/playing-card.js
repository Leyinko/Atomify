import { active_general, cards_icons } from '../../../../public/assets_constants';
import { addLikeTrack, deleteLikeTrack, getActiveUserData } from '../../../data/local-storage-mock';
import { router } from '../../../router/router';
import './playing-card.css';

// > Playing Card

export const playing_card$$ = (id, img, alt, title, artist, href, bg_color) => {
  //
  let playing_card = `
  <div id="${id}" class="playing_card">
    <img src="${img}" alt="${alt + '_playing_cover_error'}">
		<div class="playing_card_info">
			<h4>${title}</h4>
			<span>${artist}</span>
		</div>
		<div id="playing_card_ctrls">
			<img role="button" src="${cards_icons.lyrics}" alt="lyrics_icon">
			<img role="button" src="${cards_icons.like}" alt="like_icon">
			<img role="button" src="${cards_icons.spotify}" href="${href}" alt="spotify_icon">
		</div>
		<div class="lyrics-container"></div>
    <div role="button" class="hide-playing-card-toggle"></div>
  </div>
  `;
  // DOM Insertion & BG Color + Transparency
  document.querySelector('#playing_container').innerHTML = playing_card;
  document.querySelector('aside').style.backgroundColor = `${bg_color}89`;
  // Handlers
  playingCardHandlers();
};

// > Handler

const playingCardHandlers = () => {
  // Ctrls
  let playing_card_ctrls$$ = document.querySelectorAll('#playing_card_ctrls img');
  let hide_playing_card_toggle$$ = document.querySelector('.hide-playing-card-toggle');
  // Handlers
  playing_card_ctrls$$.forEach((ctrl) => {
    ctrl.addEventListener('click', (e) => {
      let att = ctrl.getAttribute('alt').replace(/_[a-z]+/g, '');
      let keys = Object.keys(clickFunctions);
      // Assignation
      keys.includes(att) ? clickFunctions[att](e) : null;
    });
  });
  // Playing Card Hiding toggle
  hide_playing_card_toggle$$.addEventListener('click', () => {
    responsivePlayingDistance();
    visualShrinkArticle();
  });
};

// > Buttons Functions

const clickFunctions = {
  lyrics: () => {
    let lyrics_btn$$ = document.querySelectorAll('#playing_card_ctrls img');
    let lyrics_container$$ = document.querySelector('.lyrics-container');
    lyrics_container$$.classList.toggle('lyrics-on');
    // Btn Switch
    lyrics_container$$.classList.contains('lyrics-on')
      ? (lyrics_btn$$[0].src = active_general.lyrics)
      : (lyrics_btn$$[0].src = cards_icons.lyrics);
  },
  like: (e) => {
    let song = e.target.parentElement.parentElement.id;
    likeUnlikeSong(e, song);
  },
  spotify: (e) => {
    let url = e.target.getAttribute('href');
    window.open(url, '_blank', '');
  },
};

// > Like Check & Btn Functionality

export function checkIfLiked() {
  // Elements
  let track = document.querySelector('audio').getAttribute('playing_track_id');
  let userLikes = getActiveUserData().likes;
  let playing_card_like$$ = document.querySelector('#playing_card_ctrls [alt*="like"]');
  // From Playing Card
  if (userLikes && userLikes.includes(track)) {
    playing_card_like$$.classList.add('like_active');
  }
}

function likeUnlikeSong(e, track) {
  let audio$$ = document.querySelector('audio');
  // Like/Unlike
  if (e.target.className.includes('like_active')) {
    deleteLikeTrack(track);
    e.target.classList.remove('like_active');
    audio$$.removeAttribute('queue');
  } else {
    addLikeTrack(track);
    e.target.classList.add('like_active');
  }
  // Visual Update Home on VP
  pushStateHomeRefresh();
}

// > Visual Toggle Classes & First Pop

const visualShrinkArticle = () => {
  document.querySelector('#playing_container').classList.toggle('show-playing-card');
  document.querySelector('article').classList.toggle('shrink_result');
};

export const popPlayingCard = (card) => {
  card.style.display = 'block';
  if (!card.className.includes('show-playing-card')) {
    setTimeout(() => {
      const hiding_playing$$ = document.querySelector('.hide-playing-card-toggle');
      hiding_playing$$.click();
    }, 300);
  }
};

export const pushStateHomeRefresh = () => {
  if (window.location.pathname === '/home') {
    history.pushState(null, null, '/home');
    router();
  }
};

// > Update Variable Position VP

window.addEventListener('resize', responsivePlayingDistance);

export function responsivePlayingDistance() {
  const playing_container$$ = document.querySelector('#playing_container');
  const article$$ = document.querySelector('article');
  let dist = article$$.getBoundingClientRect().left;
  let size = playing_container$$.getBoundingClientRect().width;
  // VP Size
  window.innerWidth < 880
    ? playing_container$$.style.setProperty('--offset-main', `-${Math.floor(dist + size - 50)}px`)
    : playing_container$$.style.setProperty('--offset-main', `-${Math.floor(dist + size - 90)}px`);
}
