import { MAIN_ELEMENT$$ } from '../../pages/main/main';
import { fetchTrackToPlay, maxLength } from '../../../public/api/fetch.js';
import { cover_sizes, player_icons, track_info_icon } from '../../../public/assets_constants.js';
import { countGenreSeconds, getActiveUserData, setUserData } from '../../data/local-storage-mock';
import { ascendingOrderLikeTracks, getIndexOfTrackInLikeQueue, playMusicQueue } from '../../pages/nav/home/home';
import './player.css';
import { highlightGlobalPlayingCard, playCard } from '../cards/global-card/global-card.js';

// > DOM Creation & Insertion

export const FOOTER_ELEMENT$$ = document.createElement('footer');
FOOTER_ELEMENT$$.setAttribute('role', 'region');
FOOTER_ELEMENT$$.setAttribute('arial-label', 'Music-Player');

const footer_template = `
<audio id="audio" src=""></audio>
 	<div class="track-info">
   	<img id="playing_cover" src="" alt="playing_track_cover">
   	<img role="button" id="develop-cover" src="${track_info_icon.cover_zoom_btn}" alt="develop-cover_icon">
     <div id="opening-cover-container">
   	  <img id="playing_cover_zoom" src="" alt="playing_track_cover_zoom">
     	<img role="button" id="develop-cover-close" src="${track_info_icon.cover_zoom_btn}" alt="develop-cover-close_icon">
     </div>
   	<div>
     	<h4></h4>
     	<span></span>
   	</div>
 	</div>
 	<div class="reproduction">
   	<img role="button" id="ctrl_shuffle" src="${player_icons.shuffle}" alt="shuffle_icon">
   	<img role="button" id="ctrl_previous" src="${player_icons.previous}" alt="previous_icon">
   	<div role="button" id="ctrl_play">
     	<img src="${player_icons.play}" alt="play_icon">
   	</div>
   	<img role="button" id="ctrl_next" src="${player_icons.next}" alt="next_icon">
   	<img role="button" id="ctrl_repeat" src="${player_icons.repeat}" alt="repeat_icon">
   	<div class="time-range-container">
     	<span>0:00</span>
     	<input id="range-track" type="range">
     	<span>0:00</span>
   	</div>
 	</div>
 	<div id="volume-info">
   	<img role="button" id="ctrl_volume" src="${player_icons.volume}" alt="volume_icon">
  	<input id="range-volume" step="0.01" type="range">
  </div>
`;

FOOTER_ELEMENT$$.innerHTML = footer_template;
document.querySelector('#app').appendChild(FOOTER_ELEMENT$$);

// > Global Elements & Data

const audio$$ = document.querySelector('#audio');
// Controls
export const controls = {};
const ctrls_IDs = ['ctrl_shuffle', 'ctrl_previous', 'ctrl_play', 'ctrl_next', 'ctrl_repeat', 'ctrl_volume'];
for (const ctrl_ID of ctrls_IDs) {
  controls[ctrl_ID + '$$'] = document.getElementById(ctrl_ID);
}
// Info DOM Manipulation
const playing_cover$$ = document.getElementById('playing_cover');
const range_track$$ = document.getElementById('range-track');
const range_volume$$ = document.getElementById('range-volume');
// Variables
let playerVolume = 0;
export let playing_now_ID;
export let likedQueueIDs = [];

// > Handlers

window.addEventListener('load', playerHandlers);
audio$$.addEventListener('timeupdate', playerTimeUpdate);

function playerHandlers() {
  rangesPlayer();
  rangesHandlers();
  handleCoverPlayer();
  atEndOfTrackHandler();
}

// > Playing Track Info

export const updatePlayerInfo = (playing) => {
  const body$$ = document.querySelector('body');
  const title$$ = document.querySelector('.track-info h4');
  const artist$$ = document.querySelector('.track-info span');
  const playing_cover_zoom$$ = document.getElementById('playing_cover_zoom');
  // Information
  title$$.textContent = playing.track.title;
  artist$$.textContent = playing.track.artist;
  playing_cover$$.src = playing.track.images[cover_sizes.small].url;
  playing_cover_zoom$$.src = playing.track.images[cover_sizes.big].url;
  audio$$.setAttribute('genre', playing.track.class);
  // Playing Color
  body$$.style.background = `linear-gradient(to right, ${playing.track.background_color_card}, #000000)`;
  setUserData(getActiveUserData().id, 'background', playing.track.background_color_card);
};

// > Player Handlers

Object.values(controls).forEach((ctrl) => {
  ctrl.addEventListener('click', (e) => {
    if (e.target.id !== 'ctrl_previous' && e.target.id !== 'ctrl_next' && e.target.id !== 'ctrl_play') {
      e.target.classList.toggle('player_active');
    }
    switch (e.target.id) {
      case 'ctrl_shuffle':
        break;
      case 'ctrl_previous':
        playPrevious();
        break;
      case 'ctrl_play':
        audio$$.paused ? playTrack() : pauseTrack();
        break;
      case 'ctrl_next':
        playNext();
        break;
      case 'ctrl_repeat':
        repeatTrack();
        break;
      case 'ctrl_volume':
        muteVolume();
        break;
      default:
        console.error('Control not found');
    }
  });
});

