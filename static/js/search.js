import { createProfileLink } from "./createProfileLink.js";
import * as pagination from './pagination.js';
import { getApiKey } from "./getApiKey.js";

createProfileLink();
var errorMessage = "";
var listOfMediaCards = [];
var listOfWatchedMediaCards = [];
var pages = [];
var watchedPages = [];
var templist = [];
var watchedMediaList = [];
var errorMessageDiv = document.getElementById('error-message');
let movieCount = 0, tvCount = 0;

function setErrorMessage(errorText) {
    let target = document.querySelector('.forms-cont');
    for (let i = 0; ; i++) {
        target = target.nextElementSibling;
        target.classList.add('hidden-result');
        if (target.nextElementSibling.id === "error-message")
            break;
    }
    errorMessageDiv.innerHTML = errorText;
    errorMessageDiv.style.display = "";
    document.querySelector('.spinner-border')?.remove();
}

function removeErrorMessage() { errorMessageDiv.style.display = "none"; }
removeErrorMessage();

document.querySelector('.app-name').addEventListener('click', () => window.open('/', "_self"));

var spinner = document.createElement('div');
spinner.classList.add("spinner-border", "spinner-margin");
spinner.role = "status";

document.getElementById('search-form-1').addEventListener('submit', function (event) {
    clearAllLists();
    actorInfoDiv.innerHTML = "";
    removeErrorMessage();
    event.preventDefault();
    window.open(`/actor?query=${encodeURIComponent(document.getElementById("search-actor-name").value)}`, "_self")
})

var prevMediaValueForComparison = "";

document.getElementById('search-form-2').addEventListener('submit', function (event) {
    clearAllLists();
    actorInfoDiv.innerHTML = "";
    removeErrorMessage();
    event.preventDefault();
    searchByCharacterName(null, document.getElementById("search-character-name").value, document.getElementById("search-media-name").value, null, null);
})

var actorInput = document.getElementById('search-actor-name');
var mediaInput = document.getElementById('search-media-name');
var actorToggleButton = document.getElementById('actor-toggle-button');
var characterToggleButton = document.getElementById('character-toggle-button');
var watchedMediaButton = document.getElementById('watched-media-button');
var allMediaButton = document.getElementById('all-media-button');

function clearToggle() {
    document.querySelectorAll('.toggle-button').forEach((button) => {
        button.classList.remove('selected-button');
    });
}

function clearMediaToggle() {
    document.querySelectorAll('.media-toggle-button').forEach((button) => {
        button.classList.remove('selected-button');
    });
}
document.querySelectorAll('.toggle-buttons-cont').forEach(cont =>
    cont.style.setProperty('--width', `${50}%`))

actorToggleButton.addEventListener('click', function () {
    actorToggleButton.parentElement.style.setProperty('--left', `${(parseFloat(actorToggleButton.dataset.whistBtn) / 2) * 100}%`);
    document.getElementById('search-form-1').classList.remove('hidden-form');
    document.getElementById('search-form-2').classList.add('hidden-form');
});

characterToggleButton.addEventListener('click', function () {
    characterToggleButton.parentElement.style.setProperty('--left', `${(parseFloat(characterToggleButton.dataset.whistBtn) / 2) * 100}%`);
    document.getElementById('search-form-2').classList.remove('hidden-form');
    document.getElementById('search-form-1').classList.add('hidden-form');
});

watchedMediaButton.addEventListener('click', function () {
    watchedMediaButton.parentElement.style.setProperty('--left', `${(parseFloat(watchedMediaButton.dataset.whistBtn) / 2) * 100}%`);
    document.getElementById('result').classList.add('hidden-result');
    document.getElementById('watched-result').classList.remove('hidden-result');
    document.querySelector('.all-toggle-buttons-cont').classList.add('hidden-result');
    document.querySelector('.watched-toggle-button-cont').classList.remove('hidden-result');
});

