import { createProfileLink } from "./createProfileLink.js";
import * as pagination from './pagination.js';

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

function setErrorMessage(errorText){
    // actorInfoDiv.innerHTML = "";
    // resultDiv.innerHTML = "";
    let target = document.querySelector('.forms-cont');
    for(let i=0;;i++){
        target = target.nextElementSibling;
        // console.log(target);
        // target.innerHTML = "";
        target.classList.add('hidden-result');
        if(target.nextElementSibling.id === "error-message")
            break;
    }
    errorMessageDiv.innerHTML = errorText;
    errorMessageDiv.style.display = "";
    document.querySelector('.spinner-border')?.remove();
}

function removeErrorMessage() {errorMessageDiv.style.display = "none";}
removeErrorMessage();

document.querySelector('.app-name').addEventListener('click',() => window.open('/',"_self"));

async function getApiKey() {
    try
    {const apikeyResponse = await fetch("http://localhost:3000/api-key");
    const apiResult = await apikeyResponse.json();
    const MY_API_KEY = apiResult['api_key'];
    const MY_BEARER_TOKEN = apiResult['bearer_token'];
    return {
        "api-key" : MY_API_KEY,
        "bearer-token": MY_BEARER_TOKEN
    }}
    catch(err) {
        console.error("API key fetch error:", err);
        setErrorMessage("Could not fetch API key :(")
    }
}

var spinner = document.createElement('div');
spinner.classList.add("spinner-border","spinner-margin");
spinner.role = "status";

document.getElementById('search-form-1').addEventListener('submit',function(event){
    clearAllLists();
    actorInfoDiv.innerHTML = "";
    // actorInfoDiv.append(spinner);
    removeErrorMessage();
    // searchByActorName(event,document.getElementById("search-actor-name").value)
    event.preventDefault();
    // window.open(`search?name=${document.getElementById("search-actor-name").value}`,'_self');
    window.open(`/actor?query=${encodeURIComponent(document.getElementById("search-actor-name").value)}`,"_self")
})

var prevMediaValueForComparison = "";

