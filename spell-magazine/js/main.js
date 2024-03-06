//Wait before the page has fully loaded before doing anything
window.addEventListener('load', init);

//Global variables
let preparedSpells;
let allSpells;

function init() {

    allSpells = document.getElementById('allSpells');
    allSpells.addEventListener('click', spellClickHandler);

    preparedSpells = document.getElementById('preparedSpells');
    preparedSpells.addEventListener('click', spellClickHandler);

    let loadSpellsButton = document.getElementById('loadSpells');
    loadSpellsButton.addEventListener('click', loadSpells);

}


/**
 * Generic AJAX fetch function
 * @param {String} url - URL to webservice
 */
function AJAXFetch(url) {
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(AJAXSuccessHandler)
        .catch(AJAXErrorHandler);
}

/**
 * Generic AJAX success handler
 * @param data
 */
function AJAXSuccessHandler(data) {
    console.log(data);

    //Check if the given data is an object. Arrays are seen as objects in Javascript
    if (typeof data !== 'object') {
        return;
    }

    //Checks if the data is an array
    if ((data) => {
        return data.constructor === Array;
    }) {
        //Adds all the spells to the HTML document
        displayAllSpells(data);
        return;
    }

    //If the data is a single object it must be the details of a single spell
    //Show a popup containing details of the fetched spell
    showSpellDetails(data);

}

/**
 * Generic AJAX error handler
 * @param data
 */
function AJAXErrorHandler(data) {
    console.log(data);

}

/**
 * Loads spells from homemade webservice
 * @param e
 */
function loadSpells(e) {
    e.preventDefault();

    //Fetch all the spells from the webservice with AJAX
    AJAXFetch("http://localhost/prg03-eindopdracht/webservice/");

}

/**
 * Converts fetched spells from the webservice to articles, and adds them to the HTML document
 * @param {[Object]} spellArray
 */
function displayAllSpells(spellArray) {
    //Delete the 'load spells' button
    document.getElementById('loadSpells').remove();

    //Convert all spells to articles and adds them to the document
    for (const spell of spellArray) {
        let spellArticle = convertToArticle(spell);
        addToDocument(spellArticle, false);
    }
}

function spellClickHandler(e) {
    e.preventDefault();

    //Check if the clicked thing is an article
    if (e.target.tagName !== 'ARTICLE') {
        return;
    }

    //Fetch the details of the clicked spell
    let url = `https://www.dnd5eapi.co/api/spells/${e.target.dataset.id}`;
    AJAXFetch(url);

}

/**
 * Adds an article element to correct spell list
 * @param {HTMLElement} spellArticle
 * @param {Boolean} prepared
 */
function addToDocument(spellArticle, prepared) {
    let spellList;

    //Select spell list based on if the spell is prepared
    if (prepared) {
        spellList = preparedSpells;
    } else {
        spellList = allSpells;
    }

    spellList.appendChild(spellArticle);

}

/**
 * Shows a pop-up containing all the details of a spell
 * @param {Object} spellDetails
 */
function showSpellDetails(spellDetails) {
    console.log(spellDetails);
}

/**
 * Converts a spell object to an HTML article
 * @param {Object} spellObject
 * @param {String} spellObject.name
 * @param {String} spellObject.id
 * @param {Number} spellObject.level
 * @param {Boolean} spellObject.concentration
 */
function convertToArticle(spellObject) {
    //Create a new article element
    let spellArticle = document.createElement('article');

    //Create h3 containing the spell's name
    let name = document.createElement('h3');
    name.innerText = spellObject.name;

    //Create p containing the spell's level
    let levelText = document.createElement('p');
    levelText.innerText = `Level ${spellObject.level} spell`;

    //Create p containing the spell's concentration requirement
    let concentrationText = document.createElement('p');
    if (spellObject.concentration) {
        concentrationText.innerText = "Requires concentration";
    } else {
        concentrationText.innerText = "Does not require concentration";
    }

    //Add all created elements to article
    spellArticle.appendChild(name);
    spellArticle.appendChild(levelText);
    spellArticle.appendChild(concentrationText);

    //Add details to article's dataset
    spellArticle.dataset.name = spellObject.name;
    spellArticle.dataset.id = spellObject.id;
    spellArticle.dataset.level = spellObject.level.toString();
    spellArticle.dataset.concentration = `${spellObject.concentration}`;


    return spellArticle;

}