// > Functions

const playRandomTrack = async () => {
  // Queue
  if (audio$$.getAttribute('queue')) {
    let randomTrackFromLiked = getRandomTrackID(likedQueueIDs.length - 1);
    await playMusicQueue(randomTrackFromLiked);
    return;
  }
  // Explore
  let randomTrack = getRandomTrackID(maxLength);
  await fetchTrackToPlay(randomTrack);
  audio$$.play();
  audio$$.removeAttribute('queue');
};

const playPrevious = async () => {
  // Queue
  if (audio$$.getAttribute('queue')) {
    let current = audio$$.getAttribute('playing_track_id');
    let indexFromQueue = getIndexOfTrackInLikeQueue(current);
    if (audio$$.currentTime <= 2 && indexFromQueue === 0) {
      audio$$.currentTime = 0;
      return;
    } else if (audio$$.currentTime <= 2) {
      await playMusicQueue(indexFromQueue - 1);
      return;
    }
  }
  // [0]
  if (audio$$.getAttribute('playing_track_id') == '1' && audio$$.currentTime <= 2) {
    await fetchTrackToPlay(String(getRandomTrackID(maxLength)));
    audio$$.play();
    return;
  } else if (audio$$.getAttribute('playing_track_id') == '1') {
    audio$$.currentTime = 0;
    audio$$.play();
    return;
  }
  // Previous
  if (audio$$.currentTime <= 2) {
    await fetchTrackToPlay(String(playing_now_ID - 1));
    audio$$.play();
    return;
  }
  // Restart
  audio$$.currentTime = 0;
  audio$$.play();
};

const playTrack = async () => {
  if (!audio$$.paused) {
    audio$$.pause();
  }
  await audio$$.play();
};

const pauseTrack = () => {
  audio$$.pause();
};

const playNext = async () => {
  // Queue
  if (audio$$.getAttribute('queue')) {
    let current = audio$$.getAttribute('playing_track_id');
    let indexFromQueue = getIndexOfTrackInLikeQueue(current);
    // Shuffle On
    if (controls.ctrl_shuffle$$.className.includes('player_active')) {
      playRandomTrack();
      return;
    }
    // [-1]
    if (indexFromQueue === likedQueueIDs.length - 1) {
      audio$$.removeAttribute('queue');
      // Play
      await fetchTrackToPlay(String(getRandomTrackID(maxLength)));
      audio$$.play();
      return;
    } else {
      await playMusicQueue(indexFromQueue + 1);
      return;
    }
  }
  // Explore
  if (controls.ctrl_shuffle$$.className.includes('player_active')) {
    playRandomTrack();
    return;
  }
  // Next Track
  if (audio$$.getAttribute('playing_track_id') == String(maxLength)) {
    let randomTrack = getRandomTrackID(maxLength);
    await fetchTrackToPlay(randomTrack);
    audio$$.play();
  } else {
    await fetchTrackToPlay(String(Number(playing_now_ID) + 1));
    audio$$.play();
  }
};

const repeatTrack = () => {
  audio$$.loop === false ? (audio$$.loop = true) : (audio$$.loop = false);
};

const muteVolume = () => {
  !audio$$.volume ? thumbUnmuteEvent() : thumbMuteEvent();
};

const thumbMuteEvent = () => {
  playerVolume = range_volume$$.value;
  range_volume$$.value = 0;
  let muteEvent = new Event('input', { bubbles: true });
  range_volume$$.dispatchEvent(muteEvent);
  muteEvent.stopPropagation();
};

const thumbUnmuteEvent = () => {
  range_volume$$.value = playerVolume;
  let unmuteEvent = new Event('input', { bubbles: true });
  range_volume$$.dispatchEvent(unmuteEvent);
  unmuteEvent.stopPropagation();
};

// > Timestamps Listener ⭐

function playerTimeUpdate() {
  const current_time$$ = document.querySelector('.time-range-container span:first-of-type');
  const remaining_time$$ = document.querySelector('.time-range-container span:last-of-type');
  // Current
  let current = audio$$.currentTime;
  const currentMinutes = Math.floor(current / 60);
  const currentSeconds = Math.floor(current % 60);
  current_time$$.textContent = `${currentMinutes}:${String(currentSeconds).padStart(2, '0')}`;
  // Remaining
  let remaining = audio$$.duration - audio$$.currentTime;
  if (!isNaN(remaining)) {
    const remainingMinutes = Math.floor(remaining / 60);
    const remainingSeconds = Math.floor(remaining % 60);
    remaining_time$$.textContent = `${remainingMinutes}:${String(remainingSeconds).padStart(2, '0')}`;
  }
  // Play/Pause
  playPauseIconUpdate();
  // Current ID
  playing_now_ID = audio$$.getAttribute('playing_track_id');
  // USER Predominant Category (PC)
  countGenreSeconds(audio$$.getAttribute('genre'));
  // Global Likes ID
  getLikedQueueSongs();
}

// > Track "ended" Handlers