document.getElementById('search-form-2').addEventListener('submit',function(event){
    clearAllLists();
    actorInfoDiv.innerHTML = "";
    // actorInfoDiv.append(spinner);
    removeErrorMessage();
    event.preventDefault();
    // sendToPrint(`${document.getElementById("character-name").value} in ${document.getElementById("movie-name").value}`);
    // if(document.getElementById("search-media-name").value === prevMediaValueForComparison && document.getElementById("search-media-name").getAttribute('media-id'))
    //     // searchByCharacterName(event,document.getElementById("search-character-name").value,document.getElementById("search-media-name").value,document.getElementById("search-media-name").getAttribute('media-id'),document.getElementById("search-media-name").getAttribute('media-type'));
    //     window.open(`search.html?charName=${document.getElementById("search-character-name").value}&mediaName=${document.getElementById("search-media-name").value}&mediaID=${document.getElementById("search-media-name").getAttribute('media-id')}&mediaType=${document.getElementById("search-media-name").getAttribute('media-type')}`,'_self');
    // else{
    //     document.getElementById("search-media-name").removeAttribute('media-id');
    //     document.getElementById("search-media-name").removeAttribute('media-type');
        // searchByCharacterName(event,document.getElementById("search-character-name").value,document.getElementById("search-media-name").value)
        // window.open(`search?charName=${document.getElementById("search-character-name").value}&mediaName=${document.getElementById("search-media-name").value}`,'_self');
    // }
    // prevMediaValueForComparison = document.getElementById("search-media-name").value;
    searchByCharacterName(null,document.getElementById("search-character-name").value,document.getElementById("search-media-name").value,null,null);
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

function clearMediaToggle(){
    document.querySelectorAll('.media-toggle-button').forEach((button) => {
        button.classList.remove('selected-button');
    });
}

actorToggleButton.addEventListener('click',function(){
    clearToggle();
    actorToggleButton.classList.add('selected-button');
    document.getElementById('search-form-1').classList.remove('hidden-form');
    document.getElementById('search-form-2').classList.add('hidden-form');
});

characterToggleButton.addEventListener('click',function(){
    clearToggle();
    characterToggleButton.classList.add('selected-button');
    document.getElementById('search-form-2').classList.remove('hidden-form');
    document.getElementById('search-form-1').classList.add('hidden-form');
});

watchedMediaButton.addEventListener('click',function(){
    clearMediaToggle();
    watchedMediaButton.classList.add('selected-button');
    document.getElementById('result').classList.add('hidden-result');
    document.getElementById('watched-result').classList.remove('hidden-result');
    document.querySelector('.all-toggle-buttons-cont').classList.add('hidden-result');
    document.querySelector('.watched-toggle-button-cont').classList.remove('hidden-result');
});

allMediaButton.addEventListener('click',function(){
    clearMediaToggle();
    allMediaButton.classList.add('selected-button');
    document.getElementById('result').classList.remove('hidden-result');
    document.getElementById('watched-result').classList.add('hidden-result');
    document.querySelector('.all-toggle-buttons-cont').classList.remove('hidden-result');
    document.querySelector('.watched-toggle-button-cont').classList.add('hidden-result');
});

// document.querySelectorAll('.toggle-button').forEach((button) => {
//     button.addEventListener('click',()=>{
//         clearToggle();
//         button.classList.add('selected-button');
//         if(button.id==="actor-toggle-button"){
//             document.getElementById('search-form-1').classList
//         }
//     })
// })
let actorDebounceTimeout;
let mediaDebounceTimeout;

actorInput.addEventListener('input',() => {
    clearTimeout(actorDebounceTimeout);
    actorDebounceTimeout = setTimeout(() => showActorOptions(actorInput.value),300);
});

mediaInput.addEventListener('input',() => {
    clearTimeout(mediaDebounceTimeout);
    mediaDebounceTimeout = setTimeout(() => showMediaOptions(mediaInput.value),300);
});

// mediaInput.addEventListener('blur', () => {
//     setTimeout(() => {
//             clearAllLists();
//     }, 300); // Delay to allow click event on options
// });

// actorInput.addEventListener('blur', () => {
//     setTimeout(() => {
//             clearAllLists();
//     }, 300); // Delay to allow click event on options
// });

const modal = document.getElementById('exampleModal');
modal.addEventListener('show.bs.modal', function(event){
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
    // imagesLink.textContent = 'Photos';
    imagesLink.textContent = `${character}`;
    imagesLink.target = '_blank';

    var mediaLink = document.createElement('a');
    // mediaLink.href = `main?mediaName=${media}&mediaId=${idOfMedia}&mediaType=${typeOfMedia}`;
    mediaLink.href = `/${typeOfMedia}/${idOfMedia}-${media.toLowerCase().replaceAll(' ','-')}`
    mediaLink.textContent = `${media}`;
    // mediaLink.target = '_blank';

    content.append(`${actor} plays `,imagesLink,` in `,mediaLink);
    // modal.querySelector('.modal-body').append(document.createElement('br'),imagesLink);
    modal.querySelector('.modal-body').append(content);

})

var actorInfoDiv = document.getElementById('actor-info');

var resultDiv = document.getElementById('result');

var knowThemDiv = document.getElementById('know-them-from');

function sendToPrint(text)
{console.log(text)}

function getWeightedScore(avg,count,pop)
{
    var countLog = Math.pow(Math.log(1+count),2);
    var popRoot = Math.sqrt(pop);
    // return ((avg * countLog) + popRoot);
    return (count);
}

function fillActorInfoDIv(profileImage, text, actorId){
    actorInfoDiv.innerHTML = "";
    actorInfoDiv.classList.remove('hidden-info-div');
    knowThemDiv.innerHTML = "";
    // actorInfoDiv.innerHTML = text;
    // actorInfoDiv.append(profileImage);

    // actorInfoDiv.innerHTML += `<br><h2> You may know them from: </h2>`
    var thisIs = document.createElement('div');
    thisIs.classList.add('this-is');

    var actorNameDiv = document.createElement('div');
    actorNameDiv.classList.add('actor-name');
    actorNameDiv.textContent = text;
    
    var actorBio = document.createElement('div');
    actorBio.classList.add('actor-bio');


    thisIs.append(actorNameDiv, actorBio);

    var readMore = document.createElement('a');
    readMore.classList.add('read-more');
    readMore.textContent = 'Read more...'
    readMore.setAttribute('data-bs-toggle','modal');
    readMore.setAttribute('data-bs-target','#actor-modal');
    thisIs.append(readMore);

    actorInfoDiv.append(profileImage,thisIs);
}

async function searchByActorName(event,unencodedActorName,byChar=false,actorIDArg=null) {
    resultDiv.innerHTML = "";
    listOfMediaCards = [];
    await getWatchedMedia();
    document.getElementById('which-media').classList.remove('hidden-result');
    // console.log(watchedMediaList);
    if(event) event.preventDefault();
    try{
        const auth = await getApiKey()
        const MY_API_KEY = await auth["api-key"];
        const MY_BEARER_TOKEN = await auth["bearer-token"];

        var actorID,actorFormalName;
        if(actorIDArg){ actorID = actorIDArg; 
            // actorFormalName=unencodedActorName;
        }

        else{
        const actorName = encodeURIComponent(unencodedActorName);

        const actorIDResponse = await fetch(`https://api.themoviedb.org/3/search/person?query=${actorName}&include_adult=true&api_key=${MY_API_KEY}`);
        const actorIDResult = await actorIDResponse.json();
        console.log(actorIDResult);
        actorID = actorIDResult['results'][0]['id'];
        // actorFormalName = actorIDResult['results'][0]['name'];
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
            profileImage.src = imageAppend ?  `https://image.tmdb.org/t/p/original/${imageAppend}`:`../static/images/no_image.jpg`;
            profileImage.width = '80';
            profileImage.setAttribute('loading','lazy');
            profileImage.classList.add('profile-image');

            // console.log(profileImage);

            byChar ? fillActorInfoDIv(profileImage,`Played by ${actorFormalName}`,actorID):fillActorInfoDIv(profileImage,`This is ${actorFormalName}`,actorID);
            await fillActorBio(actorID);

            // actorInfoDiv.innerHTML = "";
            // actorInfoDiv.innerHTML = `This is ${actorIDResult['results'][0]['name']}: `;
            // actorInfoDiv.append(profileImage);

            // console.log(actorMoviesResult);
            const mediaList = actorMoviesResult['cast'];
            // const sortedMediaList = mediaList.sort((a,b) => getWeightedScore(b['vote_avergae'],b['vote_count'],b['popularity'])-getWeightedScore(a['vote_avergae'],a['vote_count'],a['popularity']));
            const sortedMediaList = mediaList.sort((a,b) => b['vote_count'] - a['vote_count']);
            // console.log(sortedMediaList);
            sortedMediaList.forEach(function(media){
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
                )
                    {
                        // console.log(media['title'] || media['name'])
                        var title = media['title'] || media['name'];
                        var character = media['character'];
                        var mediaIdforurl = media['id'];
                        var mediaTypeforurl = media['media_type'];

                        if(mediaTypeforurl === 'movie') movieCount++;
                        if(mediaTypeforurl === 'tv') tvCount++;

                        // ADD DATA-WHIST AND MODAL AND EVERYTHING

                        // if(resultDiv.lastElementChild &&
                        //     resultDiv.lastElementChild.querySelector('.media-title').textContent === title
                        // )
                        if(listOfMediaCards[listOfMediaCards.length-1] && 
                            listOfMediaCards[listOfMediaCards.length-1].querySelector('.media-title').textContent === title
                        )
                        {return;}

                        const mediaCard = document.createElement('div');
                        mediaCard.classList.add('media-template');
                        const attributes = {
                            "data-bs-toggle":"modal", 
                            "data-bs-target":"#exampleModal", 
                            "data-whist-media":`${title}`, 
                            "data-whist-actor":`${actorFormalName}`, 
                            "data-whist-character":`${character}`,
                            "data-whist-media-id":`${mediaIdforurl}`,
                            "data-whist-media-type":`${mediaTypeforurl}`
                        }

                        Object.entries(attributes).forEach(([key, value]) => mediaCard.setAttribute(key, value));

                        var mediaImage = document.createElement('img');
                        mediaImage.src = `https://image.tmdb.org/t/p/original/${media['poster_path']}`;
                        if(!media['poster_path'] || media['poster_path']==="" || media['poster_path']===null)
                        {
                            mediaImage.src = "../static/images/no_image.jpg";
                            mediaImage.classList.add('no-media-image');    
                        }
                        else    
                            mediaImage.classList.add('media-image');
                        mediaImage.setAttribute('loading','lazy');

                        var mediaTitle = document.createElement('div');
                        mediaTitle.classList.add('media-title');
                        mediaTitle.textContent = `${title}`;

                        mediaCard.append(mediaImage,mediaTitle);
                        listOfMediaCards.push(mediaCard);

                        
                        if(watchedMediaList.some(media => media.media_id === mediaIdforurl &&
                                                            media.media_type === (mediaTypeforurl==='movie'?1:2)
                        )){
                            listOfWatchedMediaCards.push(mediaCard.cloneNode(true));
                        }
                        // resultDiv.append(mediaCard);
                    }
            });
            // console.log(listOfWatchedMediaCards);
            // segregatePages();
            knowThemDiv.innerHTML = `${actorFormalName} has appeared in 
            ${movieCount} ${movieCount === 1 ? 'movie' : 'movies'} and
            ${tvCount} ${tvCount === 1 ? 'TV show' : 'TV shows'}.`

            fillAllPages();
            fillWatchedPages();
        } catch (err) {
            console.error("known for fetch error: ",err);
            setErrorMessage("Could not find any movies or TV shows");
        }
    }
    catch(err){
        console.error("id fetch error:", err);
        setErrorMessage("Could not find actor!");
    }
    
}

async function searchByCharacterName(event,unencodedCharName, unencodedMediaName, mediaIdArg=null, mediaTypeArg=null) {
    if(event) event.preventDefault();
    resultDiv.innerHTML = "";
    try {
        const auth = await getApiKey()
        const MY_API_KEY = await auth["api-key"];
        const MY_BEARER_TOKEN = await auth["bearer-token"];
        if(unencodedCharName.trim().length === 0) {setErrorMessage("Please enter a character name!"); return;}
        const charName = encodeURIComponent(unencodedCharName);

        var mediaId, mediaType;
        if(mediaIdArg) {mediaId = mediaIdArg; mediaType=mediaTypeArg;}
        else{
            const mediaName = encodeURIComponent(unencodedMediaName);

        const mediaIDResponse = await fetch(`https://api.themoviedb.org/3/search/multi?query=${mediaName}&include_adult=true&api_key=${MY_API_KEY}`);
        const mediaIDResult = await mediaIDResponse.json();
        console.log(mediaIDResult) //media id result
        if(!mediaIDResult['results'][0]) { setErrorMessage("Could not find movie or TV show!"); return;}
        mediaId = mediaIDResult['results'][0]['id'];
        mediaType = mediaIDResult['results'][0]['media_type'];
        }

        
        try {
            var castListResponse = ""
            // if(mediaIDResult['results'][0]['media_type'].toLowerCase() === 'tv')
            //     var castListResponse = await fetch(`https://api.themoviedb.org/3/${mediaIDResult['results'][0]['media_type']}/${mediaIDResult['results'][0]['id']}/aggregate_credits?api_key=${MY_API_KEY}`);
            // else
            //     var castListResponse = await fetch(`https://api.themoviedb.org/3/${mediaIDResult['results'][0]['media_type']}/${mediaIDResult['results'][0]['id']}/credits?api_key=${MY_API_KEY}`);
            
                if(mediaType.toLowerCase() === 'tv')
                    var castListResponse = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/aggregate_credits?api_key=${MY_API_KEY}`);
                else
                    var castListResponse = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/credits?api_key=${MY_API_KEY}`);

                const castListResult = await castListResponse.json();
            console.log(castListResult); //cast list result

            var castList = castListResult['cast'];
            var actorName = "";
            var actorId = "";
            if(mediaType.toLowerCase() === 'tv')
            {
                outer: for(let i=0;i<castList.length;i++){
                    for(let j=0;j<castList[i]['roles'].length;j++){
                        if(castList[i]['roles'][j]['character'].toLowerCase().includes(unencodedCharName.toLowerCase()))
                        {
                            actorName = castList[i]['name'];
                            actorId = castList[i]['id'];
                            break outer;
                        }
                    }
                }
            }
            else{
                for(let i=0;i<castList.length;i++){
                        if(castList[i]['character'].toLowerCase().includes(unencodedCharName.toLowerCase()))
                        {
                            actorName = castList[i]['name'];
                            actorId = castList[i]['id'];
                            break;
                        }
                    }
                }

            if(actorName) console.log(unencodedCharName, "is played by ", actorName); else console.log('not found')
            // actorName ? searchByActorName(event,actorName,true,actorId) : setErrorMessage("Character does not exist in this movie or TV show!");
            actorName ? window.open(`/actor/${actorId}-${actorName.toLowerCase().replaceAll(' ','-')}`,"_self") : setErrorMessage("Character does not exist in this movie or TV show!");

        } catch (err) {
            console.error("Cast list fetch error: ",err)
            setErrorMessage("Could not find cast list!");
        }

    } catch (err) {
        console.error("Media ID fetch error: ",err);
        setErrorMessage("Could not find movie or TV show!");
    }
}

