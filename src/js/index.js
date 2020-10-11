import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/* 
    Global state of the app
    1: Search object.
    2: Current recipe object.
    3: Shopping List object.
    4: Liked recipes.
*/
const state = {};

/**
 * SEARCH CONTROLLER!!
 */
const controlSearch = async () => {
    // Get query from view
    const query = searchView.getInput();

    if (query) {
        // New search object and add to state.
        state.search = new Search(query);

        // Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // Search for recipes
            await state.search.getResults();

            // Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
            //console.log(state.search.result);
        } catch (error) {
            alert('Search Processing Error!!');
            clearLoader();
        }
    }
};

//Event Listeners
elements.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const button = e.target.closest('.btn-inline');
    if (button) {
        const gotoPage = parseInt(button.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, gotoPage);
    }
});

/**
 * RECIPE CONTROLLER!!
 */
const controlRecipe = async () => {
    //Get the ID from the URL
    const id = window.location.hash.replace('#', '');

    if (id) {
        // Prepare the UI for chaneges
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight Selected search item
        if(state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse Ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngs();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render the Recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (error) {
            console.log(error);
            alert('Error processing recipe!!');
        }

    }
}
//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * SHOPPING LIST CONTROLLER!!
 */
const controlList = () => {
    // Create a New List if there is none yet
    if(!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handling delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete event
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);
    } else if(e.target.matches('.shopping__count-value')) {
        // Handle the Count update
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/**
 * LIKES CONTROLLER!!
 */
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();

    const currID = state.recipe.id;
    // User has not yet liked current recipe
    if(!state.likes.isLiked(currID)) {
        // Add like to the state
        const newLike = state.likes.addLike(currID, state.recipe.title, state.recipe.author, state.recipe.img);

        // Toggle the like button
        likesView.toggleLikeBtn(true);

        //Add likes yo the UI list
        likesView.renderLikes(newLike);


        // User HAS liked current recipe
    } else {
        // Remove like to the state
        state.likes.deleteLike(currID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        //Remove likes from the UI list
        likesView.deleteLike(currID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    //Restore likes
    state.likes.readStorage();

    //Toggle button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //Render the exsisting likes
    state.likes.likes.forEach(like => likesView.renderLikes(like));
});


// Handling Recipe Button Clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decr, .btn-decr *')) {
        // Decrease button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServIngr(state.recipe);
        }
    } else if (e.target.matches('.btn-incr, .btn-incr *')) {
        // Increase button is clicked
        if(state.recipe.servings < 10){
            state.recipe.updateServings('inc');
            recipeView.updateServIngr(state.recipe);
        }
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        // Add ingredients to the Shopping List
        controlList();
    }else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //Like controller
        controlLike();
    }
});