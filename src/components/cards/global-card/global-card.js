import { fetchTrackToPlay } from '../../../../public/api/fetch';
import { checkIfLiked, popPlayingCard, responsivePlayingDistance } from '../playing-card/playing-card';
import { clickOnTouch, likedQueueIDs, popPlayer } from '../../player/player';
import './global-card.css';

// > Global Explore Card

export const global_search_card$$ = (id, img, alt) => {
  let global_card = `
  <div id="${id}" class="global_card">
    <img id="card_cover" src="${img}" alt="${alt + '_cover_error'}">
  </div>
  `;
  // Return
  return global_card;
};

// > Global Card Handlers & Functions

export const globalCardHandlers = () => {
  // Cards
  let filtered_cards$$ = document.querySelectorAll('.global_card');
  // Card Handler
  filtered_cards$$.forEach((card) =>
    card.addEventListener('click', async (e) => {
      // Play btn
      let play = e.target;
      // Phone & Tablets
      clickOnTouch(e, play);
      // Desktop
      if (play && e.detail === 2) {
        // Handle Play
        await playCard(e);
        // Selected / Playing
        highlightGlobalPlayingCard();
      }
    })
  );
};

// > Playing Card Highlighted

export const highlightGlobalPlayingCard = () => {
  let filtered_cards$$ = document.querySelectorAll('.global_card');
  const audio$$ = document.querySelector('audio');
  //
  filtered_cards$$.forEach((card) => {
    if (card.id === audio$$.getAttribute('playing_track_id')) {
      card.classList.add('global-card-active');
    } else {
      card.classList.remove('global-card-active');
    }
  });
};

// > Play

export const playCard = async (e) => {
  // Elements
  const audio$$ = document.querySelector('audio');
  const playing_container$$ = document.querySelector('#playing_container');
  // Select Parent Card Element
  let currentCard = await e.target;
  // Play when click on Card ctrl Play
  await fetchTrackToPlay(currentCard.id);
  audio$$.play();
  // Check if on Like Playlist (queue)
  if (likedQueueIDs.includes(currentCard.id)) {
    audio$$.setAttribute('queue', true);
  } else {
    audio$$.removeAttribute('queue');
  }
  // Visuals
  // Player (One time)
  playing_container$$.style.display !== 'block' ? popPlayer() : null;
  // Playing Card
  checkIfLiked();
  popPlayingCard(playing_container$$);
  responsivePlayingDistance();
};