function clearOldLists(){
    var oldList = document.querySelectorAll(`div[data-whist-list-age=old]`)
    // console.log(oldList);
    if(oldList.length !== 0) oldList.forEach((list) => {
        list.remove();
    });
}

function clearAllLists(){
    var lists = document.querySelectorAll('.option-list')
    lists.forEach((list)=>list.remove());
}

async function showMediaOptions(query){
    const inputDiv = document.querySelector('#media-list');
    var oldList = document.querySelectorAll(`.option-list`);
    // console.log(oldList);
    if(oldList.length !== 0) oldList.forEach((list) => {
        list.setAttribute('data-whist-list-age','old');
    });

    var optionList = document.createElement('div');
    optionList.classList.add('option-list');
    optionList.classList.add('media-option-list');
    optionList.setAttribute('data-whist-list-age','new');

    try {
        const auth = await getApiKey()
        const MY_API_KEY = await auth["api-key"];
        const MY_BEARER_TOKEN = await auth["bearer-token"];

        const url = `https://api.themoviedb.org/3/search/multi?query=${query}&api_key=${MY_API_KEY}`;
        const response = await fetch(url);
        const result = await response.json();

        var mediaOptions = [];
        var optionResults = result['results'];
        var sortedOptionResults = optionResults.sort((a,b) => b['vote_count'] - a['vote_count']);
        for(let i=0;i<Math.min(5, sortedOptionResults.length);i++)
        {
            if(sortedOptionResults[i]['media_type'] !== "movie" && sortedOptionResults[i]['media_type'] !== "tv") continue;
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
            optionImage.src = sortedOptionResults[i]['poster_path'] ? `https://image.tmdb.org/t/p/w300/${sortedOptionResults[i]['poster_path']}`:`../static/images/no_image.jpg`;

            optionTitleDiv.textContent = `${sortedOptionResults[i]['name'] || sortedOptionResults[i]['title']}`;

            // optionTitleDiv.textContent += sortedOptionResults[i]['release_date'] ? ` (${sortedOptionResults[i]['release_date'].substring(0,4)})` : " (?)";

            if(sortedOptionResults[i]['release_date'])
            {
                optionTitleDiv.textContent += ` (${sortedOptionResults[i]['release_date'].substring(0,4)})`;
            }
            else
            {
                if(sortedOptionResults[i]['first_air_date'])
                {
                    optionTitleDiv.textContent += ` (${sortedOptionResults[i]['first_air_date'].substring(0,4)})`;
                }
                else
                {
                    optionTitleDiv.textContent += ` (?)`;
                }
            }

            optionImageDiv.append(optionImage);
            option.append(optionImageDiv);
            option.append(optionTitleDiv);
            // option.textContent = `${result['results'][i]['name'] || result['results'][i]['title']}`;
            
            option.addEventListener('click',() => selectThisMediaOption(mediaName,mediaId,mediaType));

            optionList.append(option);
        }

        inputDiv.append(optionList);
        console.log(mediaOptions);
        clearOldLists();
    } catch (error) {
        console.error("there has been an error: ",error);
    }
    // console.log(query);
}

