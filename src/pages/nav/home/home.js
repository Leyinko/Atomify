import {
  fetchDailySong,
  fetchLikedSongsList,
  fetchRecommendationsIDS,
  fetchRecommendationsSongs,
  fetchTrackToPlay,
} from '../../../../public/api/fetch.js';
import { deleteLikeTrack, getActiveUserData, setUserData } from '../../../data/local-storage-mock';
import { getLikedQueueSongs, getRandomTrackID, likedQueueIDs, popPlayer } from '../../../components/player/player';
import {
  checkIfLiked,
  popPlayingCard,
  pushStateHomeRefresh,
  responsivePlayingDistance,
} from '../../../components/cards/playing-card/playing-card';
import {
  cards_icons,
  cover_sizes,
  player_icons,
  profile_pictures,
  recommendations_flags,
} from '../../../../public/assets_constants.js';
import './home.css';

export const Home = () => {
  // Reset Current Article
  document.querySelector('main article').innerHTML = null;
  // Date
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let currentDate = new Date().toLocaleDateString('en-US', options);
  // Get Active User Data
  let user = getActiveUserData();
  // User Data Fetching & Verification
  loadUserData();
  // Home content
  let home_template$$ = `
  <h3 class="current-date">${currentDate}</h3>
    <div class="user-information">
      <div id="picture-container">
        <img class="profile-picture" src="${user.profile_picture}" alt="profile_picture">
      </div>
      <div role="button" id="profile-pictures-selection"></div>
      <span>Profile</span>
      <h1>${user.username}
        <img id="play_liked_playlist" role="button" src="${player_icons.play}">
      </h1>
      <div class="playlist-info"></div>
    </div>
    <div id="user-songs-section">
      <ul id="liked-list"></ul>
      <div id="" class="daily-track"></div>
      <div id="recommendations-list">
        <img id="user-category" src="${recommendationsFlag$$(user.category)}" alt="category_flag">
      </div>
    </div>
  `;
  // DOM
  document.querySelector('main article#home').innerHTML = home_template$$;
  document.querySelector('body').style.background = `linear-gradient(to right, ${
    getActiveUserData().background
  }, #000000)`;
};

// > Load User Data

const loadUserData = async () => {
  // Date
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let currentDate = new Date().toLocaleDateString('en-US', options);
  // ! TEST ZONE FOR ONE MORE DAY
  // currentDate = currentDate.replace(/\d+/, '13');
  // ! TEST ZONE FOR ONE MORE DAY
  // Get Active User Data
  let user = getActiveUserData();
  // Reset/Change User Data (DAILY)
  if (user.date !== currentDate || !user.date) {
    setUserData(user.id, 'date', currentDate);
    setUserData(user.id, 'daily', getRandomTrackID(100));
    fetchRecommendationsIDS();
  }
  // Fetch Home Data
  await fetchLikedSongsList();
  await fetchDailySong();
  await fetchRecommendationsSongs();
  // Local User Home Data
  generatePopularityRate();
  generatePredominantCategory();
  profilePictureManager();
  // Like Playlist
  playLikePlaylistHandler();
  getLikedQueueSongs();
};

// > Profile Picture

const profilePictureManager = () => {
  // Element
  let profile_picture_container$$ = document.querySelector('#picture-container');
  let modal_selection$$ = document.querySelector('#profile-pictures-selection');
  // Modal Toggle Visibility
  profile_picture_container$$.addEventListener('click', () => {
    modal_selection$$.classList.toggle('selection-active');
    //
    let h1 = document.querySelector('.user-information h1');
    let spans = document.querySelectorAll('.user-information span');

    h1.classList.toggle('blurred');
    spans.forEach((span) => span.classList.toggle('blurred'));
  });
  // Pictures
  let pictures$$ = Object.values(profile_pictures);
  pictures$$.forEach((picture) => {
    // Element
    let image = document.createElement('img');
    image.className = 'profile-picture-miniature';
    image.src = picture;
    // DOM
    modal_selection$$.appendChild(image);
  });
  // Handlers
  let pictures_selection$$ = document.querySelectorAll('.profile-picture-miniature');
  pictures_selection$$.forEach((picture) => {
    picture.addEventListener('click', () => {
      // Reset Selections
      pictures_selection$$.forEach((picture) => picture.classList.remove('miniature-selected'));
      // Final Select
      picture.classList.toggle('miniature-selected');
    });
  });
  // Confirm Button
  let confirm_btn$$ = document.createElement('img');
  confirm_btn$$.setAttribute('role', 'button');
  confirm_btn$$.className = 'confirm-picture';
  confirm_btn$$.src = 'https://res.cloudinary.com/drft9abh4/image/upload/v1704823524/confirm_ygwux6.svg';

  modal_selection$$.appendChild(confirm_btn$$);
  // Handler
  confirm_btn$$.addEventListener('click', () => {
    // Selected Picture
    let newPicture = document.querySelector('.miniature-selected');
    // Set new Profile Picture
    let user = getActiveUserData();
    if (newPicture) {
      setUserData(user.id, 'profile_picture', newPicture.src);
      // Refresh
      pushStateHomeRefresh();
    }
  });
};

