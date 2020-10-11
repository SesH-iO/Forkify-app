import { elements }  from './base';

//Getting input from the Search Field
export const getInput = () => elements.searchInput.value;

//Clearing the Search Results
export const clearInput = () => { elements.searchInput.value = ''; };
export const clearResults = () => { 
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const highlightSelected = (id) => {
    const resArr = Array.from(document.querySelectorAll('.results__link'));
    resArr.forEach(el => {
        el.classList.remove('results__link--active');
    });
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
};

//Setting up a String title limiter
/* 
    'Pasta with tomato and spinach'
    acc: 0 / acc + curr.length = 5 / newTitle = ['Pasta']
    acc: 5 / acc + curr.length = 9 / newTitle = ['Pasta', 'with']
    acc: 9 / acc + curr.length = 15 / newTitle = ['Pasta', 'with', 'tomato']
    acc: 15 / acc + curr.length = 18 / newTitle = ['Pasta', 'with', 'tomato']
    acc: 18 / acc + curr.length = 24 / newTitle = ['Pasta', 'with', 'tomato']
*/
export const limitRecTitle = (title, limit = 17) => {
    const newTitle = [];
    if(title.length > limit) {
        //Testing each iterration (1st iterration is 0)
        title.split(' ').reduce((accumalator, curr) => {
            if(accumalator + curr.length <= limit) {
                newTitle.push(curr)
            } return accumalator + curr.length;
        }, 0);
        // Returning the result
        return `${newTitle.join(' ')} ...`;
    } return title;
};

const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

// type: 'prev' or 'next'
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);

    let button;
    if (page === 1 && pages > 1) {
        // Only button to go to next page
        button = createButton(page, 'next');
    } else if (page < pages) {
        // Both buttons
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;
    } else if (page === pages && pages > 1) {
        // Only button to go to prev page
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    // Render results of the current page
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;
    recipes.slice(start, end).forEach(renderRecipe);

    // render pagination buttons
    renderButtons(page, recipes.length, resPerPage);
};