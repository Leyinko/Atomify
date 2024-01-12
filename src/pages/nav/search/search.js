import { cover_sizes } from '../../../../public/assets_constants';
import { globalCardHandlers, global_search_card$$ } from '../../../components/cards/global-card/global-card';

// > Cards Creation on Search

export const createCardOnSearch = async (songs) => {
  // Article Search Container
  let search_input$$ = document.querySelector('header input[type="text"]');
  const search_article$$ = document.querySelector('main article');
  search_article$$.id = 'search_result';
  // Reset
  search_article$$.innerHTML = '';
  search_article$$.style.display = '';
  // No Match Message
  if (songs.length === 0) {
    search_article$$.style.display = 'flex';
    search_article$$.innerHTML = noMatchBox$$(search_input$$.value);
  }
  // Display for less than 15 songs
  if (songs.length <= 15) {
    search_article$$.style.height = 'fit-content';
  } else {
    search_article$$.style.height = '';
  }
  // Search results
  songs.forEach((song) => {
    // DOM Insertion
    search_article$$.innerHTML += global_search_card$$(
      song.track.id,
      song.track.images[cover_sizes.medium].url,
      song.track.title
    );
  });
  // NB --------------> Global Cards Event Listeners <---------------- BN //
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
