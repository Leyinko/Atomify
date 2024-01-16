import { fetchTrackToPlay } from '../../../../public/api/fetch';
import { checkIfLiked, popPlayingCard, responsivePlayingDistance } from '../playing-card/playing-card';
import { cards_icons } from '../../../../public/assets_constants';
import { popPlayer } from '../../player/player';
import './global-card.css';

// > Global Explore Card

export const global_search_card$$ = (id, img, alt) => {
  let global_card = `
  <div id="${id}" class="global_card">
    <img id="card_cover" src="${img}" alt="${alt + '_cover_error'}">
    <div role="button" id="ctrl_play_card_${id}">
     	<img src="${cards_icons.play}" alt="play_icon">
    </div>
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
      let play = e.target.children[1];
      if (play) {
        play.classList.toggle('show-play');
        // Handle Play
        handlePlayCard(play);
      }
    })
  );
};

// > Handler

const handlePlayCard = (play) => {
  play.removeEventListener('click', playCard);
  play.addEventListener('click', playCard);
};

// > Play

const playCard = async (e) => {
  // Elements
  const audio$$ = document.querySelector('audio');
  const playing_container$$ = document.querySelector('#playing_container');
  // Select Parent Card Element
  let currentCard = await e.target.parentElement.parentElement;
  // Play when click on Card ctrl Play
  await fetchTrackToPlay(currentCard.id);
  audio$$.play();
  // Tag as NOT from queue
  audio$$.removeAttribute('queue');
  // Visuals
  await currentCard.click();
  // Player (One time)
  playing_container$$.style.display !== 'block' ? popPlayer() : null;
  // Playing Card
  checkIfLiked();
  popPlayingCard(playing_container$$);
  responsivePlayingDistance();
};
