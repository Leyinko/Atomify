import { Login } from '../pages/login/sign-in/login';
import { Signup } from '../pages/login/sign-up/sign-up';
import { Home } from '../pages/nav/home/home';
import { Explore } from '../pages/nav/explore/explore';
import { Error404, errorBtnHandler } from '../pages/404/404';
import { config_panel_icons } from '../../public/assets_constants';

const routes = [
  {
    path: '/login',
    comp: Login,
  },
  {
    path: '/signup',
    comp: Signup,
  },
  {
    path: '/home',
    comp: Home,
  },
  {
    path: '/explore',
    comp: Explore,
  },
  {
    path: '*',
    comp: Error404,
  },
];

export const router = () => {
  let path = window.location.pathname;
  let path_article = document.querySelector('main article');
  path_article.id = path.slice(1);

  const { comp } = routes.find((route) => route.path === path) || {};

  if (comp) {
    comp();
  } else {
    path_article.id = 'error';
    path_article.innerHTML = Error404();
    errorBtnHandler();
  }
  // Help Button Active
  let help_btn$$ = document.querySelectorAll('#panel_config img')[1];
  help_btn$$ ? (help_btn$$.src = config_panel_icons.help) : null;
  // Active Anchor Navigation
  highlightActiveLinkNavigation();
};

window.addEventListener('popstate', router);
window.addEventListener('load', keepAppRouterActive);

// > Launch / Keep State

function keepAppRouterActive() {
  let getUsers = JSON.parse(localStorage.getItem('users'));
  let isOneUserActive = getUsers ? getUsers.some((user) => user.status === 'online') : null;
  //
  if (!isOneUserActive) {
    history.pushState(null, null, '/login');
    router();
  } else {
    document.querySelector('header').style.visibility = 'visible';
    setTimeout(() => {
      // Home
      history.pushState(null, null, '/home');
      router();
    }, 10);
  }
}

// > Visual Active Navigation Link

function highlightActiveLinkNavigation() {
  // Elements
  let navigation_anchors$$ = document.querySelectorAll('#navigation_links div');
  let path = location.pathname;
  navigation_anchors$$.forEach((anchor) => {
    let element = anchor.getAttribute('id').replace(/([a-z]+)_[a-z]+/, '/$1');
    let icon = anchor.querySelector('img');
    let text = anchor.querySelector('a');
    if (path === element) {
      icon.classList.add('navigation-icon-active');
      text.classList.add('navigation-text-active');
    } else {
      icon.classList.remove('navigation-icon-active');
      text.classList.remove('navigation-text-active');
    }
  });
}

// > Home Redirect

export const pushStateHomeRefresh = () => {
  if (window.location.pathname === '/home') {
    history.pushState(null, null, '/home');
    router();
  }
};