allMediaButton.addEventListener('click', function () {
    allMediaButton.parentElement.style.setProperty('--left', `${(parseFloat(allMediaButton.dataset.whistBtn) / 2) * 100}%`);
    document.getElementById('result').classList.remove('hidden-result');
    document.getElementById('watched-result').classList.add('hidden-result');
    document.querySelector('.all-toggle-buttons-cont').classList.remove('hidden-result');
    document.querySelector('.watched-toggle-button-cont').classList.add('hidden-result');
});

let actorDebounceTimeout;
let mediaDebounceTimeout;

actorInput.addEventListener('input', () => {
    clearTimeout(actorDebounceTimeout);
    actorDebounceTimeout = setTimeout(() => showActorOptions(actorInput.value), 300);
});

mediaInput.addEventListener('input', () => {
    clearTimeout(mediaDebounceTimeout);
    mediaDebounceTimeout = setTimeout(() => showMediaOptions(mediaInput.value), 300);
});

const modal = document.getElementById('exampleModal');
modal.addEventListener('show.bs.modal', function (event) {
    const trigger = event.relatedTarget;
    const actor = trigger.getAttribute('data-whist-actor');
    const media = trigger.getAttribute('data-whist-media');
    const character = trigger.getAttribute('data-whist-character');
    const idOfMedia = trigger.getAttribute('data-whist-media-id');
    const typeOfMedia = trigger.getAttribute('data-whist-media-type');

    modal.querySelector('.modal-body').innerHTML = ``;

    var content = document.createElement('h2');
    var imagesLink = document.createElement('a');
    var searchTerm = encodeURIComponent(`${actor} as ${character} in ${media}`);
    imagesLink.href = `https://www.google.com/search?tbm=isch&q=${searchTerm}`;
    imagesLink.textContent = `${character}`;
    imagesLink.target = '_blank';

    var mediaLink = document.createElement('a');
    mediaLink.href = `/${typeOfMedia}/${idOfMedia}-${media.toLowerCase().replaceAll(' ', '-')}`
    mediaLink.textContent = `${media}`;

    content.append(`${actor} plays `, imagesLink, ` in `, mediaLink);
    modal.querySelector('.modal-body').append(content);
});

var actorInfoDiv = document.getElementById('actor-info');

var resultDiv = document.getElementById('result');

var knowThemDiv = document.getElementById('know-them-from');

function getWeightedScore(avg, count, pop) {
    var countLog = Math.pow(Math.log(1 + count), 2);
    var popRoot = Math.sqrt(pop);
    // return ((avg * countLog) + popRoot);
    return (count);
}

function fillActorInfoDIv(profileImage, text, actorId) {
    actorInfoDiv.innerHTML = "";
    actorInfoDiv.classList.remove('hidden-info-div');
    knowThemDiv.innerHTML = "";
    var thisIs = document.createElement('div');
    thisIs.classList.add('this-is');

    var actorNameDiv = document.createElement('div');
    actorNameDiv.classList.add('actor-name');
    actorNameDiv.textContent = text;

    var actorBio = document.createElement('div');
    actorBio.classList.add('actor-bio');

    thisIs.append(actorBio);

    var readMore = document.createElement('a');
    readMore.classList.add('read-more');
    readMore.textContent = 'Read more...'
    readMore.setAttribute('data-bs-toggle', 'modal');
    readMore.setAttribute('data-bs-target', '#actor-modal');
    thisIs.append(readMore);

    actorInfoDiv.append(profileImage, thisIs);
}

