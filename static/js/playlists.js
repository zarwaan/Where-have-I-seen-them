import { fillPlaylists } from './fillPlaylists.js'
import * as pagination from './pagination.js';
import * as cards from './hardCodedCards.js';
import { getApiKey } from './getApiKey.js';

const auth = await getApiKey();
const MY_API_KEY = auth['api-key'];
const MY_BEARER_TOKEN = auth['bearer-token'];

document.querySelector('.app-name').addEventListener('click', () => window.open('/', "_self"));

await fillPlaylists(false, true);

document.getElementById('search-playlist').addEventListener('input', () => {
    let query = document.getElementById('search-playlist').value;
    document.querySelectorAll('.playlist').forEach(playlist => {
        playlist.classList.remove('hidden');
        if (!playlist.querySelector('.playlist-name').textContent.toLowerCase().includes(query.toLowerCase())) {
            playlist.classList.add('hidden');
        }
    });
})