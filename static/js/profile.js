import * as pagination from './pagination.js';
import * as cards from './hardCodedCards.js';
import { getApiKey } from './getApiKey.js';
import { fillPlaylists } from './fillPlaylists.js';

if(!Cookies.get('userInfo')) window.open('/test',"_self");

const auth = await getApiKey();
const MY_API_KEY = auth['api-key'];
const MY_BEARER_TOKEN = auth['bearer-token'];

var successMessageDiv = document.querySelector('.successful');
successMessageDiv.style.setProperty('top',`-${successMessageDiv.clientHeight}px`);
var makingChanges = false;
let mediaList = [];
let listOfMediaCards = [];
let pages = [];
var pageToggleButtonCont = document.querySelector('.page-toggle-cont');
var pageCont = document.querySelector('.movies');
var scrollToElement = document.querySelector('.movie-watched-text');

function showMessageDiv(message){
    successMessageDiv.innerHTML = message;
    successMessageDiv.style.setProperty('left',`calc(50% - ${successMessageDiv.clientWidth/2}px)`);
    successMessageDiv.style.setProperty('transform',`translateY(calc(${innerHeight * 0.03}px + ${successMessageDiv.clientHeight}px))`);
    document.querySelector('.main-div').style.display='none';
    document.querySelector('.error-message').style.display='none';
    document.querySelector('.title-bar').style.display = 'none';
    setTimeout(()=>{
        window.open('/','_self');
    },1500);
}

function setErrorMessage(message){
    document.querySelector('.error-message').classList.remove('hidden-error');
    document.querySelector('.error-message').textContent = message;
}

function setUserErrorMessage(message){
    document.querySelector('.user-error-message').classList.remove('hidden-error');
    document.querySelector('.user-error-message').textContent = message;
}

document.querySelector('.app-name').addEventListener('click',() => window.open('/',"_self"));

document.getElementById('logout').addEventListener('click', async () => {
    try {
        const logoutResponse = await fetch('http://localhost:3000/logout',{
            method: 'GET',
            credentials: 'include'
        });

        const logoutresult = await logoutResponse.json();
        if(logoutResponse.ok){
            showMessageDiv("Log out successful! Redirecting...")
        }
        else{
            setErrorMessage("Something went wrong!");
        }
    } catch (error) {
        setErrorMessage('Something went wrong!');
        console.error(error);
    }
});

document.getElementById('confirm-delete').addEventListener('click', async () => {
    try {
        const deleteResponse = await fetch('http://localhost:3000/delete',{
            method: 'GET',
            credentials: 'include'
        });

        const deleteResult = await deleteResponse.json();
        if(deleteResponse.ok){
            showMessageDiv("Account deletion successful! Redirecting...")
        }
        else{
            setErrorMessage("Something went wrong!");
        }
    } catch (error) {
        setErrorMessage('Something went wrong!');
        console.error(error);
    }
});

const usernameInput = document.getElementById('username');
const firstNameInput = document.getElementById('first-name');
const lastNameInput = document.getElementById('last-name');

const editInfoBtn = document.getElementById('edit-info');
const saveChangesBtn = document.getElementById('save-changes');

async function getUserDetails() {
    try{
        const userDetailsResponse = await fetch("http://localhost:3000/user-details",{
            method: "GET",
            credentials: 'include',
        });
        const userDetailsResult = await userDetailsResponse.json();
        if(userDetailsResponse.ok){
            console.log(userDetailsResult.results);
            usernameInput.value = userDetailsResult.results[0].username;
            firstNameInput.value = userDetailsResult.results[0].first_name;
            lastNameInput.value = userDetailsResult.results[0].last_name;
        }
        else{
            console.error(userDetailsResult);
        }
    }
    catch(error){
        console.error("server error: ",error);
    }
}

getUserDetails();

editInfoBtn.addEventListener('click',() => {
    document.querySelectorAll('input').forEach((input)=>{input.disabled=false; input.classList.add('not-disabled');});
    makingChanges = true;
    editInfoBtn.classList.add('hidden');
    saveChangesBtn.classList.remove('hidden');
});

