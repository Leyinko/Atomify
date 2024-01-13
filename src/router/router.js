import { Login } from '../pages/login/sign-in/login';
import { Signup } from '../pages/login/sign-up/sign-up';
import { Home } from '../pages/nav/home/home';
import { Explore } from '../pages/nav/explore/explore';
import { Error404, errorBtnHandler } from '../pages/404/404';

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
    history.pushState(null, null, '/home');
    router();
  }
}