async function searchByActorName(event, unencodedActorName, byChar = false, actorIDArg = null) {
    resultDiv.innerHTML = "";
    listOfMediaCards = [];
    await getWatchedMedia();
    document.getElementById('which-media').classList.remove('hidden-result');
    if (event) event.preventDefault();
    try {
        const auth = await getApiKey()
        const MY_API_KEY = await auth["api-key"];
        const MY_BEARER_TOKEN = await auth["bearer-token"];

        var actorID, actorFormalName;
        if (actorIDArg) {
            actorID = actorIDArg;
        }

        else {
            const actorName = encodeURIComponent(unencodedActorName);

            const actorIDResponse = await fetch(`https://api.themoviedb.org/3/search/person?query=${actorName}&include_adult=true&api_key=${MY_API_KEY}`);
            const actorIDResult = await actorIDResponse.json();
            actorID = actorIDResult['results'][0]['id'];
        }

        try {
            const actorMoviesResponse = await fetch(`https://api.themoviedb.org/3/person/${actorID}/combined_credits?api_key=${MY_API_KEY}`);
            const actorMoviesResult = await actorMoviesResponse.json();

            const actorResponse = await fetch(`https://api.themoviedb.org/3/person/${actorID}?api_key=${MY_API_KEY}`);
            const actorResult = await actorResponse.json();
            const imageAppend = actorResult['profile_path'];

            actorFormalName = actorResult['name'];

            document.title = actorFormalName;

            var profileImage = document.createElement('img');
            profileImage.src = imageAppend ? `https://image.tmdb.org/t/p/original/${imageAppend}` : `../static/images/no_image.jpg`;
            profileImage.setAttribute('loading', 'lazy');
            profileImage.classList.add('profile-image');

            byChar ? fillActorInfoDIv(profileImage, `Played by ${actorFormalName}`, actorID) : fillActorInfoDIv(profileImage, `This is ${actorFormalName}`, actorID);
            await fillActorBio(actorID);

            const mediaList = actorMoviesResult['cast'];
            const sortedMediaList = mediaList.sort((a, b) => b['vote_count'] - a['vote_count']);
            sortedMediaList.forEach(function (media) {
                if (
                    (media['title'] || media['name']) &&
                    (media['character'] !== "Self" && media['character'] &&
                        media['character'] !== "Self - Guest" &&
                        media['character'] !== "Self - Host" &&
                        media['character'].toLowerCase() !== "himself" &&
                        media['character'].toLowerCase() !== "herself" &&
                        (!media['genre_ids'].includes(10764)) &&
                        (!media['genre_ids'].includes(10767))
                    )
                ) {
                    var title = media['title'] || media['name'];
                    var character = media['character'];
                    var mediaIdforurl = media['id'];
                    var mediaTypeforurl = media['media_type'];

                    if (mediaTypeforurl === 'movie') movieCount++;
                    if (mediaTypeforurl === 'tv') tvCount++;

                    if (listOfMediaCards[listOfMediaCards.length - 1] &&
                        listOfMediaCards[listOfMediaCards.length - 1].querySelector('.media-title').textContent === title
                    ) { return; }

                    const mediaCard = document.createElement('div');
                    mediaCard.classList.add('media-template');
                    const attributes = {
                        "data-bs-toggle": "modal",
                        "data-bs-target": "#exampleModal",
                        "data-whist-media": `${title}`,
                        "data-whist-actor": `${actorFormalName}`,
                        "data-whist-character": `${character}`,
                        "data-whist-media-id": `${mediaIdforurl}`,
                        "data-whist-media-type": `${mediaTypeforurl}`
                    }

                    Object.entries(attributes).forEach(([key, value]) => mediaCard.setAttribute(key, value));

                    var mediaImage = document.createElement('img');
                    mediaImage.src = `https://image.tmdb.org/t/p/original/${media['poster_path']}`;
                    if (!media['poster_path'] || media['poster_path'] === "" || media['poster_path'] === null) {
                        mediaImage.src = "../static/images/no_image.jpg";
                        mediaImage.classList.add('no-media-image');
                    }
                    else
                        mediaImage.classList.add('media-image');
                    mediaImage.setAttribute('loading', 'lazy');

                    var mediaTitle = document.createElement('div');
                    mediaTitle.classList.add('media-title');
                    mediaTitle.textContent = `${title}`;

                    mediaCard.append(mediaImage, mediaTitle);
                    listOfMediaCards.push(mediaCard);


                    if (watchedMediaList.some(media => media.media_id === mediaIdforurl &&
                        media.media_type === (mediaTypeforurl === 'movie' ? 1 : 2)
                    )) {
                        listOfWatchedMediaCards.push(mediaCard.cloneNode(true));
                    }
                }
            });
            knowThemDiv.innerHTML = `${actorFormalName} has appeared in 
            ${movieCount} ${movieCount === 1 ? 'movie' : 'movies'} and
            ${tvCount} ${tvCount === 1 ? 'TV show' : 'TV shows'}.`

            fillAllPages();
            fillWatchedPages();
        } catch (err) {
            setErrorMessage("Could not find any movies or TV shows");
        }
    }
    catch (err) {
        setErrorMessage("Could not find actor!");
    }

}