saveChangesBtn.addEventListener('click', async () => {
    try{
        const userDetailsResponse = await fetch("http://localhost:3000/update-user-details",{
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({username: usernameInput.value, firstName: firstNameInput.value, lastName: lastNameInput.value})
        });
        const userDetailsResult = await userDetailsResponse.json();
        if(userDetailsResponse.ok){
            console.log(userDetailsResult);
            window.open('/profile','_self');
        }
        else{
            console.error(userDetailsResult);
            setUserErrorMessage(userDetailsResult.message);
        }
    }
    catch(error){
        console.error("server error: ",error);
        setUserErrorMessage('Server Error :(');
    }
    // document.querySelectorAll('input').forEach((input)=>{input.disabled=true; input.classList.remove('not-disabled');});
    // makingChanges = false;
    // editInfoBtn.classList.remove('hidden');
    // saveChangesBtn.classList.add('hidden');
});

const mediaTitleOnHover = document.querySelector('.media-title-hover');
console.log(mediaTitleOnHover);
mediaTitleOnHover.classList.add('hidden');

function getElementPosition(card,title){
    // console.log(title.clientWidth);
    return{
        top: card.getBoundingClientRect().top + window.scrollY - title.clientHeight,
        left: card.getBoundingClientRect().left + window.scrollX + (card.clientWidth - title.clientWidth)/2
    }
}


function createTitleHovers(listOfMediaCards){
    listOfMediaCards.forEach((card) => {
        let cardtimeout;
        card.addEventListener('mouseenter',()=>{
            // card.querySelector('.media-title-hover').classList.remove('hidden');
            // card.querySelector('.media-title-hover').style.left = `calc(50% - ${card.querySelector('.media-title-hover').clientWidth/2}px)`;
            cardtimeout = setTimeout(()=>{
                mediaTitleOnHover.classList.remove('hidden');
                mediaTitleOnHover.innerHTML = card.getAttribute('data-whist-media')+`<br class="down-arrow"><i class="bi bi-caret-down-fill down-arrow-icon"></i>`;
                mediaTitleOnHover.style.top = `${getElementPosition(card,mediaTitleOnHover).top}px`;
                mediaTitleOnHover.style.left = `${getElementPosition(card,mediaTitleOnHover).left}px`;
            },500);
        });
        card.addEventListener('mouseleave',()=>{
            // card.querySelector('.media-title-hover').classList.add('hidden');
            clearInterval(cardtimeout);
            mediaTitleOnHover.classList.add('hidden');
        });
    });
}

async function getWatchedMedia() {
    try {
        const watchedMediaResponse = await fetch("http://localhost:3000/watched-media",{
            method: "Get",
            credentials: 'include',
        });
        const watchedMediaResult = await watchedMediaResponse.json();
        if(watchedMediaResponse.ok){
            console.log(watchedMediaResult);
            mediaList = watchedMediaResult['media'];
            console.log(mediaList);
        }
        else{
            console.log(watchedMediaResult);
        }
    } catch (error) {
        console.error("server error: ",error);
        setErrorMessage("Server Error");
    }
}

async function createMediaCards() {
    // for(let i=0;i<40;i++){
    //     listOfMediaCards.push(cards.createWhiplashCard());
    //     listOfMediaCards.push(cards.createUpCard());
    // }
    // createTitleHovers(listOfMediaCards);
    // console.log(mediaList);
    const fetchCards = mediaList.map(async (media) => {
        let mediaType = media['media_type']===1 ? 'movie':'tv';
        let mediaID = media['media_id']
        try {
            const mediaResponse = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaID}?api_key=${MY_API_KEY}`);
            const mediaResult = await mediaResponse.json();
            const mediaName = mediaResult['title'] || mediaResult['name'];
            const posterPath = mediaResult['poster_path'] ? `https://image.tmdb.org/t/p/original/${mediaResult['poster_path']}` : "../static/images/no_image.jpg";

            const mediaCard = document.createElement('div');
            mediaCard.classList.add("media-template");
            mediaCard.setAttribute('data-whist-media',mediaName);
            mediaCard.setAttribute('data-whist-id',mediaID);
            mediaCard.setAttribute('data-whist-type',mediaType);
            const mediaImage = document.createElement('img');
            mediaImage.src = posterPath;
            mediaImage.classList.add('media-image');

            mediaCard.appendChild(mediaImage);
            mediaCard.addEventListener('click',()=>{ 
                // window.open(`/main?mediaName=${mediaName}&mediaId=${mediaID}&mediaType=${mediaType}`,'_self'); 
                window.open(`/${mediaType}/${mediaID}-${mediaName.toLowerCase().replaceAll(' ','-')}`,"_self")
            });

            // listOfMediaCards.push(mediaCard);
            return mediaCard;
        } catch (error) {
            console.error("Media fetch error: ",error);
            setErrorMessage('Media fetch error :(')
        }
    });

    const fetchedCards = await Promise.all(fetchCards)
    listOfMediaCards.push(...fetchedCards)
    // console.log(listOfMediaCards);
    createTitleHovers(listOfMediaCards);
}

