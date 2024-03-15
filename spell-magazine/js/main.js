//Wait before the page has fully loaded before doing anything
window.addEventListener('load', init);

//Global variables
let descriptionModal;
let errorP;
let preparedSpells;
let inputFields;
let allSpells;
let fetchedDetails = {};
let favorites = {};
let prepared = {};
let paladinStats = {level: 2, charisma: 10}

function init() {

    allSpells = document.getElementById('allSpells');
    allSpells.addEventListener('click', spellClickHandler);

    preparedSpells = document.getElementById('preparedSpells');
    preparedSpells.addEventListener('click', spellClickHandler);

    descriptionModal = document.getElementById('spellDescriptionContainer');
    descriptionModal.addEventListener('click', hideDetails);

    errorP = document.getElementById('error');
    errorP.addEventListener('click', () => {
        errorP.style.display = 'none'
    });

    if (localStorage.getItem('paladinStats')) {
        paladinStats = JSON.parse(localStorage.getItem('paladinStats'));
    }

    if (localStorage.getItem('favorites')) {
        favorites = JSON.parse(localStorage.getItem('favorites'));
    }

    if (localStorage.getItem('prepared')) {
        prepared = JSON.parse(localStorage.getItem('prepared'));
    }

    inputFields = document.getElementsByTagName('INPUT');

    inputFields.charismaScore.value = paladinStats.charisma;
    inputFields.charismaScore.addEventListener('input', formHandler);

    inputFields.paladinLevel.value = paladinStats.level;
    inputFields.paladinLevel.addEventListener('input', formHandler);

    inputFields.maxPrepared.value = calculateMaxPrepared();

    let loadSpellsButton = document.getElementById('loadSpells');
    loadSpellsButton.addEventListener('click', loadSpells);

    let closeDescriptionButton = document.getElementById('closeDescription');
    closeDescriptionButton.addEventListener('click', () => {
        descriptionModal.style.display = 'none'
    });

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
        inputFields.currentPrepared.value = preparedSpells.children.length;
        return;
    }

    //If the data is a single object it must be the details of a single spell
    //Convert data to an article and save it, so we don't have to fetch the same spell twice
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

    errorP.style.display = 'block';
    errorP.innerText = `Something went wrong! Report the following error to the owner: ${data}`;

}