async function searchByCharacterName(event, unencodedCharName, unencodedMediaName, mediaIdArg = null, mediaTypeArg = null) {
    if (event) event.preventDefault();
    resultDiv.innerHTML = "";
    try {
        const auth = await getApiKey()
        const MY_API_KEY = await auth["api-key"];
        const MY_BEARER_TOKEN = await auth["bearer-token"];
        if (unencodedCharName.trim().length === 0) { setErrorMessage("Please enter a character name!"); return; }
        const charName = encodeURIComponent(unencodedCharName);

        var mediaId, mediaType;
        if (mediaIdArg) { mediaId = mediaIdArg; mediaType = mediaTypeArg; }
        else {
            const mediaName = encodeURIComponent(unencodedMediaName);

            const mediaIDResponse = await fetch(`https://api.themoviedb.org/3/search/multi?query=${mediaName}&include_adult=true&api_key=${MY_API_KEY}`);
            const mediaIDResult = await mediaIDResponse.json();
            if (!mediaIDResult['results'][0]) { setErrorMessage("Could not find movie or TV show!"); return; }
            mediaId = mediaIDResult['results'][0]['id'];
            mediaType = mediaIDResult['results'][0]['media_type'];
        }

        try {
            var castListResponse = "";
            if (mediaType.toLowerCase() === 'tv')
                var castListResponse = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/aggregate_credits?api_key=${MY_API_KEY}`);
            else
                var castListResponse = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/credits?api_key=${MY_API_KEY}`);

            const castListResult = await castListResponse.json();
            var castList = castListResult['cast'];
            var actorName = "";
            var actorId = "";
            if (mediaType.toLowerCase() === 'tv') {
                outer: for (let i = 0; i < castList.length; i++) {
                    for (let j = 0; j < castList[i]['roles'].length; j++) {
                        if (castList[i]['roles'][j]['character'].toLowerCase().includes(unencodedCharName.toLowerCase())) {
                            actorName = castList[i]['name'];
                            actorId = castList[i]['id'];
                            break outer;
                        }
                    }
                }
            }
            else {
                for (let i = 0; i < castList.length; i++) {
                    if (castList[i]['character'].toLowerCase().includes(unencodedCharName.toLowerCase())) {
                        actorName = castList[i]['name'];
                        actorId = castList[i]['id'];
                        break;
                    }
                }
            }

            actorName ? window.open(`/actor/${actorId}-${actorName.toLowerCase().replaceAll(' ', '-')}`, "_self") : setErrorMessage("Character does not exist in this movie or TV show!");

        } catch (err) {
            setErrorMessage("Could not find cast list!");
        }

    } catch (err) {
        setErrorMessage("Could not find movie or TV show!");
    }
}

function clearOldLists() {
    var oldList = document.querySelectorAll(`div[data-whist-list-age=old]`)
    if (oldList.length !== 0) oldList.forEach((list) => {
        list.remove();
    });
}

function clearAllLists() {
    var lists = document.querySelectorAll('.option-list')
    lists.forEach((list) => list.remove());
}

