import { fetchTrackToPlay } from '../../../../public/api/fetch';
import { checkIfLiked, popPlayingCard, responsivePlayingDistance } from '../playing-card/playing-card';
import { clickOnTouch, likedQueueIDs, popPlayer } from '../../player/player';
import './global-card.css';

// > Global Cards

export const global_search_card$$ = (id, img, alt) => {
  let global_card$$ = `
  <div id="${id}" class="global_card">
    <img id="card_cover" src="${img}" alt="${alt + '_cover_error'}">
  </div>
  `;
  return global_card$$;
};

// > Handlers

export const globalCardHandlers = () => {
  let filtered_cards$$ = document.querySelectorAll('.global_card');
  filtered_cards$$.forEach((card) =>
    card.addEventListener('click', async (e) => {
      let play = e.target;
      // Phone & Tablets
      clickOnTouch(e, play);
      // Desktop
      if (play && e.detail === 2) {
        await playCard(e);
        highlightGlobalPlayingCard();
      }
    })
  );
};

// > Highlight Playing Global Card

export const highlightGlobalPlayingCard = () => {
  let filtered_cards$$ = document.querySelectorAll('.global_card');
  const audio$$ = document.querySelector('audio');
  filtered_cards$$.forEach((card) => {
    if (card.id === audio$$.getAttribute('playing_track_id')) {
      card.classList.add('global-card-active');
    } else {
      card.classList.remove('global-card-active');
    }
  });
};

// > Play from Global Card

export const playCard = async (e) => {
  const audio$$ = document.querySelector('audio');
  const playing_container$$ = document.querySelector('#playing_container');
  let currentCard = await e.target;
  // Play
  await fetchTrackToPlay(currentCard.id);
  audio$$.play();
  // Queue
  if (likedQueueIDs.includes(currentCard.id)) {
    audio$$.setAttribute('queue', true);
  } else {
    audio$$.removeAttribute('queue');
  }
  // Visuals
  playing_container$$.style.display !== 'block' ? popPlayer() : null;
  checkIfLiked();
  popPlayingCard(playing_container$$);
  responsivePlayingDistance();
};
