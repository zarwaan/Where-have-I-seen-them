export function segregatePages(listOfMediaCards, pages, cardsToDisplayOnOnePage) {
    let templist = [];
    var numOfCards = listOfMediaCards.length;
    for (let i = 1; i <= numOfCards; i++) {
        templist.push(listOfMediaCards[i - 1]);
        if (i % cardsToDisplayOnOnePage === 0 || i === listOfMediaCards.length) {
            pages.push(templist);
            templist = [];
        }
    }
    return pages;
}

export function addToggleButtons(pageToggleButtonCont, pages, scrollToElement, pageCont) {
    pageToggleButtonCont.innerHTML = "";
    for (let i = 1; i <= pages.length; i++) {
        const togButton = document.createElement('button');
        togButton.classList.add('page-toggle-button');
        if (i === 1) togButton.classList.add('selected-button');
        togButton.setAttribute('data-whist-page-num', i);
        togButton.textContent = `${i}`;
        togButton.onclick = () => {
            clearPageToggle(pageToggleButtonCont);
            togButton.classList.add('selected-button');
            displayPage(i, pages, pageCont);
            scrollToElement.scrollIntoView({ behavior: "smooth" });
        }
        pageToggleButtonCont.append(togButton);
    }
}

export function displayPage(pageNum, pages, pageCont) {
    pageCont.innerHTML = "";
    pages[pageNum - 1].forEach((card) => {
        pageCont.append(card);
    });
}

export function clearPageToggle(pageToggleButtonCont) {
    pageToggleButtonCont.querySelectorAll('.page-toggle-button').forEach((button) => {
        button.classList.remove('selected-button');
    });
}