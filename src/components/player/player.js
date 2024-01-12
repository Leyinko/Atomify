import { MAIN_ELEMENT$$ } from '../../pages/main/main';
import { fetchTrackToPlay, maxLength } from '../../api/fetch';
import { cover_sizes, player_icons, track_info_icon } from '../../../public/assets_constants';
import { countGenreSeconds, getActiveUserData, setUserData } from '../../data/local-storage-mock';
import './player.css';
import { getIndexOfTrackInLikeQueue, playMusicQueue } from '../../pages/nav/home/home';

// > Footer insertion (HTML)

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

// > DOM Elements & Functional Data
// Audio Element
const audio$$ = document.querySelector('#audio');
// Controls
export const controls = {};
const ctrls_IDs = ['ctrl_shuffle', 'ctrl_previous', 'ctrl_play', 'ctrl_next', 'ctrl_repeat', 'ctrl_volume'];
for (const ctrl_ID of ctrls_IDs) {
  controls[ctrl_ID + '$$'] = document.getElementById(ctrl_ID);
}
// Info DOM Manipulation
const playing_cover$$ = document.getElementById('playing_cover');
// DOM Ranges Controls
const range_track$$ = document.getElementById('range-track');
const range_volume$$ = document.getElementById('range-volume');
// Variables
let playerVolume = 0;
export let playing_now_ID;
// Likes Playlist ID
export let likedQueueIDs = [];

// NB : On-Load Essential Handlers : BN //

window.addEventListener('load', playerHandlers);
audio$$.addEventListener('timeupdate', playerTimeUpdate);

function playerHandlers() {
  rangesPlayer();
  rangesHandlers();
  handleCoverPlayer();
  atEndOfTrackHandler();
}

// > Update DOM Playing Track Info

export const updatePlayerInfo = (playing) => {
  const body$$ = document.querySelector('body');
  const title$$ = document.querySelector('.track-info h4');
  const artist$$ = document.querySelector('.track-info span');
  const playing_cover_zoom$$ = document.getElementById('playing_cover_zoom');
  // Track Info Container
  title$$.textContent = playing.track.title;
  artist$$.textContent = playing.track.artist;
  playing_cover$$.src = playing.track.images[cover_sizes.small].url;
  playing_cover_zoom$$.src = playing.track.images[cover_sizes.big].url;
  audio$$.setAttribute('genre', playing.track.class);
  // General Background Color /track
  body$$.style.background = `linear-gradient(to right, ${playing.track.background_color_card}, #000000)`;
  // User Background from Last Song
  setUserData(getActiveUserData().id, 'background', playing.track.background_color_card);
};

// > Controls Handlers & Functions

