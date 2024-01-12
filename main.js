// NB : ✔ HEADER - MAIN - FOOTER
import './src/pages/header/header';
// NB : ✔ PAGES
// NB : ✔ CARDS
// NB : ✔ ROUTER
import './src/router/router';
import { router } from './src/router/router';

history.pushState(null, null, '/login');
router();
