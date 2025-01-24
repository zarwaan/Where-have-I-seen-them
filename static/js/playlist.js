import * as pagination from './pagination.js';
import * as cards from './hardCodedCards.js';
import { getApiKey } from './getApiKey.js';

const auth = await getApiKey();
const MY_API_KEY = auth['api-key'];
const MY_BEARER_TOKEN = auth['bearer-token'];

let mediaList = [];
let listOfMediaCards = [];
let pages = [];
var pageToggleButtonCont = document.querySelector('.page-toggle-cont');
var pageCont = document.querySelector('.movies');
var scrollToElement = document.querySelector('.playlist-name');
let selectedMedia = [];
let listOfSelectedCards = [];

document.querySelector('.app-name').addEventListener('click', () => window.open('/', "_self"));

let playlistName = window.location.pathname.split('/')[4].replaceAll('-', ' ');
let playlistId;

function setErrorMessage(message) {
    document.querySelector('.error-message').classList.remove('hidden-error');
    document.querySelector('.error-message').textContent = message;
}

function removeErrorMessage() {
    document.querySelector('.error-message').classList.add('hidden-error');
}

document.querySelector('.title').value = (new URLSearchParams(window.location.search).has('new')) ? 'New playlist name' : playlistName;

if (document.getElementById('del-playlist-text'))
    document.getElementById('del-playlist-text').textContent = `Are you sure you want to delete playlist '${playlistName}'?`;

async function getPlaylistId(name) {
    if (name.toLowerCase() === 'watchlist') return 'watchlist';
    else {
        try {
            const playlistIdResponse = await fetch('/get-playlist-id', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ playlistName: name })
            });
            const playlistIdResult = await playlistIdResponse.json();
            if (playlistIdResponse.ok) {
                return playlistIdResult['playlistId'];
            }
            else {
            }
        } catch (error) {
        }
        return null;
    }
}

async function createMediaCards() {
    if (!playlistId) return;
    let playlistMedia;
    if (playlistId === 'watchlist') {
        try {
            const watchlistResponse = await fetch('/get-watchlist', {
                method: 'GET',
                credentials: 'include'
            });
            const watchListResult = await watchlistResponse.json();
            if (watchlistResponse.ok) {
                playlistMedia = await watchListResult.media;
            }
            else {
            }
        } catch (error) {
        }
    }
    else {
        try {
            const playlistMediaResponse = await fetch("/get-playlist-media", {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ playlistId: playlistId })
            });
            const playlistMediaResult = await playlistMediaResponse.json();
            if (playlistMediaResponse.ok) {
                playlistMedia = playlistMediaResult.media;
            }
            else {
            }
        }
        catch (error) {
        }
    }

    const fetchCards = playlistMedia.map(async (media, index) => {
        const mediaType = media['media_type'] === 1 ? 'movie' : 'tv';
        const mediaResponse = await fetch(`https://api.themoviedb.org/3/${mediaType}/${media.media_id}?api_key=${MY_API_KEY}`);
        const mediaResult = await mediaResponse.json();
        const mediaName = mediaResult['title'] || mediaResult['name'];
        const posterPath = mediaResult['poster_path'] ? `https://image.tmdb.org/t/p/original/${mediaResult['poster_path']}` : "/static/images/no_image.jpg";

        const mediaCard = document.createElement('div');
        mediaCard.classList.add("media-template");
        mediaCard.setAttribute('data-whist-media', mediaName);
        mediaCard.setAttribute('data-whist-id', media.media_id);
        mediaCard.setAttribute('data-whist-type', mediaType);
        const mediaImage = document.createElement('img');
        mediaImage.src = posterPath;
        mediaImage.classList.add('media-image');
        mediaCard.appendChild(mediaImage);
        const mediaCardName = document.createElement('div');
        mediaCardName.innerHTML = mediaName+`&nbsp;`;
        mediaCardName.classList.add('media-title');
        mediaCard.appendChild(mediaCardName);

        return mediaCard;
    });
    const cards = await Promise.all(fetchCards);
    listOfMediaCards.push(...cards);
}

async function fillPages() {
    if (listOfMediaCards.length === 0) {
        var noMovies = document.createElement('div');
        noMovies.classList.add('no-movies');
        noMovies.textContent = "Nothing here!"
        document.querySelector('.spinner-border').remove();
        document.querySelector('.page-toggle-cont').remove();
        document.querySelector('.movies').append(noMovies);
        document.querySelector('button#select').classList.add('hidden');
        return;
    }
    pagination.segregatePages(listOfMediaCards, pages, 40);
    pagination.addToggleButtons(pageToggleButtonCont, pages, scrollToElement, pageCont);
    pagination.displayPage(1, pages, pageCont);
}

async function removeFromPlaylist(card) {
    const mediaId = card.dataset.whistId;
    const mediaType = card.dataset.whistType;
    if (playlistName.toLowerCase() === 'watchlist') {
        try {
            const removeFromWatchlistResponse = await fetch(`/remove-from-watchlist`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mediaId: mediaId, mediaType: mediaType === 'movie' ? 1 : 2 })
            });
            const removeFromWatchlistResult = await removeFromWatchlistResponse.json();
            if (removeFromWatchlistResponse.ok) {
            }
            else {
            }
        }
        catch (error) {
        }
        card.remove();
    }
    else {
        try {
            const removeFromPlaylistResponse = await fetch(`/remove-from-playlist`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ playlistId: playlistId, mediaId: mediaId, mediaType: mediaType === 'movie' ? 1 : 2 })
            });
            const removeFromPlaylistResult = await removeFromPlaylistResponse.json();
            if (removeFromPlaylistResponse.ok) {
            }
            else {
            }
        }
        catch (error) {
        }
        card.remove();
    }
}

