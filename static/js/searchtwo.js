import { getApiKey } from "./getApiKey.js";
import { createProfileLink } from "./createProfileLink.js";
import { createList } from "./hardCodedOptionList.js";
import * as pagination from './pagination.js';

createProfileLink();
const auth = await getApiKey();
const MY_API_KEY = auth["api-key"];
const MY_BEARER_TOKEN = auth["bearer-token"];
const errorMessageDiv = document.getElementById('error-message');
let actorDebouceTimeout;
let actorsCredits = [];
let watchedMediaList = [];
let listOfMediaCards = [], listOfWatchedMediaCards = [];
let pages = [], watchedPages = [];
let movieCount = 0, tvCount = 0;

function setErrorMessage(errorText) {
    errorMessageDiv.innerHTML = errorText;
    errorMessageDiv.classList.remove('hidden');
    document.querySelector('.spinner-border').remove();
}

function removeErrorMessage() { errorMessageDiv.classList.add('hidden'); }
removeErrorMessage();

document.querySelector('.app-name').addEventListener('click', () => window.open('/', "_self"));

const params = new URLSearchParams(window.location.search);

if (params.size === 0) document.querySelector('.spinner-border').remove();

const actorNamesUrl = params.get('actorNames')?.split('_');
const actorIdsUrl = params.get('actorIds')?.split('_');

if (actorNamesUrl)
    document.title = actorNamesUrl.join(', ');

if (actorIdsUrl) main();

let numberOfInputs = 1;
const formCont = document.querySelector('.forms-cont');
const watchedMediaButton = document.getElementById('watched-media-button');
const allMediaButton = document.getElementById('all-media-button');
const modal = document.getElementById('exampleModal');

modal.addEventListener('show.bs.modal', async function (event) {
    const trigger = event.relatedTarget;
    const media = trigger.getAttribute('data-whist-media');
    const idOfMedia = trigger.getAttribute('data-whist-media-id');
    const typeOfMedia = trigger.getAttribute('data-whist-media-type');

    await fillCharacters(idOfMedia, typeOfMedia, media);
});

function addInput(name = null, id = null) {
    numberOfInputs++;
    const inputBox = document.createElement('div');
    inputBox.id = `search-form-${numberOfInputs}`;

    const divWithList = document.createElement('div');
    divWithList.className = 'div-with-list';
    divWithList.id = `actor-list-cont-${numberOfInputs}`;

    const actorInput = document.createElement('input');
    actorInput.setAttribute('type', 'text');
    actorInput.id = `actor-input-${numberOfInputs}`;
    actorInput.setAttribute('placeholder', `Actor name`);
    actorInput.setAttribute('autocomplete', 'off');

    if (name) {
        actorInput.value = name;
        actorInput.setAttribute('data-whist-actor-id', id);
    }

    actorInput.addEventListener('input', () => {
        clearTimeout(actorDebouceTimeout);
        actorDebouceTimeout = setTimeout(() => showActorOptions(actorInput.value, actorInput, divWithList), 100);
    });

    const addInputButton = document.createElement('button');
    addInputButton.classList.add('btn', 'add-more-inputs');

    const addInputIcon = document.createElement('i');
    addInputIcon.classList.add('bi', 'bi-plus-circle');

    addInputButton.addEventListener('click', () => {
        if (numberOfInputs < 4) {
            addInput()
        }
    });

    const removeInputButton = document.createElement('button');
    removeInputButton.classList.add('btn', 'remove-inputs');

    const removeInputIcon = document.createElement('i');
    removeInputIcon.classList.add('bi', 'bi-dash-circle');

    removeInputButton.addEventListener('click', () => {
        if (numberOfInputs > 1)
            removeInput(inputBox)
    });

    addInputButton.append(addInputIcon);
    removeInputButton.append(removeInputIcon);
    divWithList.append(actorInput);
    inputBox.append(removeInputButton, divWithList, addInputButton);

    formCont.append(inputBox);
}

function removeInput(element) {
    element.remove();
    numberOfInputs--;
}

document.querySelector('.add-more-inputs').addEventListener('click', () => {
    if (numberOfInputs < 4) {
        addInput()
    }
});

document.querySelector('.remove-inputs').addEventListener('click', () => {
    if (numberOfInputs > 1)
        removeInput(document.querySelector('#search-form-1'));
});

document.querySelector('#actor-input-1').addEventListener('input', () => {
    clearTimeout(actorDebouceTimeout);
    actorDebouceTimeout = setTimeout(() =>
        showActorOptions(
            document.querySelector('#actor-input-1').value,
            document.querySelector('#actor-input-1'),
            document.querySelector('#actor-list-cont-1'),
        ), 100);
});

if (actorIdsUrl)
    for (let i = 0; i < actorIdsUrl.length; i++) {
        if (i === 0) {
            document.querySelector('#actor-input-1').value = actorNamesUrl[i];
            document.querySelector('#actor-input-1').setAttribute('data-whist-actor-id', actorIdsUrl[i]);
        }
        else {
            addInput(actorNamesUrl[i], actorIdsUrl[i]);
        }
    }

