import { fetchSongsBySearch } from '../../../../public/api/fetch.js';
import { cover_sizes } from '../../../../public/assets_constants.js';
import { globalCardHandlers, global_search_card$$ } from '../../../components/cards/global-card/global-card.js';
import { getActiveUserData } from '../../../data/local-storage-mock';

export const Explore = async () => {
  // Reset Container
  document.querySelector('main article').innerHTML = null;
  document.querySelector('body').style.background = `linear-gradient(to right, ${
    getActiveUserData().background
  }, #000000)`;
  await fetchSongsBySearch('');
};

// > Explore Cards on Search

export const createCardOnSearch = async (songs) => {
  let search_input$$ = document.querySelector('header input[type="text"]');
  const search_article$$ = document.querySelector('main article');
  search_article$$.id = 'search_result';
  // Reset
  search_article$$.innerHTML = '';
  search_article$$.style.display = '';
  // Empty
  if (songs.length === 0) {
    search_article$$.style.display = 'flex';
    search_article$$.innerHTML = noMatchBox$$(search_input$$.value);
  }
  // Visual < 15 Tracks
  if (songs.length <= 15) {
    search_article$$.style.height = 'fit-content';
  } else {
    search_article$$.style.height = '';
  }
  // Result
  songs.forEach((song) => {
    search_article$$.innerHTML += global_search_card$$(
      song.track.id,
      song.track.images[cover_sizes.medium].url,
      song.track.title
    );
  });
  // Handlers
  globalCardHandlers();
};

const noMatchBox$$ = (input) => {
  return `
  <div class="error-box">
    <h1>No results found for "${input}"</h1>
    <span>Please make sure your words are spelled correctly or use less or different keywords.</span>
  </div>
  `;
};
