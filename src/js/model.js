import "regenerator-runtime/runtime";
import { API_URL } from "./config.js";
import { getJSON, sendJSON } from "./helper.js";
export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    page: 1,
    resultsPerPage: 10,
  },
  bookmarks:[],
};

const createRecipeObject = function(data){
  const recipe = data.data.recipe;
return {
  id: recipe.id,
  title: recipe.title,
  publisher: recipe.publisher,
  image: recipe.image_url,
  sourceUrl: recipe.source_url,
  servings: recipe.servings,
  cookingTime: recipe.cooking_time,
  ingredients: recipe.ingredients,
  ...(recipe.key && {key: recipe.key}),
};
}



export const loadRecipe = async function (id) {
  try {
    const data = await getJSON(`${API_URL}/${id}?key=dfd459d7-a40a-4a24-8d7d-b0eb1d15dfb5`);
    // console.log(data);
    
    state.recipe = createRecipeObject(data);
    if(state.bookmarks.some(b=> b.id===id))
    state.recipe.bookmarked = true
    else
    state.recipe.bookmarked = false
  } catch (err) {
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await getJSON(`${API_URL}?search=${query}&key=dfd459d7-a40a-4a24-8d7d-b0eb1d15dfb5`);
    state.search.results = data.data.recipes.map((rec) => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && {key: rec.key}),
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach((element) => {
    element.quantity = (element.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};

const saveBookmark = function(){
  localStorage.setItem('bookmarks',JSON.stringify(state.bookmarks));
}


export const addBookmark = function(recipe){
state.bookmarks.push(recipe);

if(recipe.id === state.recipe.id) state.recipe.bookmarked = true;
saveBookmark();
}

export const deleteBookmark = function(id){
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index,1)
  if(id === state.recipe.id) state.recipe.bookmarked = false;
  saveBookmark();
}

const init= function (){
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
}
init();

export const uploadRecipe = async function(newRecipe){
  try{
const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient')
  && entry[1]!=='').map(ing=>{
    const ingArr = ing[1].split(',');
    if(ingArr.length!=3) throw new Error('Wrong Ingredient format please use the correct format')
  const[quantity, unit, description] = ingArr;
  return{quantity:quantity?+quantity:null, unit, description}
  });
  

const recipe = {
  title: newRecipe.title,
  source_url: newRecipe.sourceUrl,
  image_url: newRecipe.image,
  publisher: newRecipe.publisher,
  cooking_time: +newRecipe.cookingTime,
  servings: +newRecipe.servings,
  ingredients,
}
// console.log(recipe)
const data = await sendJSON(`${API_URL}?key=dfd459d7-a40a-4a24-8d7d-b0eb1d15dfb5`, recipe);
state.recipe = createRecipeObject(data);
addBookmark(state.recipe);

  }
  catch(err){
throw err;
  }
 
};