// > Likes Section

const generatePopularityRate = () => {
  // Elements
  let liked_songs$$ = document.querySelectorAll('.liked_song_li');
  let playlist_info$$ = document.querySelector('.playlist-info');
  const user = getActiveUserData();
  // Likes counter
  let counter_likes$$ = document.createElement('span');
  // Condition
  if (!user.likes) {
    counter_likes$$.textContent = `0 song liked - `;
  } else if (user.likes.length <= 1) {
    counter_likes$$.textContent = `${user.likes.length} song liked - `;
  } else {
    counter_likes$$.textContent = `${user.likes.length} songs liked - `;
  }

  playlist_info$$.appendChild(counter_likes$$);
  // Calculate Popularity
  let rates = [];
  liked_songs$$.forEach((song) => rates.push(Number(song.getAttribute('popularity'))));
  let sum = rates.reduce((acc, next) => acc + next, 0);
  let percentage = `${(sum / rates.length).toFixed(0)} % (PR) - `;
  // DOM
  let ratio$$ = document.createElement('span');
  playlist_info$$.appendChild(ratio$$);
  // Conditions
  percentage === 'NaN % (PR) - ' ? (percentage = 'Score not available yet.') : percentage;
  ratio$$.textContent = `${percentage}`;
};

const generatePredominantCategory = () => {
  // Elements
  let liked_songs$$ = document.querySelectorAll('.liked_song_li');
  let playlist_info$$ = document.querySelector('.playlist-info');
  // Likes counter
  let final_category$$ = document.createElement('span');
  if (liked_songs$$.length === 0) {
    return;
  }
  playlist_info$$.appendChild(final_category$$);
  // Calculate Predominant Genre
  let categories = {};
  liked_songs$$.forEach((track) => {
    let genre = track.getAttribute('genre');
    if (categories.hasOwnProperty(genre)) {
      categories[genre] += 1;
    } else {
      categories[genre] = 1;
    }
  });
  // Check highest genre
  let highest = Object.keys(categories).reduce((a, b) => (categories[a] > categories[b] ? a : b));
  // Conditions
  final_category$$.textContent = `${highest} (PC)`;
};

export const likedSongList = async (songs) => {
  //DOM
  const list = document.querySelector('#liked-list');
  songs.forEach((song) => {
    list.innerHTML += likedSongListElement$$(song);
  });
  // No Liked Songs Message
  if (list.children.length === 0) {
    noLikedSongsMessage$$();
  }
  // LI Handlers
  const list_elements$$ = document.querySelectorAll('.liked_song_li');
  list_elements$$.forEach((element) => {
    element.addEventListener('click', (e) => {
      // Get Index of Target in queue
      let targetIndex = getIndexOfTrackInLikeQueue(e.target.id);
      // Play Track
      if (e.detail === 2) {
        playMusicQueue(targetIndex);
        // Tag as Queue
        document.querySelector('audio').setAttribute('queue', true);
      }
    });
  });
  // Delete Like Btn Handlers
  const delete_like_buttons$$ = document.querySelectorAll('.liked_song_li img:last-of-type');
  delete_like_buttons$$.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      let target = e.target.parentElement.id;
      // Delete & Refresh/Update Playing card
      updateLikeIconFromPlayingCard(target);
    });
  });
};

export const noLikedSongsMessage$$ = () => {
  // Element
  const list = document.querySelector('#liked-list');
  // DOM
  let empty_likes$$ = document.createElement('span');
  empty_likes$$.className = 'empty-likes';
  empty_likes$$.textContent = 'No songs liked yet.';

  if (list.children.length === 0) {
    list.appendChild(empty_likes$$);
  } else {
    empty_likes$$.remove();
  }
};

const likedSongListElement$$ = (song) => {
  return `
    <li id="${song.track.id}" popularity="${song.track.popularity}" genre="${song.track.class}"  class="liked_song_li">
      <img src="${song.track.images[cover_sizes.small].url}">
      <h4>${song.track.title}</h4>
      <span>${song.track.artist}</span>
      <img src="${cards_icons.delete_like}">
    </li>
  `;
};

