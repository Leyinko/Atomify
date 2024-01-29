import {
  fetchDailySong,
  fetchLikedSongsList,
  fetchRecommendationsIDS,
  fetchRecommendationsSongs,
  fetchTrackToPlay,
} from '../../../../public/api/fetch.js';
import { deleteLikeTrack, getActiveUserData, setUserData } from '../../../data/local-storage-mock';
import {
  clickOnTouch,
  getLikedQueueSongs,
  getRandomTrackID,
  likedQueueIDs,
  popPlayer,
} from '../../../components/player/player';
import {
  checkIfLiked,
  popPlayingCard,
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
import { pushStateHomeRefresh } from '../../../router/router.js';

export const Home = () => {
  // Reset Container
  document.querySelector('main article').innerHTML = null;

  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let currentDate = new Date().toLocaleDateString('en-US', options);

  let user = getActiveUserData();
  loadUserData();

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
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let currentDate = new Date().toLocaleDateString('en-US', options);

  let user = getActiveUserData();
  // Daily Reset
  if (user.date !== currentDate || !user.date) {
    setUserData(user.id, 'date', currentDate);
    setUserData(user.id, 'daily', getRandomTrackID(100));
    fetchRecommendationsIDS();
  }
  // Fetch Data
  await fetchLikedSongsList();
  await fetchDailySong();
  await fetchRecommendationsSongs();
  // DOM Local
  let checkerInjectOnce = document.querySelector('.playlist-info');
  if (checkerInjectOnce && checkerInjectOnce.childNodes.length === 0) {
    generatePopularityRate();
    generatePredominantCategory();
    profilePictureManager();
  }
  // DOM Fetched Data
  playLikePlaylistHandler();
  getLikedQueueSongs();
  highlightPlayingSongFromLikeList();
};

// > Profile Picture

const profilePictureManager = () => {
  let profile_picture_container$$ = document.querySelector('#picture-container');
  let modal_selection$$ = document.querySelector('#profile-pictures-selection');
  profile_picture_container$$.addEventListener('click', () => {
    modal_selection$$.classList.toggle('selection-active');
    // Blur Effect
    let h1 = document.querySelector('.user-information h1');
    let spans = document.querySelectorAll('.user-information span');
    h1.classList.toggle('blurred');
    spans.forEach((span) => span.classList.toggle('blurred'));
  });
  // Pictures
  let pictures$$ = Object.values(profile_pictures);
  pictures$$.forEach((picture) => {
    let image = document.createElement('img');
    image.className = 'profile-picture-miniature';
    image.src = picture;

    modal_selection$$.appendChild(image);
  });
  // Handlers
  let pictures_selection$$ = document.querySelectorAll('.profile-picture-miniature');
  pictures_selection$$.forEach((picture) => {
    picture.addEventListener('click', () => {
      // Selection Toggle
      pictures_selection$$.forEach((picture) => picture.classList.remove('miniature-selected'));

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
    let newPicture = document.querySelector('.miniature-selected');
    let user = getActiveUserData();
    if (newPicture) {
      setUserData(user.id, 'profile_picture', newPicture.src);
      // Redirect
      pushStateHomeRefresh();
    }
  });
};

// > Likes & Scores

const generatePopularityRate = () => {
  let liked_songs$$ = document.querySelectorAll('.liked_song_li');
  let playlist_info$$ = document.querySelector('.playlist-info');
  let counter_likes$$ = document.createElement('span');
  const user = getActiveUserData();
  //
  if (!user.likes) {
    counter_likes$$.textContent = `0 song liked - `;
  } else if (user.likes.length <= 1) {
    counter_likes$$.textContent = `${user.likes.length} song liked - `;
  } else {
    counter_likes$$.textContent = `${user.likes.length} songs liked - `;
  }

  playlist_info$$.appendChild(counter_likes$$);
  // PR
  let rates = [];
  liked_songs$$.forEach((song) => rates.push(Number(song.getAttribute('popularity'))));
  let sum = rates.reduce((acc, next) => acc + next, 0);
  let percentage = `${(sum / rates.length).toFixed(0)} % (PR) - `;
  // DOM
  let ratio$$ = document.createElement('span');
  playlist_info$$.appendChild(ratio$$);
  // Output
  percentage === 'NaN % (PR) - ' ? (percentage = 'Score not available yet.') : percentage;
  ratio$$.textContent = `${percentage}`;
};

const generatePredominantCategory = () => {
  let liked_songs$$ = document.querySelectorAll('.liked_song_li');
  let playlist_info$$ = document.querySelector('.playlist-info');
  //
  let final_category$$ = document.createElement('span');
  if (liked_songs$$.length === 0) {
    return;
  }
  playlist_info$$.appendChild(final_category$$);
  // PC
  let categories = {};
  liked_songs$$.forEach((track) => {
    let genre = track.getAttribute('genre');
    if (categories.hasOwnProperty(genre)) {
      categories[genre] += 1;
    } else {
      categories[genre] = 1;
    }
  });
  // Evaluate
  let highest = Object.keys(categories).reduce((a, b) => (categories[a] > categories[b] ? a : b));
  // Output
  final_category$$.textContent = `${highest} (PC)`;
};

export const likedSongList = async (songs) => {
  const list = document.querySelector('#liked-list');
  if (list && list.childNodes.length === 0) {
    songs.forEach((song) => {
      list.innerHTML += likedSongListElement$$(song);
    });
    // Empty
    if (list.children.length === 0) {
      noLikedSongsMessage$$();
    }
    // Handlers
    const list_elements$$ = document.querySelectorAll('.liked_song_li');
    list_elements$$.forEach((element) => {
      element.addEventListener('click', (e) => {
        let targetIndex = getIndexOfTrackInLikeQueue(e.target.id);
        // Phone & Tablets
        clickOnTouch(e);
        // Desktop
        if (e.detail === 2) {
          playMusicQueue(targetIndex);
          document.querySelector('audio').setAttribute('queue', true);
        }
      });
    });
    // Delete Button Handler
    const delete_like_buttons$$ = document.querySelectorAll('.liked_song_li img:last-of-type');
    delete_like_buttons$$.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        let target = e.target.parentElement.id;
        updateLikeIconOnDeleteFromPlayingCard(target);
        document.querySelector('audio').removeAttribute('queue');
      });
    });
  }
};