async function showActorOptions(query){
    const inputDiv = document.querySelector('#actor-list');
    var oldList = document.querySelectorAll(`.option-list`);
    // console.log(oldList);
    if(oldList.length !== 0) oldList.forEach((list) => {
        list.setAttribute('data-whist-list-age','old');
    });

    var optionList = document.createElement('div');
    optionList.classList.add('option-list');
    optionList.classList.add('actor-option-list');
    optionList.setAttribute('data-whist-list-age','new');

    try {
        const auth = await getApiKey()
        const MY_API_KEY = await auth["api-key"];
        const MY_BEARER_TOKEN = await auth["bearer-token"];

        const response = await fetch(`https://api.themoviedb.org/3/search/person?query=${query}&api_key=${MY_API_KEY}`);
        const result = await response.json();

        var actorOptions = [];
        var optionResults = result['results'];
        var sortedActorOptionResults = optionResults.sort((a,b) => b['popularity'] - a['popularity']);
        for(let i=0;i<Math.min(5, sortedActorOptionResults.length);i++)
        {
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
            optionImage.src = sortedActorOptionResults[i]['profile_path'] ? `https://image.tmdb.org/t/p/w300/${sortedActorOptionResults[i]['profile_path']}`:`../static/images/no_image.jpg`;

            // const posterPath = sortedOptionResults[i]['poster_path'] ? `https://image.tmdb.org/t/p/w300/${sortedOptionResults[i]['poster_path']}`:`../static/images/no_image.jpg`
            
            optionTitleDiv.textContent = `${sortedActorOptionResults[i]['name'] || sortedActorOptionResults[i]['original_name']}`;
            
            // const onlyTitle = `${sortedOptionResults[i]['name'] || sortedOptionResults[i]['title']}`
            // optionTitleDiv.textContent += sortedOptionResults[i]['release_date'] ? ` (${sortedOptionResults[i]['release_date'].substring(0,4)})` : " (?)";

            optionImageDiv.append(optionImage);
            option.append(optionImageDiv);
            option.append(optionTitleDiv);
            // option.textContent = `${result['results'][i]['name'] || result['results'][i]['title']}`;
            
            option.addEventListener('click',() => selectThisActorOption(actorName,actorId));

            optionList.append(option);
        }

        inputDiv.append(optionList);
        console.log(actorOptions);
        clearOldLists();
    } catch (error) {
        console.error("there has been an error: ",error);
    }
    // console.log(query);
}

