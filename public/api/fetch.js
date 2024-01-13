import { createCardOnSearch } from '../../src/pages/nav/search/search';
import { updatePlayerInfo } from '../../src/components/player/player';
import { playing_card$$ } from '../../src/components/cards/playing-card/playing-card';
import { cover_sizes } from '../assets_constants';
import { getActiveUserData, setRecommendations } from '../../src/data/local-storage-mock';
import {
  generateDailyTrack,
  generateRecommendationsSongs$$,
  likedSongList,
  noLikedSongsMessage$$,
} from '../../src/pages/nav/home/home';

// DDBB
export const DDBB = '/playlist_explorer.json';

// > Play Selected Song

export let maxLength = 0;

export const fetchTrackToPlay = async (num) => {
  // Element
  const audio$$ = document.querySelector('#audio');
  try {
    let response = await fetch(DDBB);
    if (!response.ok) {
      throw new Error(`Local fetching error: ${response.status}`);
    }
    let data = await response.json();
    // Fetched Data
    let song = await data.find((item) => item.track.id === num);
    let audio = await song.track.audio;
    maxLength = data.length;
    // Min/Max ID Length
    if (num > maxLength) {
      song = data[0];
    }
    // Pause Audio first
    if (!audio$$.paused) {
      audio$$.pause();
    }
    // Set SRC + PlayingID
    audio$$.src !== audio ? (audio$$.src = audio) : null;
    audio$$.setAttribute('playing_track_id', song.track.id);
    // DOM Player information
    updatePlayerInfo(song);
    // Playing Card DOM
    playing_card$$(
      song.track.id,
      song.track.images[cover_sizes.medium].url,
      song.track.title,
      song.track.title,
      song.track.artist,
      song.track.spotify_url,
      song.track.background_color_card
    );
    // Lyrics Box
    fetchLyricsPlayingSong(song.track.id);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// > Fetch Search Input

export const fetchSongsBySearch = async (search) => {
  // Element
  const loading_logo$$ = document.querySelector('.loading_logo');
  try {
    // Loading
    loading_logo$$.style.display = 'block';
    //
    let response = await fetch(DDBB);
    if (!response.ok) {
      throw new Error('Error accessing DDBB');
    }
    let data = await response.json();
    // Fetched Data
    let songs = data.filter(
      (song) =>
        song.track.title.toLowerCase().includes(search.toLowerCase()) ||
        song.track.artist.toLowerCase().includes(search.toLowerCase())
    );
    // DOM Cards
    createCardOnSearch(songs);
    // Loaded
    loading_logo$$.style.display = 'none';
  } catch (error) {
    console.error('Error fetching songs through the search input:', error);
  }
};

// > Fetch User Category (preview url)

export const fetchSingularCategoryPreview = async () => {
  // Variables
  let sort = [];
  let singularClass = [];
  let count = 0;
  try {
    let response = await fetch(DDBB);
    if (!response.ok) {
      throw new Error(`Error accessing DDBB, ${response.status}`);
    }
    let data = await response.json();
    let preview = await data.filter((item) => item.track?.preview_url);
    while (count !== 3) {
      let random = Math.floor(Math.random() * `${preview.length}`) + 1;
      if (!sort.includes(preview[random].track.class)) {
        // Singularity conditional
        sort.push(preview[random].track.class);
        // Track item
        let item = {
          class: preview[random].track.class,
          image: preview[random].track.images[1].url,
          url: preview[random].track.preview_url,
        };
        singularClass.push(item);
        count++;
      }
    }
    return singularClass;
  } catch (error) {
    console.error('Error fetching the track for user category selection', error);
  }
};

// > Fetch Lyrics

export const fetchLyricsPlayingSong = async (id) => {
  // Elements
  let lyrics_container$$ = document.querySelector('.lyrics-container');
  let lyrics_ctrl$$ = document.querySelector('#playing_card_ctrls [alt*="lyrics"]');
  try {
    let response = await fetch(DDBB);
    if (!response.ok) {
      throw new Error('Error accessing DDBB');
    }
    let data = await response.json();
    let song = data.find((item) => item.track.id === id);
    // Fetched Data
    let lyrics = song.track.lyrics;
    //
    !lyrics ? noLyricsAvailable(lyrics_ctrl$$) : lyricsAvailable(lyrics_container$$, lyrics, lyrics_ctrl$$);
  } catch (error) {
    console.error('Error fetching lyrics from current song:', error);
  }
};

const noLyricsAvailable = (ctrl) => {
  ctrl.style.pointerEvents = 'none';
  ctrl.style.opacity = '0.3';
};

const lyricsAvailable = (container, text, ctrl) => {
  container.innerHTML = showLyrics(text);
  ctrl.style.opacity = '0.8';
};

const showLyrics = (text) => {
  // Text to Lyrics
  let span = document.createElement('span');
  let lyrics = text.replace(/empty/g, '\n').replace(/break/g, '<br>');
  span.innerHTML = lyrics;
  return span.outerHTML;
};

// > Fetch User Section (like, daily & recommendations)

export const fetchLikedSongsList = async () => {
  // Element
  const user = getActiveUserData();
  try {
    //
    let response = await fetch(DDBB);
    if (!response.ok) {
      throw new Error('Error accessing DDBB');
    }
    let data = await response.json();
    // Fetched Data
    if (user?.likes) {
      let songs = await data.filter((song) => user.likes.includes(song.track.id));
      // List
      likedSongList(songs);
    } else {
      noLikedSongsMessage$$();
    }
  } catch (error) {
    console.error('Error fetching user liked song list:', error);
  }
};

export const fetchDailySong = async () => {
  // Element
  const user = getActiveUserData();
  try {
    //
    let response = await fetch(DDBB);
    if (!response.ok) {
      throw new Error('Error accessing DDBB');
    }
    let data = await response.json();
    // Fetched Data
    let daily = data.find((song) => user.daily === song.track.id);
    // DOM
    generateDailyTrack(daily);
  } catch (error) {
    console.error('Error fetching user liked song list:', error);
  }
};

export const fetchRecommendationsIDS = async () => {
  // Element
  const user = getActiveUserData();
  try {
    //
    let response = await fetch(DDBB);
    if (!response.ok) {
      throw new Error('Error accessing DDBB');
    }
    let data = await response.json();
    // Fetched Data
    let recommendations = data.filter((song) => user.category === song.track.class);
    let ids = await recommendations.map((song) => song.track.id);
    // 5 IDS
    let array = await getFiveRecommendationsPerDay(ids);
    // LocalStorage
    setRecommendations(array);
  } catch (error) {
    console.error('Error fetching user liked song list:', error);
  }
};

export const fetchRecommendationsSongs = async () => {
  // Element
  const user_recommendationsLS = getActiveUserData().recommendations || [];
  try {
    //
    let response = await fetch(DDBB);
    if (!response.ok) {
      throw new Error('Error accessing DDBB');
    }
    let data = await response.json();
    // Fetched Data
    let recommendations = data.filter((song) => user_recommendationsLS.includes(song.track.id));
    // DOM
    generateRecommendationsSongs$$(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations song list:', error);
  }
};

const getFiveRecommendationsPerDay = async (ids) => {
  // Shuffle the array (Fisher-Yates algorithm)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, 4);
};