document.getElementById('search-btn').addEventListener('click', () => {
    const inputs = Array.from(document.querySelectorAll('input')).map(input => {
        if (!input.value) return null
        if (!input.getAttribute('data-whist-actor-id')) return -1
        return { name: input.value, id: input.getAttribute('data-whist-actor-id') }
    });

    if (inputs.includes(null)) {
        setErrorMessage("Please fill all names!");
        return;
    }
    if (inputs.includes(-1)) {
        setErrorMessage("Please select an actor from the list only!");
        return;
    }
    for (let i = 0; i < inputs.length; i++) {
        for (let j = i + 1; j < inputs.length; j++) {
            if (inputs[i].id === inputs[j].id && inputs[i].name === inputs[j].name) {
                setErrorMessage("Please enter distinct actors!");
                return;
            }
        }
    }

    const actorNames = inputs.map(input => { return input.name }).join('_');
    const actorIds = inputs.map(input => { return input.id }).join('_');
    window.open(`/actor-group?actorNames=${encodeURIComponent(actorNames)}&actorIds=${encodeURIComponent(actorIds)}`, '_self');
});

document.querySelector('.toggle-buttons-cont').style.setProperty('--width', `${50}%`)

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

function clearMediaToggle() {
    document.querySelectorAll('.media-toggle-button').forEach((button) => {
        button.classList.remove('selected-button');
    });
}

async function showActorOptions(query, inputElement, listContElement) {
    var oldList = document.querySelectorAll(`.option-list`);
    if (oldList.length !== 0) oldList.forEach((list) => {
        list.setAttribute('data-whist-list-age', 'old');
    });
    var optionList = document.createElement('div');
    optionList.classList.add('option-list');
    optionList.classList.add('actor-option-list');
    optionList.setAttribute('data-whist-list-age', 'new');

    try {
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

            option.addEventListener('click', () => {
                inputElement.value = actorName;
                inputElement.setAttribute('data-whist-actor-id', actorId);
                clearAllLists();
            });

            optionList.append(option);
        }
        clearOldLists();
        listContElement.append(optionList);
    } catch (error) {
    }
}

function clearOldLists() {
    var oldList = document.querySelectorAll(`div[data-whist-list-age=old]`)
    if (oldList.length !== 0) oldList.forEach((list) => {
        list.remove();
    });
}

function clearAllLists() {
    var lists = document.querySelectorAll(`.option-list`)
    if (lists.length !== 0) lists.forEach((list) => {
        list.remove();
    });
}

