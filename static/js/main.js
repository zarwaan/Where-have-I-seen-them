import { createProfileLink } from "./createProfileLink.js";
import { fetchPlaylists } from "./fillPlaylists.js";
import { getApiKey } from "./getApiKey.js";

createProfileLink();

var errorMessage = "";
var resultDiv = document.getElementById('result');
var castListDiv = document.querySelector('.cast-list-div');
let watched;
var errorMessageDiv = document.getElementById('error-message');

function setErrorMessage(errorText) {
    document.querySelector(".main-content").style.display = "none";
    errorMessageDiv.innerHTML = errorText;
    errorMessageDiv.style.display = "";
    document.querySelector('.spinner-border').remove();
}

function removeErrorMessage() { errorMessageDiv.style.display = "none"; }
removeErrorMessage();

document.querySelector('.app-name').addEventListener('click', () => window.open('/', "_self"));

var inputMedia = document.getElementById('query');
let debounceTimeout;

inputMedia.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => displayMediaOptions(inputMedia.value), 300)
});

function clearOldLists() {
    var oldList = document.querySelectorAll(`div[data-whist-list-age=old]`)
    if (oldList.length !== 0) oldList.forEach((list) => {
        list.remove();
    });
}

async function displayMediaOptions(query) {
    const inputDiv = document.querySelector('.div-with-list');
    var oldList = document.querySelectorAll(`.option-list`);
    if (oldList.length !== 0) oldList.forEach((list) => {
        list.setAttribute('data-whist-list-age', 'old');
    });

    var optionList = document.createElement('div');
    optionList.classList.add('option-list');
    optionList.setAttribute('data-whist-list-age', 'new');

    try {
        const auth = await getApiKey()
        const MY_API_KEY = await auth["api-key"];
        const MY_BEARER_TOKEN = await auth["bearer-token"];

        const url = `https://api.themoviedb.org/3/search/multi?query=${query}&api_key=${MY_API_KEY}`;
        const response = await fetch(url);
        const result = await response.json();

        var mediaOptions = [];
        var optionResults = result['results'];
        var sortedOptionResults = optionResults.sort((a, b) => b['vote_count'] - a['vote_count']);
        for (let i = 0; i < Math.min(5, sortedOptionResults.length); i++) {
            if (sortedOptionResults[i]['media_type'] !== "movie" && sortedOptionResults[i]['media_type'] !== "tv") continue;
            mediaOptions.push(sortedOptionResults[i]['name'] || sortedOptionResults[i]['title'])
            var option = document.createElement('div');
            option.classList.add('option');

            var optionImageDiv = document.createElement('div');
            optionImageDiv.classList.add('option-image-div');

            var optionTitleDiv = document.createElement('div');
            optionTitleDiv.classList.add('option-title-div');

            var optionImage = document.createElement('img');
            optionImage.classList.add('option-image');
            optionImage.src = sortedOptionResults[i]['poster_path'] ? `https://image.tmdb.org/t/p/w300/${sortedOptionResults[i]['poster_path']}` : `../static/images/no_image.jpg`;

            const posterPath = sortedOptionResults[i]['poster_path'] ? `https://image.tmdb.org/t/p/w300/${sortedOptionResults[i]['poster_path']}` : `../static/images/no_image.jpg`
            optionTitleDiv.textContent = `${sortedOptionResults[i]['name'] || sortedOptionResults[i]['title']}`;
            const onlyTitle = `${sortedOptionResults[i]['name'] || sortedOptionResults[i]['title']}`

            if (sortedOptionResults[i]['release_date']) {
                optionTitleDiv.textContent += ` (${sortedOptionResults[i]['release_date'].substring(0, 4)})`;
            }
            else {
                if (sortedOptionResults[i]['first_air_date']) {
                    optionTitleDiv.textContent += ` (${sortedOptionResults[i]['first_air_date'].substring(0, 4)})`;
                }
                else {
                    optionTitleDiv.textContent += ` (?)`;
                }
            }

            optionImageDiv.append(optionImage);
            option.append(optionImageDiv);
            option.append(optionTitleDiv);
            option.addEventListener('click', () => selectThisOption(onlyTitle, posterPath, sortedOptionResults[i]['overview'], sortedOptionResults[i]['media_type'], sortedOptionResults[i]['id']));

            optionList.append(option);
        }

        inputDiv.append(optionList);
        clearOldLists();
    } catch (error) {
    }
}

function clearAllLists() {
    var lists = document.querySelectorAll('.option-list')
    lists.forEach((list) => list.remove());
}

