import "regenerator-runtime/runtime";
import * as model from "./model.js";
import { recipeView, searchView, resultsView, paginationView, bookmarkView, addRecipeView } from "./view.js";
// const recipeContainer = document.querySelector(".recipe");

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// https://forkify-api.herokuapp.com/v2
// API key
// 6cc2ec05-2df8-4a79-9e41-02f6e2ce57d3
///////////////////////////////////////

const showRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());

    // loading recipe

    await model.loadRecipe(id);
    //rendering recipe
    recipeView.render(model.state.recipe);
    // debugger;
    bookmarkView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
  }
};
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultsPage());
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
};

const controlServings = function (servings) {
  model.updateServings(servings);
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function(){


  // add or remove bookmarks
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);
  bookmarkView.render(model.state.bookmarks);
}



const controlBookmarks = function(){
  bookmarkView.render(model.state.bookmarks)
}


const controlAddRecipe = async function  (newRecipe){
  try{
    addRecipeView.renderSpinner();
await model.uploadRecipe(newRecipe);
recipeView.render(model.state.recipe);
    addRecipeView.renderMessage();

    bookmarkView.render(model.state.bookmarks)
    window.history.pushState(null,'',`#${model.state.recipe.id}`);

    setTimeout(function(){
      addRecipeView.toggleWindow()
    }, 1500);

  }catch(err){
    console.error(err)
    addRecipeView.renderError(err.message)
  }

  
}



// controlSearchResults()
const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks);
 
  recipeView.addHandlerRender(showRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();


// window.addEventListener('hashchange',showRecipe);
// window.addEventListener('load',showRecipe);
const clearBookmarks = function(){
  localStorage.clear('bookmarks')
};
// clearBookmarks();