function fillPages() {
    if(listOfMediaCards.length===0){
        var noMovies = document.createElement('div');
        noMovies.classList.add('no-movies');
        noMovies.textContent = "You have not seen any movies or TV shows!"
        document.querySelector('.spinner-border').remove();
        document.querySelector('.page-toggle-cont').remove();
        document.querySelector('.movies').append(noMovies);
        return;
    }
    pagination.segregatePages(listOfMediaCards,pages,52);
    pagination.addToggleButtons(pageToggleButtonCont,pages,scrollToElement,pageCont);
    pagination.displayPage(1,pages,pageCont);
}

{// export async function createList(name, id){
        //     //fetch playlist
        //     let playlist = document.createElement('div');
        //     playlist.classList.add('playlist');
        //     playlist.setAttribute('data-whist-playlist-id',id);
        //     let playlistName = document.createElement('div');
        //     playlistName.classList.add('playlist-name');
        //     playlistName.textContent=`${name}`;
        //     let playlistContent = document.createElement('div');
        //     playlistContent.classList.add('playlist-content');
        
        //     // for(let i=0;i<Math.min(10,[playlist].length);i++)
        //     let number = Math.floor(Math.random() * 10)+ 1;
        //     for(let i=0;i<Math.min(6,number);i++){
            //         playlistContent.appendChild(cards.createWhiplashCard());
            //         playlistContent.appendChild(cards.createUpCard());
            //     }
            //     playlist.append(playlistName,playlistContent);
            //     let seeMore = document.createElement('div');
            //     seeMore.classList.add('media-template','see-more');
            //     let seeMoreBtn = document.createElement('button');
            //     seeMoreBtn.classList.add('btn','btn-secondary');
            //     seeMoreBtn.textContent = `See all (${number*2})`;
            //     let seeMoreIcon = document.createElement('i');
            //     seeMoreIcon.classList.add('bi','bi-arrow-right');
            //     seeMoreBtn.append(document.createElement('br'),seeMoreIcon);
            //     seeMoreBtn.onclick = () => {
                //         window.open(`/users/${JSON.parse(Cookies.get('userInfo')).username}/playlists/${name.replace(' ','-')}`,'_self');
                //     }
                //     seeMore.append(seeMoreBtn);
                //     playlistContent.append(seeMore);
                
                //     document.querySelector('.playlists').append(playlist,document.createElement('hr'));
                // }
// export async function fillPlaylists(){
//     //fetch playlist ids for user id and number
//     createList("Watchlist","watchlist")
//     let numberOfPlaylists =  Math.floor(Math.random() * 10)+ 1;
//     for(let i=0;i<Math.min(3,numberOfPlaylists);i++){
//         createList(`Playlist ${i+1}`,`${i+1}`);
//     }
//     if(numberOfPlaylists > 3){
//         document.querySelector(".see-all-playlists").classList.remove('hidden');
//         document.querySelector(".see-all-playlists a").textContent = `See all playlists (${numberOfPlaylists})`;
//         document.querySelector(".see-all-playlists a").href = `/users/${JSON.parse(Cookies.get('userInfo')).username}/playlists/`;
//     }
// }
}

await getWatchedMedia();
await createMediaCards();
fillPages();
fillPlaylists();

// let playlistContent = document.querySelector(`[data-whist-playlist-id="playlist"] .playlist-content`);
// for(let i=0;i<5;i++){
//     playlistContent.appendChild(cards.createWhiplashCard());
//     playlistContent.appendChild(cards.createUpCard());
// }



// letsgo();