export const noLikedSongsMessage$$ = () => {
  const list = document.querySelector('#liked-list');
  if (list) {
    let empty_likes$$ = document.createElement('span');
    empty_likes$$.className = 'empty-likes';
    empty_likes$$.textContent = 'No songs liked yet.';
    if (list.children.length === 0) {
      list.appendChild(empty_likes$$);
    } else {
      empty_likes$$.remove();
    }
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

export const ascendingOrderLikeTracks = (array) => {
  return array
    .map((track) => Number(track))
    .sort((a, b) => a - b)
    .map((number) => String(number));
};

export const getIndexOfTrackInLikeQueue = (element) => likedQueueIDs.indexOf(element);

export const highlightPlayingSongFromLikeList = () => {
  const likedSongs = document.querySelectorAll('#liked-list li');
  const audio$$ = document.querySelector('audio');
  likedSongs.forEach((song) => {
    if (song.id === audio$$.getAttribute('playing_track_id')) {
      song.classList.add('playing-liked-song-active');
    } else {
      song.classList.remove('playing-liked-song-active');
    }
  });
};

// > Play

const playLikePlaylistHandler = () => {
  let play_like_btn$$ = document.querySelector('#play_liked_playlist');
  const likedSongs = document.querySelectorAll('#liked-list li');
  const audio$$ = document.querySelector('audio');
  // Handler
  if (play_like_btn$$) {
    play_like_btn$$.addEventListener('click', (e) => {
      // Queue
      if (audio$$.getAttribute('queue')) {
        !audio$$.paused ? audio$$.pause() : audio$$.play();
      } else if (likedSongs.length > 0) {
        // [0]
        playMusicQueue(0);
        audio$$.setAttribute('queue', true);
      } else {
        e.preventDefault();
      }
    });
  }
};

// Queue Play

export const playMusicQueue = async (index) => {
  const audio$$ = document.querySelector('#audio');
  const playing_container$$ = document.querySelector('#playing_container');
  let currentSong = likedQueueIDs[index];
  if (currentSong) {
    // Play
    await fetchTrackToPlay(currentSong);
    audio$$.play();
    // Visual
    playing_container$$.style.display !== 'block' ? popPlayer() : null;
    popPlayingCard(playing_container$$);
    checkIfLiked();
  }
};

// Home Play

export const playTrackFromHome = async (e) => {
  const audio$$ = document.querySelector('audio');
  const playing_container$$ = document.querySelector('#playing_container');
  let track = await e.target.id;
  // Phone & Tablets
  clickOnTouch(e);
  // Desktop
  if (e.detail === 2) {
    // Play
    await fetchTrackToPlay(track);
    audio$$.play();
    // Visual
    playing_container$$.style.display !== 'block' ? popPlayer() : null;
    checkIfLiked();
    popPlayingCard(playing_container$$);
    responsivePlayingDistance();
  }
};

const updateLikeIconOnDeleteFromPlayingCard = (target) => {
  const playingContainer$$ = document.querySelector('.playing_card');
  const likeBtn$$ = document.querySelector('#playing_card_ctrls img[alt*="like"]');
  if (playingContainer$$ && playingContainer$$.getAttribute('id') === target) {
    likeBtn$$.classList.remove('like_active');
  }
  // Delete & Redirect
  deleteLikeTrack(target);
  pushStateHomeRefresh();
};

// > Daily Song

export const generateDailyTrack = (daily) => {
  let daily_container$$ = document.querySelector('.daily-track');
  let user = getActiveUserData();
  if (daily_container$$) {
    if (!user.daily) {
      daily_container$$.id = `${daily.track.id}`;
    } else {
      daily_container$$.id = user.daily;
    }

    daily_container$$.innerHTML = dailyTemplate$$(daily);
    // Handler
    daily_container$$.addEventListener('click', (e) => {
      playTrackFromHome(e);
      document.querySelector('audio').removeAttribute('queue');
    });
  }
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
  let recommendations_ul$$ = document.querySelector('#recommendations-list');
  let recommendations_cards$$ = document.querySelectorAll('#recommendations-list div');
  if (recommendations_ul$$) {
    if (recommendations_cards$$.length === 0) {
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
          document.querySelector('audio').removeAttribute('queue');
        });
      });
    }
  }
};

const recommendationsTemplate$$ = (id, img, alt) => {
  return `
  <div id="${id}" class="recommendations_card">
    <img id="card_cover" src="${img}" alt="${alt + '_cover_error'}">
  </div>
  `;
};

// > Category Flags

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
