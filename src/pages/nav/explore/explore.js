import { fetchSongsBySearch } from '../../../api/fetch';
import { getActiveUserData } from '../../../data/local-storage-mock';

export const Explore = () => {
  // Reset Current Article
  document.querySelector('main article').innerHTML = null;
  document.querySelector('body').style.background = `linear-gradient(to right, ${
    getActiveUserData().background
  }, #000000)`;
  // Explore content
  fetchSongsBySearch('');
};