async function showMediaOptions(query) {
    const inputDiv = document.querySelector('#media-list');
    var oldList = document.querySelectorAll(`.option-list`);
    if (oldList.length !== 0) oldList.forEach((list) => {
        list.setAttribute('data-whist-list-age', 'old');
    });

    var optionList = document.createElement('div');
    optionList.classList.add('option-list');
    optionList.classList.add('media-option-list');
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

            const mediaName = sortedOptionResults[i]['name'] || sortedOptionResults[i]['title'];
            const mediaId = sortedOptionResults[i]['id'];
            const mediaType = sortedOptionResults[i]['media_type']

            var option = document.createElement('div');
            option.classList.add('option');

            var optionImageDiv = document.createElement('div');
            optionImageDiv.classList.add('option-image-div');

            var optionTitleDiv = document.createElement('div');
            optionTitleDiv.classList.add('option-title-div');

            var optionImage = document.createElement('img');
            optionImage.classList.add('option-image');
            optionImage.src = sortedOptionResults[i]['poster_path'] ? `https://image.tmdb.org/t/p/w300/${sortedOptionResults[i]['poster_path']}` : `../static/images/no_image.jpg`;

            optionTitleDiv.textContent = `${sortedOptionResults[i]['name'] || sortedOptionResults[i]['title']}`;

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

            option.addEventListener('click', () => selectThisMediaOption(mediaName, mediaId, mediaType));

            optionList.append(option);
        }

        inputDiv.append(optionList);
        clearOldLists();
    } catch (error) {
    }
}

async function showActorOptions(query) {
    const inputDiv = document.querySelector('#actor-list');
    var oldList = document.querySelectorAll(`.option-list`);
    if (oldList.length !== 0) oldList.forEach((list) => {
        list.setAttribute('data-whist-list-age', 'old');
    });

    var optionList = document.createElement('div');
    optionList.classList.add('option-list');
    optionList.classList.add('actor-option-list');
    optionList.setAttribute('data-whist-list-age', 'new');

    try {
        const auth = await getApiKey()
        const MY_API_KEY = await auth["api-key"];
        const MY_BEARER_TOKEN = await auth["bearer-token"];

        const response = await fetch(`https://api.themoviedb.org/3/search/person?query=${query}&api_key=${MY_API_KEY}`);
        const result = await response.json();

        var actorOptions = [];
        var optionResults = result['results'];
        var sortedActorOptionResults = optionResults.sort((a, b) => b['popularity'] - a['popularity']);
        for (let i = 0; i < Math.min(5, sortedActorOptionResults.length); i++) {
            actorOptions.push(sortedActorOptionResults[i]['name'] || sortedActorOptionResults[i]['original_name'])
            const actorName = sortedActorOptionResults[i]['name'] || sortedActorOptionResults[i]['original_name'];
            const actorId = sortedActorOptionResults[i]['id'];

            var option = document.createElement('div');
            option.classList.add('option');

            var optionImageDiv = document.createElement('div');
            optionImageDiv.classList.add('option-image-div');

            var optionTitleDiv = document.createElement('div');
            optionTitleDiv.classList.add('option-title-div');

            var optionImage = document.createElement('img');
            optionImage.classList.add('option-image');
            optionImage.src = sortedActorOptionResults[i]['profile_path'] ? `https://image.tmdb.org/t/p/w300/${sortedActorOptionResults[i]['profile_path']}` : `../static/images/no_image.jpg`;

            optionTitleDiv.textContent = `${sortedActorOptionResults[i]['name'] || sortedActorOptionResults[i]['original_name']}`;

            optionImageDiv.append(optionImage);
            option.append(optionImageDiv);
            option.append(optionTitleDiv);

            option.addEventListener('click', () => selectThisActorOption(actorName, actorId));

            optionList.append(option);
        }

        inputDiv.append(optionList);
        clearOldLists();
    } catch (error) {
    }
}

function selectThisActorOption(actorNameArg, actorIDArg) {
    actorInfoDiv.innerHTML = "";
    removeErrorMessage();
    actorInput.value = actorNameArg;
    window.open(`/actor/${actorIDArg}-${actorNameArg.toLowerCase().replaceAll(' ', '-')}`, "_self");
    clearAllLists();
}

