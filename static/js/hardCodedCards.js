export function createWhiplashCard(title=false){
    const whiplashCard = document.createElement('div');
    whiplashCard.classList.add("media-template");
    whiplashCard.setAttribute('data-whist-media','Whiplash');
    whiplashCard.setAttribute('data-whist-id','244786');
    const whiplashImage = document.createElement('img');
    whiplashImage.src = "/static/images/whiplash.jpg";
    whiplashImage.classList.add('media-image');
    whiplashCard.appendChild(whiplashImage);

    if(title)
    {
        const whiplashName = document.createElement('div');
        whiplashName.textContent = "Whiplash";
        whiplashName.classList.add('media-title');
        whiplashCard.appendChild(whiplashName);
    }

    return whiplashCard;
}

export function createUpCard(title = false) {
    const upCard = document.createElement('div');
    upCard.classList.add("media-template");
    upCard.setAttribute('data-whist-media','Up');
    upCard.setAttribute('data-whist-id','14160');
    const upImage = document.createElement('img');
    upImage.src = "/static/images/up.jpg";
    upImage.classList.add('media-image');
    upCard.appendChild(upImage);

    if(title)
    {
        const upName = document.createElement('div');
        upName.textContent = "Up";
        upName.classList.add('media-title');
        upCard.appendChild(upName);
    }

    return upCard;
}

// export function createCustomCard() {

// }