function selectThisActorOption(actorNameArg, actorIDArg){
    actorInfoDiv.innerHTML = "";
    // actorInfoDiv.append(spinner);
    removeErrorMessage();
    console.log([actorIDArg,actorNameArg]);
    actorInput.value = actorNameArg;
    // searchByActorName(null,actorNameArg,false,actorIDArg);
    // window.open(`search?name=${actorNameArg}&id=${actorIDArg}`,'_self');
    window.open(`/actor/${actorIDArg}-${actorNameArg.toLowerCase().replaceAll(' ','-')}`,"_self");
    clearAllLists();
}

function selectThisMediaOption(mediaNameArg, mediaIDArg, mediaTypeArg){
    mediaInput.setAttribute('media-id',mediaIDArg);
    mediaInput.setAttribute('media-type',mediaTypeArg);
    actorInfoDiv.innerHTML = "";
    // actorInfoDiv.append(spinner);
    removeErrorMessage();
    console.log([mediaIDArg,mediaNameArg, mediaTypeArg]);
    mediaInput.value = mediaNameArg;
    prevMediaValueForComparison = document.getElementById("search-media-name").value;
    // searchByCharacterName(null,document.getElementById('search-character-name').value,mediaNameArg,mediaIDArg,mediaTypeArg);
    // window.open(`search?charName=${document.getElementById('search-character-name').value}&mediaName=${mediaNameArg}&mediaID=${mediaIDArg}&mediaType=${mediaTypeArg}`,'_self');
    searchByCharacterName(null,document.getElementById('search-character-name').value,mediaNameArg,mediaIDArg,mediaTypeArg);
    clearAllLists();
}