export const getIndexOfTrackInLikeQueue = (element) => likedQueueIDs.indexOf(element);

// > Play Like Playlist

const playLikePlaylistHandler = () => {
  // Elements
  let play_like_btn$$ = document.querySelector('#play_liked_playlist');
  const audio$$ = document.querySelector('audio');
  // Handler
  play_like_btn$$.addEventListener('click', () => {
    // Play/Pause if queue song
    if (audio$$.getAttribute('queue')) {
      !audio$$.paused ? audio$$.pause() : audio$$.play();
    } else {
      // Play from beginning
      playMusicQueue(0);
      // Tag as Queue
      audio$$.setAttribute('queue', true);
    }
  });
};

export const playMusicQueue = async (index) => {
  // Elements
  const audio$$ = document.querySelector('#audio');
  const playing_container$$ = document.querySelector('#playing_container');
  // Check Queue Liked
  let currentSong = likedQueueIDs[index];
  // Played From Like
  if (currentSong) {
    await fetchTrackToPlay(currentSong);
    audio$$.play();
    // Player (One time)
    playing_container$$.style.display !== 'block' ? popPlayer() : null;
    // Playing Card
    checkIfLiked();
    popPlayingCard(playing_container$$);
    // Playing Card Infos
    checkIfLiked();
  }
};

// > Play Track / Update Like Playing Card

export const playTrackFromHome = async (e) => {
  // Elements
  const audio$$ = document.querySelector('audio');
  const playing_container$$ = document.querySelector('#playing_container');
  // Select Parent Card Element
  let track = await e.target.id;
  // Play on Double Click
  if (e.detail === 2) {
    // Play when click on Card ctrl Play
    await fetchTrackToPlay(track);
    audio$$.play();
    // Player (One time)
    playing_container$$.style.display !== 'block' ? popPlayer() : null;
    // Playing Card Infos
    checkIfLiked();
    popPlayingCard(playing_container$$);
    responsivePlayingDistance();
  }
};

const updateLikeIconFromPlayingCard = (target) => {
  // Elements
  const playingContainer$$ = document.querySelector('.playing_card');
  const likeBtn$$ = document.querySelector('#playing_card_ctrls img[alt*="like"]');
  // Condition
  if (playingContainer$$ && playingContainer$$.getAttribute('id') === target) {
    likeBtn$$.classList.remove('like_active');
  }
  // Delete & Refresh Anyway On Click
  deleteLikeTrack(target);
  pushStateHomeRefresh();
};

// > Daily Song

export const generateDailyTrack = (daily) => {
  // Elements
  let daily_container$$ = document.querySelector('.daily-track');
  let user = getActiveUserData();
  // User Daily ID
  if (!user.daily) {
    daily_container$$.id = `${daily.track.id}`;
  } else {
    daily_container$$.id = user.daily;
  }
  // Track Info
  daily_container$$.innerHTML = dailyTemplate$$(daily);
  // Handler
  daily_container$$.addEventListener('click', (e) => {
    playTrackFromHome(e);
    // Tag as NOT from queue
    document.querySelector('audio').removeAttribute('queue');
  });
};

const dailyTemplate$$ = (song) => {
  return `
    <img src="${song.track.images[cover_sizes.medium].url}">
    <h3>${song.track.title}</h3>
    <span>${song.track.artist}</span>
  `;
};

// > Recommendations Song

export const generateRecommendationsSongs$$ = (recommendations) => {
  // Elements
  let recommendations_ul$$ = document.querySelector('#recommendations-list');
  // DOM
  recommendations.forEach((song) => {
    recommendations_ul$$.innerHTML += recommendationsTemplate$$(
      song.track.id,
      song.track.images[cover_sizes.medium].url,
      song.track.id
    );
  });
  // Handlers
  let rec_cards$$ = document.querySelectorAll('#recommendations-list div');
  rec_cards$$.forEach((card) => {
    card.addEventListener('click', (e) => {
      playTrackFromHome(e);
      // Tag as NOT from queue
      document.querySelector('audio').removeAttribute('queue');
    });
  });
};

const recommendationsTemplate$$ = (id, img, alt) => {
  return `
  <div id="${id}" class="recommendations_card">
    <img id="card_cover" src="${img}" alt="${alt + '_cover_error'}">
  </div>
  `;
};

const recommendationsFlag$$ = (genre) => {
  switch (genre) {
    case 'A+':
      return recommendations_flags.A_plus;
    case 'A':
      return recommendations_flags.A;
    case 'G':
      return recommendations_flags.G;
    case 'R':
      return recommendations_flags.R;
    default:
      return 'Default Recommendation';
  }
};