function selectThisMediaOption(mediaNameArg, mediaIDArg, mediaTypeArg) {
    mediaInput.setAttribute('media-id', mediaIDArg);
    mediaInput.setAttribute('media-type', mediaTypeArg);
    actorInfoDiv.innerHTML = "";
    removeErrorMessage();
    mediaInput.value = mediaNameArg;
    prevMediaValueForComparison = document.getElementById("search-media-name").value;
    searchByCharacterName(null, document.getElementById('search-character-name').value, mediaNameArg, mediaIDArg, mediaTypeArg);
    clearAllLists();
}


function main() {
    const path = window.location.pathname.split('/');
    if (path.length === 2) {
        const params = new URLSearchParams(window.location.search);
        if (params.size === 0)
            document.querySelector('.spinner-border').remove();
        else
            searchByActorName(null, params.get('query'), false, null)
    }
    else {
        if (path[2].indexOf('-') < 0) path[2] += '-';
        searchByActorName(null, path[2].slice(path[2].indexOf('-') + 1).replaceAll('-', ' '), false, path[2].slice(0, path[2].indexOf('-')))
    }
}

main();


async function fillActorBio(actorId) {
    const auth = await getApiKey()
    const MY_API_KEY = await auth["api-key"];
    const MY_BEARER_TOKEN = await auth["bearer-token"];
    try {
        const actorBioResponse = await fetch(`https://api.themoviedb.org/3/person/${actorId}?api_key=${MY_API_KEY}`);
        const actorBioResult = await actorBioResponse.json();
        var bio = actorBioResult['biography'];
        var actorNameForModal = actorBioResult['name'] || "";
        var actorImageForModal = actorBioResult['profile_path'] ? `https://image.tmdb.org/t/p/original/${actorBioResult['profile_path']}` : `../static/images/no_image.jpg`;

        document.querySelector('.actor-modal-info').textContent = bio;
        document.querySelector('.actor-bio').textContent = bio;
        document.querySelector('.actor-modal-image').src = actorImageForModal;
        document.getElementById('actor-exampleModalLabel').textContent = actorNameForModal;

        document.querySelector('.spinner-border').remove();

    } catch (err) {
    }
}


async function getWatchedMedia() {
    try {
        const watchedMediaResponse = await fetch("/watched-media", {
            method: "Get",
            credentials: 'include',
        });
        const watchedMediaResult = await watchedMediaResponse.json();
        if (watchedMediaResponse.ok) {
            watchedMediaList = watchedMediaResult['media'];
        }
        else {
        }
    } catch (error) {
        setErrorMessage("Server Error");
    }
}

function fillWatchedPages() {
    if (listOfWatchedMediaCards.length === 0) {
        const noMovies = document.createElement('div');
        noMovies.classList.add('no-watched-movies');
        if (Cookies.get('userInfo')) {
            noMovies.textContent = 'You have not seen any of their movies or TV shows!';
        }
        else {
            noMovies.innerHTML = "You need to be signed in to access media seen by you!<br/>Please see 'all media'";
        }
        document.querySelector('.watched-result').append(noMovies);
        return;
    }
    pagination.segregatePages(listOfWatchedMediaCards, watchedPages, 40);
    pagination.addToggleButtons(document.querySelector('.watched-toggle-button-cont'), watchedPages, document.getElementById('know-them-from'), document.querySelector('.watched-result'));
    pagination.displayPage(1, watchedPages, document.querySelector('.watched-result'));
}

function fillAllPages() {
    pagination.segregatePages(listOfMediaCards, pages, 40);
    pagination.addToggleButtons(document.querySelector('.all-toggle-buttons-cont'), pages, document.getElementById('know-them-from'), document.getElementById('result'));
    pagination.displayPage(1, pages, document.getElementById('result'));
}