function selectThisOption(mediaName, posterPath, overview, mediaType, id) {
    inputMedia.value = mediaName;
    window.open(`/${mediaType}/${id}-${mediaName.toLowerCase().replaceAll(' ', '-')}`, "_self");
    clearAllLists();
}

async function findMovie(event = null, mediaNameArg, mediaIDArg = null, mediaTypeArg = null) {
    if (event) event.preventDefault();
    clearAllLists();
    clearTimeout(debounceTimeout);
    try {
        const auth = await getApiKey()
        const MY_API_KEY = await auth["api-key"];
        const MY_BEARER_TOKEN = await auth["bearer-token"];

        var mediaID, mediaType;
        if (!mediaIDArg) {
            const mediaToSearch = encodeURIComponent(mediaNameArg);
            const mediaNameResponse = await fetch(`https://api.themoviedb.org/3/search/multi?query=${mediaToSearch}&api_key=${MY_API_KEY}`);
            let mediaNameResult = await mediaNameResponse.json();
            mediaNameResult = mediaNameResult['results'].filter((media) => media.media_type === 'movie' || media.media_type === 'tv')
                .sort((a, b) => b['vote_count'] - a['vote_count']);
            mediaID = mediaNameResult[0]['id'];
            mediaType = mediaNameResult[0]['media_type'];
        }
        else {
            mediaID = mediaIDArg;
            mediaType = mediaTypeArg;
        }
        setWatched(mediaID, mediaType);
        document.getElementById('confirm-add').addEventListener('click', async () => { await addToPlaylist(mediaID, mediaType); })
        await fetchAllPlaylists(mediaID, mediaType);
        try {
            const mediaIDResponse = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaID}?api_key=${MY_API_KEY}`);
            var mediaIDResult = await mediaIDResponse.json();
            const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });

            var posterPath, backdropPath, title, year, runtime = [], language, genres = [], tagline, overview, directorCreators = [], budget, revenue;
            backdropPath = mediaIDResult['backdrop_path'] ? `https://image.tmdb.org/t/p/original/${mediaIDResult['backdrop_path']}` : '';
            posterPath = mediaIDResult['poster_path'] ? `https://image.tmdb.org/t/p/original/${mediaIDResult['poster_path']}` : "../static/images/no_image.jpg";
            title = mediaIDResult['title'] || mediaIDResult['name'];
            if (mediaIDResult['release_date'])
                year = mediaIDResult['release_date'].substring(0, 4);
            else if (mediaIDResult['first_air_date'])
                year = `${mediaIDResult['first_air_date'].substring(0, 4)} - ${mediaIDResult['last_air_date'].substring(0, 4)}`;
            else
                year = "";
            if (mediaIDResult['runtime']) {
                runtime.push(Math.trunc(mediaIDResult['runtime'] / 60));
                runtime.push(mediaIDResult['runtime'] % 60);
            }
            else {
                if (mediaIDResult['number_of_episodes']) {
                    runtime.push(mediaIDResult['number_of_seasons']);
                    runtime.push(mediaIDResult['number_of_episodes']);
                }
            }

            if (mediaIDResult['original_language'])
                language = displayNames.of(mediaIDResult['original_language'])
            else
                language = "";

            if (mediaIDResult['genres']) {
                for (let i = 0; i < Math.min(3, mediaIDResult['genres'].length); i++) {
                    genres.push(mediaIDResult['genres'][i]['name'])
                }
            }
            tagline = mediaIDResult['tagline'] || "";
            overview = mediaIDResult['overview'] || "";
            if (mediaType === 'tv') {
                for (let i = 0; i < Math.min(3, mediaIDResult['created_by'].length); i++) {
                    directorCreators.push(mediaIDResult['created_by'][i]['name']);
                }
            }
            else {
                try {
                    const directorResponse = await fetch(`https://api.themoviedb.org/3/movie/${mediaID}/credits?api_key=${MY_API_KEY}`);
                    var directorResult = await directorResponse.json();
                    const directors = directorResult['crew'].filter(
                        director => director['job'] === "Director"
                    );
                    directors.forEach(director => directorCreators.push(director['name']));
                } catch (error) {
                }
            }
            budget = mediaIDResult['budget'] || "";
            revenue = mediaIDResult['revenue'] || "";

            renderElements(mediaType, posterPath, backdropPath, title, year, runtime, language, genres, tagline, overview, directorCreators, budget, revenue);

            var castListResult;
            if (mediaType === 'movie') {
                castListResult = directorResult;
            }
            else {
                const castListResponse = await fetch(`https://api.themoviedb.org/3/tv/${mediaID}/aggregate_credits?api_key=${MY_API_KEY}`)
                castListResult = await castListResponse.json();
            }

            renderCastList(castListResult['cast'], mediaType);
        } catch (error) {
            setErrorMessage("ID error");
            return;
        }
    } catch (error) {
        setErrorMessage("Could not find movie or TV show!");
    }
}