function atEndOfTrackHandler() {
  audio$$.addEventListener('ended', () => {
    let isShuffle = controls.ctrl_shuffle$$.className.includes('player_active');
    let isOnRepeat = controls.ctrl_repeat$$.className.includes('player_active');
    let isFromQueue = audio$$.getAttribute('queue');
    //
    if (!isShuffle && !isOnRepeat) {
      playNext();
      audio$$.removeAttribute('queue');
    }
    if (isShuffle) {
      playRandomTrack();
    }
    if (isFromQueue) {
      let id = audio$$.getAttribute('playing_track_id');
      let targetIndex = getIndexOfTrackInLikeQueue(id + 1);
      if (id === likedQueueIDs[likedQueueIDs.length - 1]) {
        audio$$.removeAttribute('queue');
      } else {
        playMusicQueue(targetIndex);
        audio$$.setAttribute('queue', true);
      }
    }
  });
}

// > Range Track & Volume

const rangesHandlers = () => {
  range_track$$.addEventListener('input', () => {
    audio$$.currentTime = parseFloat(range_track$$.value);
  });
  range_volume$$.addEventListener('input', () => {
    audio$$.volume = parseFloat(range_volume$$.value);
    !audio$$.volume
      ? (controls.ctrl_volume$$.src = player_icons.volume_mute)
      : (controls.ctrl_volume$$.src = player_icons.volume);
  });
};

function rangesPlayer() {
  // Track
  range_track$$.value = 0;
  range_track$$.style.background = '#646566';
  //
  range_track$$.value = audio$$.currentTime;
  range_track$$.max = audio$$.duration;
  // Visual
  const songProgressPercent = (audio$$.currentTime / audio$$.duration) * 100;
  range_track$$.style.background = `linear-gradient(to right, #1db954 0%, #1db954 ${songProgressPercent}%, #646566 ${songProgressPercent}%, #646566 100%)`;
  // Volume
  range_volume$$.value = 0;
  range_volume$$.style.background = '#646566';
  //
  range_volume$$.value = audio$$.volume;
  range_volume$$.max = 1;
  range_volume$$.min = 0;
  // Visual
  const volumePercent = (range_volume$$.value / range_volume$$.max) * 100;
  range_volume$$.style.background = `linear-gradient(to right, #1db954 0%, #1db954 ${volumePercent}%, #646566 ${volumePercent}%, #646566 100%)`;
  // Animation
  requestAnimationFrame(rangesPlayer);
}

// > Zoom Cover Playing Track

function handleCoverPlayer() {
  const opening_cover_container$$ = document.getElementById('opening-cover-container');
  const open_playing_cover$$ = document.getElementById('develop-cover');
  const close_playing_cover$$ = document.getElementById('develop-cover-close');
  const track_container$$ = document.querySelector('.track-info');
  // Open
  open_playing_cover$$.addEventListener('click', () => {
    opening_cover_container$$.style.display = 'fixed';
    opening_cover_container$$.style.left = '80px';
    track_container$$.style.transform = 'translateX(-85px)';
  });
  // Close
  close_playing_cover$$.addEventListener('click', () => {
    opening_cover_container$$.style.left = '-1000px';
    track_container$$.style.transform = '';
  });
}

// > Player Pop & Pause/Play

export const popPlayer = () => {
  // FOOTER_ELEMENT$$.style.display = 'flex';
  // FOOTER_ELEMENT$$.style.transform = 'none';
  // MAIN_ELEMENT$$.style.height = 'calc(100svh - 200px)';
  let track_info$$ = document.querySelector('.track-info');
  let reproduction_box$$ = document.querySelector('.reproduction');
  track_info$$.style.visibility = 'visible';
  track_info$$.style.opacity = '1';
  reproduction_box$$.style.pointerEvents = 'all';
};

const playPauseIconUpdate = () => {
  let play_icon$$ = document.querySelector('#ctrl_play img');
  !audio$$.paused ? (play_icon$$.src = player_icons.pause) : (play_icon$$.src = player_icons.play);
  let home_play_icon$$ = document.querySelector('#play_liked_playlist');
  if (home_play_icon$$) {
    if (audio$$.getAttribute('queue') && !audio$$.paused) {
      home_play_icon$$.src = player_icons.pause;
    } else if (audio$$.getAttribute('queue') && audio$$.paused) {
      home_play_icon$$.src = player_icons.play;
    } else if (!audio$$.getAttribute('queue')) {
      home_play_icon$$.src = player_icons.play;
    }
  }
};

// > General Random Function for MAX

export const getRandomTrackID = (max) => String(Math.floor(Math.random() * `${max}`) + 1);

// > Global Queue IDs Function

export function getLikedQueueSongs() {
  likedQueueIDs = [];
  let user = getActiveUserData();
  user.likes ? user.likes.forEach((song) => likedQueueIDs.push(song)) : null;
  likedQueueIDs = ascendingOrderLikeTracks(likedQueueIDs);
}

// > Responsive Play Handler

export const clickOnTouch = async (e, play = e.target) => {
  if (window.innerWidth < 1280 && play) {
    await playCard(e);
    highlightGlobalPlayingCard();
  }
};
