import { getApiKey } from './getApiKey.js';
import * as cards from './hardCodedCards.js';

const auth = await getApiKey();
const MY_API_KEY = auth['api-key'];
const MY_BEARER_TOKEN = auth['bearer-token'];

var successMessageDiv = document.querySelector('.successful');
if (successMessageDiv) successMessageDiv.style.setProperty('top', `-${successMessageDiv.clientHeight}px`);

async function createList(name, id, playlistMedia = [], number = 0) {
    let playlist = document.createElement('div');
    playlist.classList.add('playlist');
    playlist.setAttribute('data-whist-playlist-id', id);
    let playlistName = document.createElement('div');
    playlistName.classList.add('playlist-name');
    playlistName.textContent = `${name}`;
    let playlistContent = document.createElement('div');
    playlistContent.classList.add('playlist-content');

    if (id === 'watchlist') {
        try {
            const watchlistResponse = await fetch('/get-watchlist', {
                method: 'GET',
                credentials: 'include'
            });
            const watchListResult = await watchlistResponse.json();
            if (watchlistResponse.ok) {
                playlistMedia = await watchListResult.media;
                number = playlistMedia.length;
            }
            else {
            }
        }
        catch (error) {
        }
    }

    playlistMedia = playlistMedia.slice(0, Math.min(12, playlistMedia.length));
    let i = 0;
    let listOfPlaylistCards = [];
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
        mediaCard.onclick = () => {
            window.open(`/${mediaType}/${media.media_id}-${mediaName.toLowerCase().replaceAll(' ', '-')}`, "_self")
        }
        return mediaCard;
    });
    const fetchedCards = await Promise.all(fetchCards);
    playlistContent.append(...fetchedCards);

    playlist.append(playlistName, playlistContent);

    let seeMoreCont = document.createElement('div');
    seeMoreCont.classList.add('playlist-content', 'see-more-cont');
    let seeMore = document.createElement('div');
    seeMore.classList.add('media-template', 'see-more');
    let seeMoreBtn = document.createElement('button');
    seeMoreBtn.classList.add('btn', 'btn-secondary');
    seeMoreBtn.textContent = `See all (${number})`;
    let seeMoreIcon = document.createElement('i');
    seeMoreIcon.classList.add('bi', 'bi-arrow-right');
    seeMoreBtn.append(document.createElement('br'), seeMoreIcon);
    seeMoreBtn.onclick = () => {
        window.open(`/users/${encodeURIComponent(JSON.parse(Cookies.get('userInfo')).username)}/playlists/${(name.replaceAll(' ', '-'))}`, '_self');
    }
    seeMore.append(seeMoreBtn);
    seeMoreCont.append(seeMore)
    playlist.append(seeMoreCont);
    document.querySelector('.playlists').append(playlist);
}

export async function fetchPlaylists() {
    let playlists = [];
    try {
        const userPlaylistsResponse = await fetch("/all-playlists", {
            method: "GET",
            credentials: 'include',
        });
        const userPlaylistsResult = await userPlaylistsResponse.json();
        if (userPlaylistsResponse.ok) {
            const fetchedPlaylists = userPlaylistsResult.playlists;
            if (fetchedPlaylists.length === 0)
                return playlists;
            for (const playlist of fetchedPlaylists) {
                try {
                    const playlistMediaResponse = await fetch("/get-playlist-media", {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ playlistId: playlist['playlist_id'] })
                    });
                    const playlistMediaResult = await playlistMediaResponse.json();
                    const media = playlistMediaResult.media;
                    playlists.push({
                        playlist_id: playlist['playlist_id'],
                        playlist_name: playlist['playlist_name'],
                        playlist_media: media
                    });
                } catch (error) {
                }
            }
        }
        else {
        }
    } catch (error) {
    }
    return playlists;
}

export async function fillPlaylists(watchlist = true, all = false) {
    document.querySelector(".create-playlist div").onclick = async () => {
        window.open(`/users/${encodeURIComponent(JSON.parse(Cookies.get('userInfo')).username)}/playlists/-?new=true`, '_self')
    }
    const playlists = await fetchPlaylists();
    if (watchlist)
        await createList("Watchlist", "watchlist")
    if (playlists.length === 0) return;
    let numberOfPlaylists = playlists.length;
    if (!all) {
        for (let i = 0; i < Math.min(3, numberOfPlaylists); i++) {
            await createList(playlists[i]['playlist_name'], playlists[i]['playlist_id'], playlists[i]['playlist_media'], playlists[i]['playlist_media'].length);
        }
        if (numberOfPlaylists > 3) {
            document.querySelector(".see-all-playlists").classList.remove('hidden');
            document.querySelector(".see-all-playlists a").textContent = `See all playlists (${numberOfPlaylists})`;
            document.querySelector(".see-all-playlists a").href = `/users/${encodeURIComponent(JSON.parse(Cookies.get('userInfo')).username)}/playlists/`;
        }
    }
    else {
        for (let i = 0; i < (numberOfPlaylists); i++) {
            await createList(playlists[i]['playlist_name'], playlists[i]['playlist_id'], playlists[i]['playlist_media']);
        }
    }
}