// const params = new URLSearchParams(window.location.search);

// const actorNameURL = params.get('name');
// const actorIDURL = params.get('id');
// const characterNameURL = params.get('charName');
// const mediaNameURL = params.get('mediaName');
// const mediaTypeURL = params.get('mediaType');
// const mediaIDURL = params.get('mediaID');

// console.log(actorNameURL, actorIDURL);
// if(actorNameURL!==null && actorIDURL)
//     searchByActorName(null,actorNameURL,false,actorIDURL);
// else if(actorNameURL!==null && !actorIDURL)
//     searchByActorName(null,actorNameURL,false,null);
// else if((characterNameURL || mediaNameURL) && mediaIDURL)
//     searchByCharacterName(null,characterNameURL,mediaNameURL,mediaIDURL,mediaTypeURL);
// else if((characterNameURL || mediaNameURL) && !mediaIDURL)
//     searchByCharacterName(null,characterNameURL,mediaNameURL,null,null);
// else if(characterNameURL!==null && mediaNameURL!==null)
//     searchByCharacterName(null,characterNameURL,mediaNameURL,null,null);

// if(params.size===0) 
//     // document.querySelector('.spinner-border').classList.add('hidden-spinner');
//     document.querySelector('.spinner-border').remove();

function main(){
    const path = window.location.pathname.split('/');
    console.log(path);
    // if(path[1] === 'search') {
    if(path.length === 2) {
        const params = new URLSearchParams(window.location.search);
        if(params.size===0)
            document.querySelector('.spinner-border').remove();
        else
            // findMovie(null,params.get('query'),null,null);
            searchByActorName(null,params.get('query'),false,null)
    }
    else {
        if(path[2].indexOf('-') < 0) path[2]+='-';
        console.log(path[2]);
        // findMovie(null,path[2].slice(path[2].indexOf('-')+1),path[2].slice(0,path[2].indexOf('-')),path[1]);
        searchByActorName(null,path[2].slice(path[2].indexOf('-')+1).replaceAll('-',' '),false,path[2].slice(0,path[2].indexOf('-')))
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

        // document.querySelector('.spinner-border').classList.add('hidden-spinner');
        document.querySelector('.spinner-border').remove();

    } catch (err) {
        console.error("Actor bio error: ",err)
    }
}