function renderElements(mediaType, posterPath, backdropPath, title, year, runtime, language, genres, tagline, overview, directorCreators, budget, revenue) {
    removeErrorMessage();
    document.querySelector(".main-content").style.display = 'flex';
    if (!backdropPath) {
        document.body.style.setProperty("--image", `url('../images/collage.jpg')`);
        document.querySelector('.main-content').style.color = "rgb(224, 224, 224)";
        document.body.style.setProperty("--brightness", "12%");
    }
    else {
        document.body.style.setProperty("--image", `url('${backdropPath}')`);
        document.querySelector('.main-content').style.color = "rgb(224, 224, 224)";
        document.body.style.setProperty("--brightness", "15%");
    }

    document.getElementById('media-image').src = posterPath;
    document.getElementById('media-name').textContent = title;
    document.getElementById('media-year').textContent = `(${year})`;
    document.title = `${title} (${year})`;
    document.getElementById('media-tagline').textContent = tagline;
    if (runtime.length > 0) {
        if (mediaType === 'movie') {
            document.getElementById('media-run-time').textContent = `${runtime[0]}h ${runtime[1]}min`;
        }
        else {
            document.getElementById('media-run-time').textContent = `${runtime[1]} episodes`;
        }
    }
    else {
        document.getElementById('media-run-time').textContent = '';
    }
    document.getElementById('media-language').textContent = language;
    document.getElementById('media-genres').textContent = genres.join(', ');
    document.getElementById('media-overview').textContent = overview;
    if (mediaType === 'tv') {
        document.getElementById('director-label').textContent = "Creator(s): ";
        document.getElementById('director').textContent = directorCreators.join(', ');
    }
    else {
        document.getElementById('director-label').textContent = "Director: ";
        document.getElementById('director').textContent = directorCreators[0];
    }
    if (mediaType === 'movie') {
        document.querySelector('.media-budget').style.display = '';
        document.getElementById('movie-budget').textContent = commaSeperated(budget);
        document.querySelector('.media-revenue').style.display = '';
        document.getElementById('movie-revenue').textContent = commaSeperated(revenue);
    }
    else {
        document.querySelector('.media-budget').style.display = 'none';
        document.querySelector('.media-revenue').style.display = 'none';
    }
}

function renderCastList(castArg, mediaType) {
    document.querySelector('.spinner-border').remove();
    castListDiv.innerHTML = "";
    var cast;
    if (mediaType === 'tv')
        cast = castArg.sort((a, b) => b['total_episode_count'] - a['total_episode_count']);
    else
        cast = castArg.sort((a, b) => a['order'] - b['order']);
    for (let i = 0; i < Math.min(cast.length, 15); i++) {
        const castCard = document.createElement('div');
        castCard.classList.add('cast-card');
        const actornameurl = cast[i]['name'] || "";
        const actoridurl = cast[i]['id'] || "";
        castCard.setAttribute('data-whist-actor-name', actornameurl);
        castCard.setAttribute('data-whist-actor-id', actoridurl);
        castCard.style.cursor = "pointer";
        castCard.addEventListener('click', () => {
            window.open(`/actor/${actoridurl}-${actornameurl.toLowerCase().replaceAll(' ', '-')}`, "_self");
        });

        const castPhotoDiv = document.createElement('div');
        castPhotoDiv.classList.add('cast-photo');

        const castInfoDiv = document.createElement('div');
        castInfoDiv.classList.add('cast-info');

        const profileImage = document.createElement('img');
        profileImage.setAttribute('loading', 'lazy');
        profileImage.classList.add('profile-image');
        profileImage.src = cast[i]['profile_path'] ? `https://image.tmdb.org/t/p/original/${cast[i]['profile_path']}` : `../static/images/no_image.jpg`;

        const actorName = document.createElement('span');
        actorName.classList.add('actor-name');
        actorName.textContent = cast[i]['name'] || "?";

        const as = document.createElement('span');
        as.classList.add('as');
        as.textContent = " as ";

        const characterName = document.createElement('span');
        characterName.classList.add('character-name');
        characterName.textContent = "";
        if (mediaType === 'movie') {
            characterName.textContent = cast[i]['character'];
        }
        else {
            for (let j = 0; j < Math.min(cast[i]['roles'].length, 5); j++) {
                characterName.textContent += cast[i]['roles'][j]['character'];
                if (j !== 4 && j !== cast[i]['roles'].length - 1)
                    characterName.textContent += " / ";
            }
        }

        castPhotoDiv.append(profileImage);
        castInfoDiv.append(actorName, as, characterName);
        castCard.append(castPhotoDiv, castInfoDiv);
        castListDiv.append(castCard);
    }
}