async function openMedia(event) {
    const card = event.currentTarget;
    window.open(`/${card.dataset.whistType}/${card.dataset.whistId}-${card.dataset.whistMedia.toLowerCase().replaceAll(' ', '-')}`, "_self")
}

let n = 0;

async function addIndvDeleteOption(numbering = true) {
    listOfMediaCards.forEach(card => {
        n++;
        const removeMedia = document.createElement('span');
        removeMedia.classList.add('delete-icon');
        removeMedia.innerHTML = `<i class="bi bi-trash3-fill"></i>`;
        removeMedia.onclick = async (event) => {
            event.stopPropagation();
            await removeFromPlaylist(card);
        }
        card.querySelector('.media-title').append((numbering && playlistName.toLowerCase() !== 'watchlist' ? n : ''), removeMedia);
        card.addEventListener('click', openMedia);
    });
}

function toggleSelected(event) {
    event.currentTarget.querySelector('.media-image').classList.toggle('selected');
    event.currentTarget.querySelector('.media-image').classList.toggle('unselected');
}

if (document.getElementById('edit'))
    document.getElementById('edit').onclick = () => {
        document.querySelector('.before-title').classList.remove('not-editable-name');
        document.querySelector('.before-title').classList.add('editable-name');
        document.querySelector('.title').disabled = false;
        document.querySelector('.title').focus();
        document.querySelector('button#delete').classList.add('hidden');
        document.querySelector('button#select').classList.add('hidden');
        document.querySelector('button#edit').classList.add('hidden');
        document.querySelector('button#save-name-changes').classList.remove('hidden');
    };

if (document.getElementById('save-name-changes'))
    document.getElementById('save-name-changes').onclick = async () => {
        if ((new URLSearchParams(window.location.search).has('new'))) {
            try {
                const newPlaylistResponse = await fetch("/create-playlist", {
                    method: "POST",
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ playlistName: document.querySelector('.title').value.trim() })
                });
                const newPlaylistResult = await newPlaylistResponse.json();
                if (newPlaylistResponse.ok) {
                    playlistName = document.querySelector('.title').value.trim();
                }
                else {
                    setErrorMessage(newPlaylistResult.message);
                    return;
                }
            }
            catch (error) {
                setErrorMessage("Server error");
                return;
            }
        }
        else {
            try {
                const changePlaylistNameResponse = await fetch('/change-playlist-name', {
                    method: "POST",
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ playlistId: playlistId, playlistName: document.querySelector('.title').value.trim() })
                });
                const changePlaylistNameResult = await changePlaylistNameResponse.json();
                if (changePlaylistNameResponse.ok) {
                    playlistName = document.querySelector('.title').value.trim();
                }
                else {
                    setErrorMessage(changePlaylistNameResult.message);
                    return;
                }
            }
            catch (error) {
                setErrorMessage("Server error");
                return;
            }
        }
        window.open(`${playlistName.replaceAll(' ', '-')}`, '_self');
    };

if (document.getElementById('confirm-delete'))
    document.getElementById('confirm-delete').onclick = async () => {
        try {
            const removePlaylistResponse = await fetch(`/remove-playlist`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ playlistId: playlistId })
            });
            const removePlaylistResult = await removePlaylistResponse.json();
            if (removePlaylistResponse.ok) {
                window.open('../playlists', '_self');
            }
            else {
            }
        }
        catch (error) {
        }
    };

document.getElementById('select').onclick = () => {
    listOfMediaCards.forEach(card => {
        card.removeEventListener('click', openMedia);
        card.querySelector('.delete-icon').remove();
        card.querySelector('.media-image').classList.add('unselected');
        card.addEventListener('click', toggleSelected);
    });
    document.querySelector('button#delete')?.classList.add('hidden');
    document.querySelector('button#select').classList.add('hidden');
    document.querySelector('button#edit')?.classList.add('hidden');
    document.querySelector('button#delete-selection').classList.remove('hidden');
    document.querySelector('button#exit-selection').classList.remove('hidden');
};

document.getElementById('exit-selection').onclick = async () => {
    listOfMediaCards.forEach(card => {
        card.querySelector('.media-image').classList.remove('unselected');
        card.querySelector('.media-image').classList.remove('selected');
    })
    await addIndvDeleteOption(false);
    document.querySelector('button#delete')?.classList.remove('hidden');
    document.querySelector('button#select').classList.remove('hidden');
    document.querySelector('button#edit')?.classList.remove('hidden');
    document.querySelector('button#delete-selection').classList.add('hidden');
    document.querySelector('button#exit-selection').classList.add('hidden');
}

document.getElementById('delete-selection').onclick = () => {
    document.querySelector('#del-sel-text').textContent = `Are you sure you want to remove ${document.querySelectorAll('.selected').length} items ?`;
}

document.getElementById('confirm-delete-selection').onclick = async () => {
    document.querySelectorAll('.selected').forEach(async cardImage => {
        await removeFromPlaylist(cardImage.parentElement);
    });
}


async function main() {
    if (new URLSearchParams(window.location.search).has('new')) {
        document.getElementById('edit').click();
        document.querySelector('.spinner-border').remove();
        return;
    }
    if (!(new URLSearchParams(window.location.search).has('new'))) {
        playlistId = await getPlaylistId(playlistName)
        if (!playlistId) {
            document.querySelector('.playlist-name').remove();
            document.querySelector('.spinner-border').remove();
            return setErrorMessage("No such playlist!");
        }
        await createMediaCards();
        await addIndvDeleteOption(false);
        await fillPages();
    }
}

await main();