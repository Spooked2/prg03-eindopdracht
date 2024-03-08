//Wait before the page has fully loaded before doing anything
window.addEventListener('load', init);

//Global variables
let preparedSpells;
let allSpells;
let descriptionModal;
let fetchedDetails = [];
let favorites = {};

function init() {

    allSpells = document.getElementById('allSpells');
    allSpells.addEventListener('click', spellClickHandler);

    preparedSpells = document.getElementById('preparedSpells');
    preparedSpells.addEventListener('click', spellClickHandler);

    descriptionModal = document.getElementById('spellDescriptionContainer');
    descriptionModal.addEventListener('click', hideDetails);

    if (localStorage.getItem('favorites')) {
        favorites = JSON.parse(localStorage.getItem('favorites'));
    }

    let loadSpellsButton = document.getElementById('loadSpells');
    loadSpellsButton.addEventListener('click', loadSpells);

    let closeDescriptionButton = document.getElementById('closeDescription');
    closeDescriptionButton.addEventListener('click', hideDetails);

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
    if (Array.isArray(data)) {
        //Adds all the spells to the HTML document
        displayAllSpells(data);
        return;
    }

    //If the data is a single object it must be the details of a single spell
    //Convert data to an article and save it so we don't have to fetch the same spell twice
    convertToDetailArticle(data);

    //Show a popup containing details of the fetched spell
    showSpellDetails(data.index);

}

/**
 * Generic AJAX error handler
 * @param data
 */
function AJAXErrorHandler(data) {
    console.log(data);

}