function renderWatchStatusDiv(mediaId, mediaType, watched) {
    var watchContDiv = document.querySelector('.watch-cont');
    watchContDiv.innerHTML = "";
    var watchStatusDiv = document.createElement('div');
    watchStatusDiv.classList.add('watch-status-div');
    var watchInfoDiv = document.createElement('div');
    watchInfoDiv.classList.add('watch-status-info');
    var watchStatusButton = document.createElement('button');
    watchStatusButton.classList.add('btn');
    watchStatusButton.onclick = () => { toggleWatched(mediaId, mediaType) };
    if (!Cookies.get('userInfo')) {
        watchStatusButton.style.cursor = 'not-allowed';
        watchStatusButton.setAttribute('data-bs-toggle', 'tootlip');
        watchStatusButton.setAttribute('data-bs-placement', 'right');
        watchStatusButton.setAttribute('type', 'button');
        watchStatusButton.setAttribute('data-bs-title', `You must be signed in!`);
        watchStatusButton.setAttribute('data-bs-custom-class', 'not-signed-in-tooltip');
        new bootstrap.Tooltip(watchStatusButton);
    }

    if (watched) {
        watchStatusDiv.classList.add('watched');
        watchInfoDiv.textContent = "You have watched this";
        watchStatusButton.textContent = "I have not!";
        watchStatusButton.id = "watched-btn";
    }
    else {
        watchStatusDiv.classList.add('unwatched');
        watchInfoDiv.textContent = "You have not watched this";
        watchStatusButton.textContent = "I have!";
        watchStatusButton.id = "unwatched-btn";
    }

    watchStatusDiv.append(watchInfoDiv);
    watchStatusDiv.append(watchStatusButton);
    watchContDiv.append(watchStatusDiv);
}

document.getElementById('search').addEventListener('click', (event) => {
    window.open(`/media?query=${document.getElementById('query').value}`, "_self");
});

document.getElementById('search-form').addEventListener('submit', (event) => {
    window.open(`/media?query=${document.getElementById('query').value}`, "_self");
    event.preventDefault();
});

function commaSeperated(budget) {
    var commaBudget = [];
    while (budget > 1000) {
        commaBudget.push((budget % 1000).toString().padStart(3, '0'));
        budget = Math.trunc(budget / 1000);
    }
    commaBudget.push(budget);
    return commaBudget.reverse().join(',');
}

async function toggleWatched(mediaId, mediaType) {
    if (!Cookies.get('userInfo')) {
        return;
    }

    let endpoint = 'log-media';
    if (watched) endpoint = 'unlog-media';
    else endpoint = 'log-media';

    try {
        const logMediaResponse = await fetch(`/${endpoint}`, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mediaId: mediaId, mediaType: mediaType === 'movie' ? 1 : 2 })
        });
        const logMediaResult = await logMediaResponse.json();
        if (logMediaResponse.ok) {
        }
        else {
        }
    }
    catch (error) {
    }

    watched = !watched;
    renderWatchStatusDiv(mediaId, mediaType, watched);
}

async function setWatched(mediaId, mediaType) {
    if (!Cookies.get('userInfo')) {
        watched = false;
    }
    else {
        try {
            const watchStatusResponse = await fetch("/get-watch-status", {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mediaId: mediaId, mediaType: mediaType === 'movie' ? 1 : 2 })
            });
            const watchStatusResult = await watchStatusResponse.json();
            if (watchStatusResponse.ok) {
                watched = await watchStatusResult.watched;
            }
            else {
            }
        }
        catch (error) {
        }
    }
    renderWatchStatusDiv(mediaId, mediaType, watched);
}