function hideDetails(e) {
    if (e.target.id === 'spellDescriptionContainer') {
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

    //Reveal hidden sections
    let sections = document.getElementsByTagName('SECTION');
    for (const section of sections) {
        section.style.display = 'block';
    }

    //Convert all spells to articles and adds them to the document
    for (const spell of spellArray) {
        let spellArticle = convertToArticle(spell);
        addToDocument(spellArticle);
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

    //Handle adding and removing from favorites if the target is the favorite button
    if (e.target.id === 'favoriteButton') {
        favoriteHandler(e, id);
        return;
    }

    //Handle adding and removing from prepared list
    if (e.target.id === 'prepareButton') {
        prepareHandler(e, id);
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

function favoriteHandler(e, id) {
    //Check if the spell is already a favorite
    if (e.target.parentElement.classList.contains('favorite')) {
        //If so, remove it from favorites
        //favorites[id] = false;
        delete favorites[id];
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
}

function prepareHandler(e, id) {
    //Check if the spell is already prepared
    if (e.target.parentElement.classList.contains('prepared')) {
        //If so, remove it from prepared
        prepared[id] = false;
        e.target.innerText = 'Add to prepared';
    } else {
        //If not, add it to prepared
        prepared[id] = true;
        e.target.innerText = 'Remove from prepared';
    }

    //Move spell to correct list
    addToDocument(e.target.parentElement);

    //Update form
    inputFields.currentPrepared.value = preparedSpells.children.length;

    //Update the prepared object in local storage
    localStorage.setItem('prepared', JSON.stringify(prepared));

    //Toggle prepared class
    e.target.parentElement.classList.toggle('prepared');

    //Recheck spells in prepared list and mark excessive ones
    markExcessivePreparedSpells();

}

/**
 * Adds an article element to correct spell list
 * @param {HTMLElement} spellArticle
 */
function addToDocument(spellArticle) {
    //Select spell list based on if the spell is prepared

    if (prepared[spellArticle.dataset.id]) {
        if (preparedSpells.children.length >= calculateMaxPrepared()) {
            spellArticle.classList.add('overMax');
        }
        preparedSpells.appendChild(spellArticle);
    } else {
        let suffix = getNumberSuffix(parseInt(spellArticle.dataset.level, 10))
        let spellList = document.getElementById(`${spellArticle.dataset.level}${suffix}LevelList`);
        spellArticle.classList.remove('overMax');
        spellList.appendChild(spellArticle);
    }

}

/**
 * Shows a pop-up containing all the details of a spell
 * @param {String} spellIndex - An outerHTML string
 */
function showSpellDetails(spellIndex) {
    // let descriptionArticle = document.querySelector('#spellDescription article');
    let descriptionArticle = document.querySelector('div[data-details]>article');
    descriptionArticle.outerHTML = fetchedDetails[spellIndex];
    descriptionModal.style.display = 'block';
}

/**
 * Converts a spell object to an HTML article
 * @param {Object} spellObject
 * @param {String} spellObject.name
 * @param {String} spellObject.index
 * @param {String} spellObject.level
 * @param {String} spellObject.school
 * @param {String} spellObject.casting_time
 * @param {String} spellObject.range
 * @param {String} spellObject.duration
 * @param {String} [spellObject.material]
 * @param {Boolean} spellObject.concentration
 * @param {Boolean} spellObject.verbal
 * @param {Boolean} spellObject.somatic
 * @param {Boolean} spellObject.ritual
 */
function convertToArticle(spellObject) {
    //Create a new article element
    let spellArticle = document.createElement('article');

    //Create h4 containing the spell's name
    let name = document.createElement('h4');
    name.innerText = spellObject.name;

    //Create p containing the spell's level and school
    let levelText = document.createElement('p');
    let suffix = getNumberSuffix(parseInt(spellObject.level, 10));
    levelText.innerText = `${spellObject.level}${suffix}-level ${spellObject.school}`;

    //Create p containing the spell's concentration requirement
    let concentrationText = document.createElement('p');
    if (spellObject.concentration) {
        concentrationText.innerText = "Concentration";
    } else {
        concentrationText.innerText = " ";
    }

    //Create p containing spell's ability to be cast as a ritual
    let ritualText = document.createElement('p');
    if (spellObject.ritual) {
        ritualText.innerText = 'Ritual'
    } else {
        ritualText.innerText = ' ';
    }

    //Add to prepared object if not yet added
    if (!prepared[spellObject.index]) {
        prepared[spellObject.index] = false;
    } else {
        spellArticle.classList.add('prepared');
    }

    //Add to favorites object if not yet added
    // if (!favorites[spellObject.index]) {
    //     favorites[spellObject.index] = false;
    // }
    //Add class if favorite
    if (favorites[spellObject.index]) {
        spellArticle.classList.add('favorite');
    }

    //Create favorite button
    let favoriteButton = document.createElement('button');
    favoriteButton.id = 'favoriteButton';
    if (favorites[spellObject.index]) {
        favoriteButton.innerText = 'Remove favorite';
    } else {
        favoriteButton.innerText = 'Add favorite';
    }

    //Create prepare button
    let prepareButton = document.createElement('button');
    prepareButton.id = 'prepareButton';
    if (prepared[spellObject.index]) {
        prepareButton.innerText = 'Remove from prepared';
    } else {
        prepareButton.innerText = 'Add to prepared';
    }

    //Add all created elements to article
    spellArticle.appendChild(name);
    spellArticle.appendChild(levelText);
    spellArticle.appendChild(concentrationText);
    spellArticle.appendChild(ritualText);
    spellArticle.appendChild(favoriteButton);
    spellArticle.appendChild(prepareButton);

    //Add details to article's dataset
    spellArticle.dataset.name = spellObject.name;
    spellArticle.dataset.id = spellObject.index;
    spellArticle.dataset.level = spellObject.level.toString();
    spellArticle.dataset.concentration = `${spellObject.concentration}`;
    spellArticle.dataset.ritual = `${spellObject.ritual}`;


    return spellArticle;

}

/**
 * Converts a spell object to an HTML article and stores it's outerHTML in global array.
 * The outerHTML is stored instead of the element itself because the data might need to be stored as a JSON file,
 * and the JSON.stringify function does not like HTML element objects.
 * JSON.parse would return empty objects if HTML element objects were put through the JSON.stringify function.
 * @param {Object} spellObject
 * @param {String} spellObject.name
 * @param {String} spellObject.index
 * @param {String} spellObject.level
 * @param {String} spellObject.school
 * @param {String} spellObject.casting_time
 * @param {String} spellObject.range
 * @param {String} spellObject.duration
 * @param {String} spellObject.desc
 * @param {String} [spellObject.material]
 * @param {Array} spellObject.components
 * @param {Array} spellObject.higher_level
 * @param {Boolean} spellObject.concentration
 * @param {Boolean} spellObject.ritual
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

    let levelSuffix = getNumberSuffix(parseInt(spellObject.level, 10));

    levelSchoolRitual.innerText += `${levelSuffix}-level ${spellObject.school.name}`;
    if (spellObject.ritual) {
        levelSchoolRitual.innerText += ' (ritual)';
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

/**
 * Returns a suffix based on the input number. For example 1 would return 'st' as in 1st.
 * @param {Number} number - The number you want the suffix of
 * @returns {string} - suffix string
 */
function getNumberSuffix(number) {
    let levelSuffix;
    switch (number) {
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
    return levelSuffix;
}

/**
 * Handles changes in the form
 * @param e - event
 */
function formHandler(e) {
    console.log(e.target.value);

    //Update paladin stats object
    if (e.target.name === 'charismaScore') {
        paladinStats.charisma = e.target.value;
    } else if (e.target.name === 'paladinLevel') {
        paladinStats.level = e.target.value;
    } else {
        return;
    }

    //Update the object in the local storage
    localStorage.setItem('paladinStats', JSON.stringify(paladinStats));

    //Update the maximum prepared value in form
    inputFields.maxPrepared.value = calculateMaxPrepared();


    //Add class to spells exceeding the max prepared limit
    markExcessivePreparedSpells();

}

/**
 * Calculates the maximum number of spells that can be prepared based on paladin level and charisma score
 * @returns {Number} number - Maximum amount of spells that can be prepared
 */
function calculateMaxPrepared() {

    let number = Math.floor((paladinStats.level / 2));

    number += Math.floor(((paladinStats.charisma - 10) / 2));

    if (number < 1) {
        number = 1;
    }

    return number;

}

function markExcessivePreparedSpells() {

    for (const [key, preparedSpell] of Object.entries(preparedSpells.children)) {
        if (parseInt(key, 10) >= calculateMaxPrepared()) {
            preparedSpell.classList.add('overMax');
        } else {
            preparedSpell.classList.remove('overMax');
        }
    }

}