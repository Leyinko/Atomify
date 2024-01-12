import { FOOTER_ELEMENT$$ } from '../../components/player/player';
import { general_icons } from '../../../public/assets_constants';
import './main.css';

// > Main insertion (HTML)

export const MAIN_ELEMENT$$ = document.createElement('main');
MAIN_ELEMENT$$.setAttribute('role', 'region');
MAIN_ELEMENT$$.setAttribute('arial-label', 'Main-Content');

const main_template = `
  <img class="loading_logo" src="${general_icons.fetch_loading}">
  <article id=""></article>
  <aside id="playing_container"></aside>
`;

MAIN_ELEMENT$$.innerHTML = main_template;
document.querySelector('#app').insertBefore(MAIN_ELEMENT$$, FOOTER_ELEMENT$$);