async function fetchAllPlaylists(id, type) {
    if (!Cookies.get('userInfo')) {
        return;
    }
    document.getElementById('playlist-list').innerHTML = '';
    const watchlist = document.createElement('div');
    watchlist.classList.add('playlist');

    const watchlistCheck = Object.assign(document.createElement('input'), {
        type: 'checkbox',
        id: 'watchlist-check',
        className: 'playlist-option',
    });
    watchlistCheck.dataset.whistPlaylistId = 'watchlist';

    try {
        const checkInWatchlistResponse = await fetch("/check-in-watchlist", {
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mediaId: id, mediaType: type === 'movie' ? 1 : 2 })
        });
        const checkInWatchListResult = await checkInWatchlistResponse.json();
        if (checkInWatchlistResponse.ok) {
            if (checkInWatchListResult.inWatchlist) {
                watchlistCheck.checked = true;
                watchlistCheck.disabled = true;
            }
        }
        else {
        }
    }
    catch (error) {
    }

    const watchlistLabel = document.createElement('label');
    watchlistLabel.setAttribute('for', 'watchlist-check');
    watchlistLabel.innerHTML = '&nbsp;Watchlist'

    const sep = Object.assign(document.createElement('hr'), {
        style: {
            marginLeft: '-1rem',
            marginRight: '-1rem'
        }
    });

    watchlist.append(watchlistCheck, watchlistLabel);
    document.getElementById('playlist-list').append(watchlist, sep);

    let playlists = await fetchPlaylists();
    for (const playlist of playlists) {
        const playlistId = playlist["playlist_id"];
        const playlistName = playlist["playlist_name"];
        const playlistCheck = Object.assign(document.createElement('input'), {
            type: 'checkbox',
            id: playlistName.replaceAll(' ', '-'),
            className: 'playlist-option',
        });
        playlistCheck.dataset.whistPlaylistId = playlistId;

        try {
            const checkInPlaylistResponse = await fetch("/check-in-playlist", {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ playlistId: playlistId, mediaId: id, mediaType: type === 'movie' ? 1 : 2 })
            });
            const checkInPlaylistResult = await checkInPlaylistResponse.json();
            if (checkInPlaylistResponse.ok) {
                if (checkInPlaylistResult.inPlaylist) {
                    playlistCheck.checked = true;
                    playlistCheck.disabled = true;
                }
            }
            else {
            }
        }
        catch (error) {
        }

        const playlistLabel = document.createElement('label');

        playlistLabel.setAttribute('for', playlistName.replaceAll(' ', '-'));
        playlistLabel.innerHTML = `&nbsp;${playlistName}`

        const playlistDiv = document.createElement('div');
        playlistDiv.classList.add('playlist');
        playlistDiv.append(playlistCheck, playlistLabel);
        document.getElementById('playlist-list').append(playlistDiv);
    }
}

async function addToPlaylist(id, type) {
    document.querySelectorAll('.playlist input').forEach(async playlist => {
        if (playlist.checked && !playlist.disabled) {
            if (playlist.dataset.whistPlaylistId === 'watchlist') {
                try {
                    const addToWatchlistResponse = await fetch('/add-to-watchlist', {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ mediaId: id, mediaType: type === 'movie' ? 1 : 2 })
                    });
                    const addToWatchlistResult = addToWatchlistResponse.json();
                    if (addToWatchlistResponse.ok)
                    {}
                    else
                    {}
                }
                catch (error) {
                    setErrorMessage('Server error: ', error);
                }
            }
            else {
                try {
                    const addToPlaylistResponse = await fetch('/add-to-playlist', {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ playlistId: playlist.dataset.whistPlaylistId, mediaId: id, mediaType: type === 'movie' ? 1 : 2 })
                    });
                    const addToPlaylistResult = addToPlaylistResponse.json();
                    if (addToPlaylistResponse.ok)
                    {}
                    else
                    {}
                }
                catch (error) {
                    setErrorMessage('Server error: ', error);
                }
            }
        }
    });
    await fetchAllPlaylists(id, type);
}

function main() {
    const path = window.location.pathname.split('/');
    if (path[1] === 'media') {
        const params = new URLSearchParams(window.location.search);
        if (params.size === 0)
            document.querySelector('.spinner-border').remove();
        else
            findMovie(null, params.get('query'), null, null);
    }
    else {
        if (path[2].indexOf('-') < 0) path[2] += '-';
        findMovie(null, path[2].slice(path[2].indexOf('-') + 1), path[2].slice(0, path[2].indexOf('-')), path[1]);
    }
}

main();

if (Cookies.get('userInfo'))
    document.querySelector('.add-to-playlist').classList.remove('hidden');

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))