async function getWatchedMedia() {
    try {
        const watchedMediaResponse = await fetch("http://localhost:3000/watched-media",{
            method: "Get",
            credentials: 'include',
        });
        const watchedMediaResult = await watchedMediaResponse.json();
        if(watchedMediaResponse.ok){
            // console.log(watchedMediaResult);
            watchedMediaList = watchedMediaResult['media'];
            // console.log(watchedMediaList);
        }
        else{
            console.log(watchedMediaResult);
        }
    } catch (error) {
        console.error("server error: ",error);
        setErrorMessage("Server Error");
    }
}

function fillWatchedPages(){
    // listOfWatchedMediaCards.push()
    if(listOfWatchedMediaCards.length===0){
        const noMovies = document.createElement('div');
        noMovies.classList.add('no-watched-movies');
        if (Cookies.get('userInfo')) {
            noMovies.textContent = 'You have not seen any of their movies or TV shows!';
        }
        else{
            noMovies.innerHTML = "You need to be signed in to access media seen by you!<br/>Please see 'all media'";
        }
        document.querySelector('.watched-result').append(noMovies);
        return;
    }
    pagination.segregatePages(listOfWatchedMediaCards,watchedPages,40);
    pagination.addToggleButtons(document.querySelector('.watched-toggle-button-cont'),watchedPages,document.getElementById('know-them-from'),document.querySelector('.watched-result'));
    pagination.displayPage(1,watchedPages,document.querySelector('.watched-result'));
}

function fillAllPages(){
    pagination.segregatePages(listOfMediaCards,pages,40);
    pagination.addToggleButtons(document.querySelector('.all-toggle-buttons-cont'),pages,document.getElementById('know-them-from'),document.getElementById('result'));
    pagination.displayPage(1,pages,document.getElementById('result'));
}