async function getActorCredits(actorId) {
    let oneActorCredits = [];
    try {
        const actorMoviesResponse = await fetch(`https://api.themoviedb.org/3/person/${actorId}/combined_credits?api_key=${MY_API_KEY}`);
        const actorMoviesResult = await actorMoviesResponse.json();
        const mediaList = actorMoviesResult['cast'];
        const sortedMediaList = mediaList.sort((a, b) => b['vote_count'] - a['vote_count']);
        oneActorCredits = sortedMediaList.map(media => {
            if (
                (media['title'] || media['name']) &&
                (media['character'] !== "Self" && media['character'] &&
                    media['character'] !== "Self - Guest" &&
                    media['character'] !== "Self - Host" &&
                    media['character'].toLowerCase() !== "himself" &&
                    media['character'].toLowerCase() !== "herself" &&
                    (!media['genre_ids'].includes(10764)) &&
                    (!media['genre_ids'].includes(10767))
                ))
                return `${media['id']},${media['media_type']}`;
            else
                return null
        });
        actorsCredits.push(new Set(oneActorCredits));
    } catch (error) {
        setErrorMessage("Error fetching credits");
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

async function createMediaCards(id, type, index) {
    try {
        const mediaResponse = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${MY_API_KEY}`);
        const mediaResult = await mediaResponse.json();

        const title = mediaResult['name'] || mediaResult['title'];
        const posterPath = mediaResult['poster_path'] ? `https://image.tmdb.org/t/p/original/${mediaResult['poster_path']}` : "../static/images/no_image.jpg";

        if (type === 'movie') movieCount++;
        if (type === 'tv') tvCount++;
        const mediaCard = document.createElement('div');
        mediaCard.classList.add('media-template');
        const attributes = {
            "data-bs-toggle": "modal",
            "data-bs-target": "#exampleModal",
            "data-whist-media": `${title}`,
            "data-whist-media-id": `${id}`,
            "data-whist-media-type": `${type}`
        }
        Object.entries(attributes).forEach(([key, value]) => mediaCard.setAttribute(key, value));

        var mediaImage = document.createElement('img');
        mediaImage.src = posterPath;
        mediaImage.classList.add(mediaResult['poster_path'] ? 'media-image' : 'no-media-image');
        mediaImage.setAttribute('loading', 'lazy');

        var mediaTitle = document.createElement('div');
        mediaTitle.classList.add('media-title');
        mediaTitle.textContent = `${title}`;

        mediaCard.append(mediaImage, mediaTitle);
        listOfMediaCards[index] = mediaCard;

        if (
            watchedMediaList.some(media => media.media_id === parseInt(id) &&
                media.media_type === (type === 'movie' ? 1 : 2)
            )
        ) {
            listOfWatchedMediaCards[index] = mediaCard.cloneNode(true);
        }
    } catch (error) {
        setErrorMessage("Error displaying movies");
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
    pagination.addToggleButtons(document.querySelector('.watched-toggle-button-cont'),
        watchedPages,
        document.getElementById('know-them-from'),
        document.querySelector('.watched-result'));
    pagination.displayPage(1, watchedPages, document.querySelector('.watched-result'));
}

function fillAllPages() {
    pagination.segregatePages(listOfMediaCards, pages, 40);
    pagination.addToggleButtons(document.querySelector('.all-toggle-buttons-cont'),
        pages,
        document.getElementById('know-them-from'),
        document.getElementById('result'));
    pagination.displayPage(1, pages, document.getElementById('result'));
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve,ms));
}

async function main() {
    await Promise.all(actorIdsUrl.map(async id => await getActorCredits(id)));
    actorsCredits = [...actorsCredits.reduce((prev, next) => [...prev].filter((media) => next.has(media)))]
        .map(media => {
            if (media) {
                let split = media.split(',');
                return {
                    id: split[0],
                    type: split[1]
                }
            }
        })
        .filter(media => media)
        .sort((a, b) => b['vote_count'] - a['vote_count']);
    await getWatchedMedia();
    await Promise.all(actorsCredits.map(async (media, index) => {
        await createMediaCards(media.id, media.type, index)
    }));
    listOfWatchedMediaCards = listOfWatchedMediaCards.filter(Boolean);
    removeErrorMessage();
    document.querySelector('.spinner-border').remove();
    if (listOfMediaCards.length === 0) {
        const noMovies = document.createElement('div');
        noMovies.classList.add('no-watched-movies');
        noMovies.textContent = actorNamesUrl.join(", ") + " have not appeared in any movies or TV shows together!";
        document.querySelector('.watched-result').append(noMovies);
        return;
    }
    document.querySelector('.toggle-buttons-cont').classList.remove('hidden-result');
    if (actorNamesUrl.length > 1)
        document.getElementById('know-them-from').textContent = `${actorNamesUrl.splice(0, actorNamesUrl.length - 1).join(", ")} 
    and ${actorNamesUrl[actorNamesUrl.length - 1]}
    have appeared together in`;
    else
        document.getElementById('know-them-from').textContent = `${actorNamesUrl[0]} has appeared in`;
    document.getElementById('know-them-from').textContent += `
    ${movieCount} ${movieCount === 1 ? 'movie' : 'movies'} and
    ${tvCount} ${tvCount === 1 ? 'TV show' : 'TV shows'}.`;

    fillWatchedPages();
    fillAllPages();
}

async function fillCharacters(mediaId, mediaType, name) {
    modal.querySelectorAll('.modal-body').forEach(body => body.remove());
    const footer = document.querySelector('.modal-footer');
    const modalSpinner = document.createElement('div')
    modalSpinner.classList.add('spinner-border', 'text-dark');
    modalSpinner.style.margin = "auto";
    footer.insertAdjacentElement('beforebegin', modalSpinner);
    try {
        const creditsUrl = (mediaType === 'movie' ? 'credits' : 'aggregate_credits');
        const castResponse = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/${creditsUrl}?api_key=${MY_API_KEY}`);
        const castResult = await castResponse.json();
        const cast = castResult['cast'];
        const targetIds = new Set(actorIdsUrl);
        const matchingCast = cast.filter(actor => targetIds.has(actor['id'].toString()));
        modalSpinner.remove();
        matchingCast.forEach(actor => {
            const body = document.createElement('div');
            body.classList.add('modal-body');

            const actorLink = document.createElement('a');
            actorLink.href = `/actor/${actor['id']}-${(actor['name'] || actor['original_name']).toLowerCase().replaceAll(' ', '-')}`;
            actorLink.className = "modal-actor";
            actorLink.textContent = actor['name'] || actor['original_name'] || "";

            const charLink = document.createElement('a');

            charLink.className = "modal-character";
            if (mediaType === 'tv')
                charLink.textContent = actor['roles'].map(role => role['character'] || "").join(' / ');
            else
                charLink.textContent = actor['character'];
            const searchTerm = encodeURIComponent(`${actor['name'] || actor['original_name'] || ""} as ${charLink.textContent} in ${name}`);
            charLink.href = `https://www.google.com/search?tbm=isch&q=${searchTerm}`;
            charLink.target = "_blank";

            body.append(actorLink, " as ", charLink);
            footer.insertAdjacentElement('beforebegin', body);
        });
        const body = document.createElement('div');
        body.classList.add('modal-body', 'last-modal-body');

        const mediaLink = document.createElement('a');
        mediaLink.href = `/${mediaType}/${mediaId}-${name.toLowerCase().replaceAll(' ', '-')}`;
        mediaLink.className = "modal-actor";
        mediaLink.textContent = name;

        body.append(mediaLink);
        footer.insertAdjacentElement('beforebegin', body);
    }
    catch (error) {
    }
}