function hideDetails(e) {
    if (e.target.id === 'spellDescriptionContainer' || e.target.tagName === 'BUTTON') {
        descriptionModal.style.display = 'none';
    }
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

/**
 * When a spell article is clicked, it displays the details of the spell
 * @param {Event}e
 */
function spellClickHandler(e) {
    e.preventDefault();

    //Check if the clicked thing is an article
    if (e.target.tagName === 'DIV') {
        return;
    }

    //Get the correct id of clicked spell, even if target is not the article element
    let id;
    if (e.target.dataset.id) {
        id = e.target.dataset.id;
    } else {
        id = e.target.parentElement.dataset.id;
    }

    if (e.target.id === 'favoriteButton') {
        //Check if the spell is already a favorite
        if (e.target.parentElement.classList.contains('favorite')) {
            //If so, remove it from favorites
            favorites[id] = false;
            e.target.innerText = 'Add favorite';
        } else {
            //If not, add it to favorites
            favorites[id] = true;
            e.target.innerText = 'Remove favorite';
        }

        //Update the favorites object in local storage
        localStorage.setItem('favorites', JSON.stringify(favorites));

        //Toggle favorite class for styling
        e.target.parentElement.classList.toggle('favorite');

        return;
    }

    //Fetch the details of the clicked spell if it hasn't been fetched already
    if (id in fetchedDetails) {
        showSpellDetails(id);
    } else {
        let url = `https://www.dnd5eapi.co/api/spells/${id}`;
        AJAXFetch(url);
    }

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
 * @param {String} spellIndex - An outerHTML string
 */
function showSpellDetails(spellIndex) {
    let descriptionArticle = document.querySelector('#spellDescription article');
    descriptionArticle.outerHTML = fetchedDetails[spellIndex];
    descriptionModal.style.display = 'block';
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
        concentrationText.innerText = "Concentration";
    } else {
        concentrationText.innerText = " ";
    }

    //Add to favorites object if not yet added
    if (!favorites[spellObject.id]) {
        favorites[spellObject.id] = false;
    }
    //Add class if favorite
    if (favorites[spellObject.id]) {
        spellArticle.classList.add('favorite');
    }

    //Create favorite button
    let favoriteButton = document.createElement('button');
    favoriteButton.id = 'favoriteButton';
    if (favorites[spellObject.id]) {
        favoriteButton.innerText = 'Remove favorite';
    } else {
        favoriteButton.innerText = 'Add favorite';
    }

    //Add all created elements to article
    spellArticle.appendChild(name);
    spellArticle.appendChild(levelText);
    spellArticle.appendChild(concentrationText);
    spellArticle.appendChild(favoriteButton);

    //Add details to article's dataset
    spellArticle.dataset.name = spellObject.name;
    spellArticle.dataset.id = spellObject.id;
    spellArticle.dataset.level = spellObject.level.toString();
    spellArticle.dataset.concentration = `${spellObject.concentration}`;


    return spellArticle;

}

/**
 * Converts a spell object to an HTML article and stores it's outerHTML in global array.
 * The outerHTML is stored instead of the element itself because the data might need to be stored as a JSON file,
 * and the JSON.stringify function does not like HTML element objects.
 * JSON.parse would return empty objects if HTML element objects were put through the JSON.stringify function.
 * @param {Object} spellObject - Object containing the details of a spell
 */
function convertToDetailArticle(spellObject) {
    //Create article element and add index to dataset
    let article = document.createElement('article');
    article.dataset.index = spellObject.index;

    //Create separate body div for styling purposes
    let bodyDiv = document.createElement('div');

    //Create h3 element for the spell's name
    let name = document.createElement('h3');
    name.innerText = spellObject.name;
    article.appendChild(name);

    //Create p element detailing the spells level, school and if it can be cast as a ritual
    let levelSchoolRitual = document.createElement('p');
    levelSchoolRitual.innerText = spellObject.level;
    let levelSuffix;
    switch (spellObject.level) {
        case 1:
            levelSuffix = 'st';
            break;
        case 2:
            levelSuffix = 'nd';
            break;
        case 3:
            levelSuffix = 'rd';
            break;
        default:
            levelSuffix = 'th';
    }
    levelSchoolRitual.innerText += `${levelSuffix}-level ${spellObject.school.name}`;
    if (spellObject.ritual) {
        levelSchoolRitual.innerText += '(ritual)';
    }
    bodyDiv.appendChild(levelSchoolRitual);


    //Create p elements for casting time, range, components and duration
    let castingTime = document.createElement('p');
    castingTime.innerHTML = `<b>Casting Time:</b> ${spellObject.casting_time}`;
    bodyDiv.appendChild(castingTime);

    let range = document.createElement('p');
    range.innerHTML = `<b>Range:</b> ${spellObject.range}`;
    bodyDiv.appendChild(range);

    let components = document.createElement('p');
    components.innerHTML = `<b>Components:</b> ${spellObject.components.join(', ')}`;
    if (spellObject.material) {
        components.innerHTML += ` (${spellObject.material})`;
    }
    bodyDiv.appendChild(components);

    let duration = document.createElement('p');
    duration.innerHTML = '<b>Duration:</b> ';
    if (spellObject.concentration) {
        duration.innerHTML += `Concentration, ${spellObject.duration.toLowerCase()}`;
    } else {
        duration.innerHTML += spellObject.duration;
    }
    bodyDiv.appendChild(duration);

    //Create div element for spell description
    let description = document.createElement('div');
    description.id = 'description';
    //Loop through all description items and add them as separate p elements to div
    for (const descriptionItem of spellObject.desc) {
        let descriptionElement = document.createElement('p');
        descriptionElement.innerText = descriptionItem;
        description.appendChild(descriptionElement);
    }
    bodyDiv.appendChild(description);

    //Add 'at higher levels' description if one exists
    if (spellObject.higher_level.length > 0) {
        let higherLevels = document.createElement('p');
        higherLevels.innerHTML = `<b>At higher levels:</b> ${spellObject.higher_level.join(' ')}`;
        bodyDiv.appendChild(higherLevels);
    }

    article.appendChild(bodyDiv);

    fetchedDetails[spellObject.index] = article.outerHTML;

}