Object.values(controls).forEach((ctrl) => {
  ctrl.addEventListener('click', (e) => {
    // .active on click
    if (e.target.id !== 'ctrl_previous' && e.target.id !== 'ctrl_next' && e.target.id !== 'ctrl_play') {
      e.target.classList.toggle('player_active');
    }
    // Controls
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

// > Controls Functions

const playRandomTrack = async () => {
  // From Liked List
  if (audio$$.getAttribute('queue')) {
    let randomTrackFromLiked = getRandomTrackID(likedQueueIDs.length - 1);
    await playMusicQueue(randomTrackFromLiked);
    return;
  }
  // From General Playlist [100]
  let randomTrack = getRandomTrackID(maxLength);
  await fetchTrackToPlay(randomTrack);
  audio$$.play();
  // Tag as NOT from queue
  audio$$.removeAttribute('queue');
};

const playPrevious = async () => {
  // Liked Queue
  if (audio$$.getAttribute('queue')) {
    // Current
    let current = audio$$.getAttribute('playing_track_id');
    let indexFromQueue = getIndexOfTrackInLikeQueue(current);
    // Conditions
    if (audio$$.currentTime <= 2 && indexFromQueue === 0) {
      audio$$.currentTime = 0;
      return;
    } else if (audio$$.currentTime <= 2) {
      await playMusicQueue(indexFromQueue - 1);
      return;
    }
  }
  // If First of IDS
  if (audio$$.getAttribute('playing_track_id') == '1' && audio$$.currentTime <= 2) {
    // Play
    await fetchTrackToPlay(String(getRandomTrackID(100)));
    audio$$.play();
    return;
  } else if (audio$$.getAttribute('playing_track_id') == '1') {
    // Restart current song
    audio$$.currentTime = 0;
    audio$$.play();
    return;
  }
  // Previous song
  if (audio$$.currentTime <= 2) {
    await fetchTrackToPlay(String(playing_now_ID - 1));
    audio$$.play();
    return;
  }
  // Restart current song
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
  // Liked Queue
  if (audio$$.getAttribute('queue')) {
    // Current
    let current = audio$$.getAttribute('playing_track_id');
    let indexFromQueue = getIndexOfTrackInLikeQueue(current);
    // Shuffle On
    if (controls.ctrl_shuffle$$.className.includes('player_active')) {
      playRandomTrack();
      return;
    }
    // Conditions of last of list
    if (indexFromQueue === likedQueueIDs.length - 1) {
      // Tag as NOT from queue
      audio$$.removeAttribute('queue');
      // Play
      await fetchTrackToPlay(String(getRandomTrackID(100)));
      audio$$.play();
      return;
    } else {
      await playMusicQueue(indexFromQueue + 1);
      return;
    }
  }
  // General
  // Next Shuffle if activated
  if (controls.ctrl_shuffle$$.className.includes('player_active')) {
    playRandomTrack();
    return;
  }
  // Next Track
  if (audio$$.getAttribute('playing_track_id') == '100') {
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

// > Timestamps & End Of Track

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
  // Visual Play/Pause
  playPauseIconUpdate();
  // ID Playing
  playing_now_ID = audio$$.getAttribute('playing_track_id');
  // Category Timestamps Update
  countGenreSeconds(audio$$.getAttribute('genre'));
  // Update Global Like Queue IDS
  getLikedQueueSongs();
}

function atEndOfTrackHandler() {
  // Handler
  audio$$.addEventListener('ended', () => {
    // Checks
    let isShuffle = controls.ctrl_shuffle$$.className.includes('player_active');
    let isOnRepeat = controls.ctrl_repeat$$.className.includes('player_active');
    let isFromQueue = audio$$.getAttribute('queue');
    // Conditions
    if (!isShuffle && !isOnRepeat) {
      playNext();
      // Tag as NOT from queue
      audio$$.removeAttribute('queue');
    }
    if (isShuffle) {
      playRandomTrack();
    }
    if (isFromQueue) {
      // Get audio ID
      let id = audio$$.getAttribute('playing_track_id');
      let targetIndex = getIndexOfTrackInLikeQueue(id + 1);
      // Play Track
      playMusicQueue(targetIndex);
      // Tag as Queue
      audio$$.setAttribute('queue', true);
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
  // Track % Color
  const songProgressPercent = (audio$$.currentTime / audio$$.duration) * 100;
  range_track$$.style.background = `linear-gradient(to right, #1db954 0%, #1db954 ${songProgressPercent}%, #646566 ${songProgressPercent}%, #646566 100%)`;
  // Volume
  range_volume$$.value = 0;
  range_volume$$.style.background = '#646566';
  //
  range_volume$$.value = audio$$.volume;
  range_volume$$.max = 1;
  range_volume$$.min = 0;
  // Volume % Color
  const volumePercent = (range_volume$$.value / range_volume$$.max) * 100;
  range_volume$$.style.background = `linear-gradient(to right, #1db954 0%, #1db954 ${volumePercent}%, #646566 ${volumePercent}%, #646566 100%)`;
  // Animation smoothness
  requestAnimationFrame(rangesPlayer);
}

// > Handle Covers

function handleCoverPlayer() {
  const opening_cover_container$$ = document.getElementById('opening-cover-container');
  const open_playing_cover$$ = document.getElementById('develop-cover');
  const close_playing_cover$$ = document.getElementById('develop-cover-close');
  const track_container$$ = document.querySelector('.track-info');
  //
  open_playing_cover$$.addEventListener('click', () => {
    // Open Cover Zoom
    opening_cover_container$$.style.display = 'fixed';
    opening_cover_container$$.style.left = '80px';
    // Track Slide
    track_container$$.style.transform = 'translateX(-85px)';
  });
  close_playing_cover$$.addEventListener('click', () => {
    // Close Cover Zoom
    opening_cover_container$$.style.left = '-1000px';
    // Track Slide
    track_container$$.style.transform = '';
  });
}

// > Visibility Player

export const popPlayer = () => {
  FOOTER_ELEMENT$$.style.transform = 'none';
  MAIN_ELEMENT$$.style.height = 'calc(100vh - 200px)';
};

const playPauseIconUpdate = () => {
  // Player Play / Pause Btn
  let play_icon$$ = document.querySelector('#ctrl_play img');
  !audio$$.paused ? (play_icon$$.src = player_icons.pause) : (play_icon$$.src = player_icons.play);
  let home_play_icon$$ = document.querySelector('#play_liked_playlist');
  // Like Playlist Play / Pause Btn
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

// > Get Random Track

export const getRandomTrackID = (max) => String(Math.floor(Math.random() * `${max}`) + 1);

// > Check if Played from Like List / Keep track of Liked Queue Songs

export function getLikedQueueSongs() {
  likedQueueIDs = [];
  document.querySelectorAll('.liked_song_li').forEach((song) => likedQueueIDs.push(song.getAttribute('id')));
}
