import { updatePlayerInfo } from '../../src/components/player/player';
import { playing_card$$ } from '../../src/components/cards/playing-card/playing-card';
import { cover_sizes } from '../assets_constants';
import { getActiveUserData, setRecommendations } from '../../src/data/local-storage-mock';
import {
  generateDailyTrack,
  generateRecommendationsSongs$$,
  highlightPlayingSongFromLikeList,
  likedSongList,
  noLikedSongsMessage$$,
} from '../../src/pages/nav/home/home';
import { highlightGlobalPlayingCard } from '../../src/components/cards/global-card/global-card';
import { createCardOnSearch } from '../../src/pages/nav/explore/explore';

// DDBB
export const DDBB = 'https://spoti-lucafy.vercel.app/api/v1/songs';

// > Play Song

export let maxLength = 0;

export const fetchTrackToPlay = async (num) => {
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
    if (num > maxLength) {
      song = data[0];
    }

    // Pause
    if (!audio$$.paused) {
      audio$$.pause();
    }
    // Set SRC
    audio$$.src !== audio ? (audio$$.src = audio) : null;
    audio$$.setAttribute('playing_track_id', song.track.id);
    // Playing Info
    updatePlayerInfo(song);
    // Card
    playing_card$$(
      song.track.id,
      song.track.images[cover_sizes.medium].url,
      song.track.title,
      song.track.title,
      song.track.artist,
      song.track.spotify_url,
      song.track.background_color_card
    );
    // Lyrics
    fetchLyricsPlayingSong(song.track.id);
    // Highlight
    highlightPlayingSongFromLikeList();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// > Search Input

export const fetchSongsBySearch = async (search) => {
  const loading_logo$$ = document.querySelector('.loading_logo');
  try {
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
    // Cards
    await createCardOnSearch(songs);
    // Highlight
    highlightGlobalPlayingCard();
    //
    loading_logo$$.style.display = 'none';
  } catch (error) {
    console.error('Error fetching songs through the search input:', error);
  }
};

// > Initial PC

export const fetchSingularCategoryPreview = async () => {
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
      let random = Math.floor(Math.random() * `${preview.length - 1}`) + 1;
      if (!sort.includes(preview[random].track.class)) {
        // Singularity conditional
        sort.push(preview[random].track.class);
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

// > Lyrics

export const fetchLyricsPlayingSong = async (id) => {
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
  let span = document.createElement('span');
  let lyrics = text.replace(/empty/g, '\n').replace(/break/g, '<br>');
  span.innerHTML = lyrics;
  return span.outerHTML;
};

// > User Data

// Likes

export const fetchLikedSongsList = async () => {
  const user = getActiveUserData();
  try {
    let response = await fetch(DDBB);
    if (!response.ok) {
      throw new Error('Error accessing DDBB');
    }
    let data = await response.json();
    // Fetched Data
    if (user?.likes) {
      let songs = await data.filter((song) => user.likes.includes(song.track.id));
      songs.sort((a, b) => a.track.id - b.track.id);
      likedSongList(songs);
    } else {
      noLikedSongsMessage$$();
    }
  } catch (error) {
    console.error('Error fetching user liked song list:', error);
  }
};

// Daily

export const fetchDailySong = async () => {
  const user = getActiveUserData();
  try {
    let response = await fetch(DDBB);
    if (!response.ok) {
      throw new Error('Error accessing DDBB');
    }
    let data = await response.json();
    // Fetched Data
    let daily = data.find((song) => user.daily === song.track.id);
    generateDailyTrack(daily);
  } catch (error) {
    console.error('Error fetching user liked song list:', error);
  }
};

// Recommendations

export const fetchRecommendationsIDS = async () => {
  const user = getActiveUserData();
  try {
    let response = await fetch(DDBB);
    if (!response.ok) {
      throw new Error('Error accessing DDBB');
    }
    let data = await response.json();
    // Fetched Data
    let recommendations = data.filter((song) => user.category === song.track.class);
    let ids = await recommendations.map((song) => song.track.id);
    let array = await getFiveRecommendationsPerDay(ids);
    // Set
    setRecommendations(array);
  } catch (error) {
    console.error('Error fetching user liked song list:', error);
  }
};

export const fetchRecommendationsSongs = async () => {
  const user_recommendationsLS = getActiveUserData().recommendations || [];
  try {
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
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, 4);
};
