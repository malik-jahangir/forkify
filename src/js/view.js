import icons from "../img/icons.svg";
import Fraction from "fraction.js";

class View {
  data;
  render(data) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();
    this.data = data;
    const markup = this.generateMarkup();
    this.clear();
    this.parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  update(data) {
    // if(!data || (Array.isArray(data) && data.length === 0)) return this.renderError();
    this.data = data;
    const newMarkup = this.generateMarkup();

    const newDom = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDom.querySelectorAll("*"));
    const curElements = Array.from(this.parentElement.querySelectorAll("*"));
    newElements.forEach((newEl, i) => {
      // if (newElements.length > curElements.length) return;
  
      const curEl = curElements[i];
      if (
        !newEl.isEqualNode(curEl) &&
        curEl.firstChild?.nodeValue.trim() !== ""
      ) {
        curEl.textContent = newEl.textContent;
      }

      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach((attr) => {
          curEl.setAttribute(attr.name, attr.value);
        });
        // console.log(newEl.attributes)
      }
    });
  }

  clear() {
    this.parentElement.innerHTML = "";
  }

  renderSpinner() {
    const markup = `<div class="spinner">
    <svg>
      <use href="${icons}#icon-loader"></use>
    </svg>
  </div>`;
    this.clear();
    this.parentElement.insertAdjacentHTML("afterbegin", markup);
  }
  renderError(message = this.errorMessage) {
    const markup = `<div class="error">
  <div>
    <svg>
      <use href="${icons}#icon-alert-triangle"></use>
    </svg>
  </div>
  <p>${message}</p>
</div>`;
    this.clear();
    this.parentElement.insertAdjacentHTML("afterbegin", markup);
  }
  renderMessage(message = this.message) {
    const markup = `<div class="message">
  <div>
    <svg>
      <use href="${icons}#icon-smile"></use>
    </svg>
  </div>
  <p>${message}</p>
</div>`;
    this.clear();
    this.parentElement.insertAdjacentHTML("afterbegin", markup);
  }
}

class RecipeView extends View {
  parentElement = document.querySelector(".recipe");
  errorMessage = "We could not find that recipe. Please try another one!";
  addHandlerRender(handler) {
    ["hashchange", "load"].forEach((e) => window.addEventListener(e, handler));
  }

  addHandlerUpdateServings(handler) {
    this.parentElement.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn--update-servings");
      if (!btn) return;
      const updateTo = +btn.dataset.updateTo;
      if (updateTo < 1) return;
      handler(updateTo);
    });
  }

  addHandlerAddBookmark(handler){
    this.parentElement.addEventListener('click',function(e){
      const btn = e.target.closest('.btn-bookmark');
      if(!btn) return;
      handler();
    } )
  }

  generateMarkup() {
    return `<figure class="recipe__fig">
    <img src="${this.data.image}" alt="${this.data.title}" />
    <h1 class="recipe__title">
      <span>${this.data.title}</span>
    </h1>
  </figure>
  
  <div class="recipe__details">
    <div class="recipe__info">
      <svg class="recipe__info-icon">
        <use href="${icons}#icon-clock"></use>
      </svg>
      <span class="recipe__info-data recipe__info-data--minutes">${
        this.data.cookingTime
      }</span>
      <span class="recipe__info-text">minutes</span>
    </div>
    <div class="recipe__info">
      <svg class="recipe__info-icon">
        <use href="${icons}#icon-users"></use>
      </svg>
      <span class="recipe__info-data recipe__info-data--people">${
        this.data.servings
      }</span>
      <span class="recipe__info-text">servings</span>
  
      <div class="recipe__info-buttons">
        <button class="btn--tiny btn--update-servings" data-update-to="${
          this.data.servings - 1
        }">
          <svg>
            <use href="${icons}#icon-minus-circle"></use>
          </svg>
        </button>
        <button class="btn--tiny btn--update-servings" data-update-to = "${
          this.data.servings + 1
        }">
          <svg>
            <use href="${icons}#icon-plus-circle"></use>
          </svg>
        </button>
      </div>
    </div>
  
    <div class="recipe__user-generated ${this.data.key?'':"hidden"}">
      <svg>
        <use href="${icons}#icon-user"></use>
      </svg>
    </div>
    <button class="btn--round btn-bookmark">
      <svg class="">
        <use href="${icons}#icon-bookmark${this.data.bookmarked ? '-fill':''}"></use>
      </svg>
    </button>
  </div>
  
  <div class="recipe__ingredients">
    <h2 class="heading--2">Recipe ingredients</h2>
    <ul class="recipe__ingredient-list">
    ${
      // ingredients
      this.data.ingredients
        .map((ing) => {
          return `<li class="recipe__ingredient">
        <svg class="recipe__icon">
          <use href="${icons}#icon-check"></use>
        </svg>
        <div class="recipe__quantity">${
          ing.quantity ? new Fraction(ing.quantity).toFraction(true) : ""
        }</div>
        <div class="recipe__description">
          <span class="recipe__unit">${ing.unit}</span>
          ${ing.description}
        </div>
      </li>`;
        })
        .join("")
    }
      
  
      
    </ul>
  </div>
  
  <div class="recipe__directions">
    <h2 class="heading--2">How to cook it</h2>
    <p class="recipe__directions-text">
      This recipe was carefully designed and tested by
      <span class="recipe__publisher">${
        this.data.publisher
      }</span>. Please check out
      directions at their website.
    </p>
    <a
      class="btn--small recipe__btn"
      href=${this.data.sourceUrl}"
      target="_blank"
    >
      <span>Directions</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </a>
  </div>`;
  }
}
export const recipeView = new RecipeView();

class ResultsView extends View {
  parentElement = document.querySelector(".results");
  errorMessage = "No recipe found for your query! Please try again.";
  generateMarkup() {
    
    return this.data
      .map((e,i) => {
        const id = window.location.hash.slice(1);
        return `
  <li class="preview">
  <a class="preview__link ${
    e.id === id ? "preview__link--active" : ""
  } " href="#${e.id}">
    <figure class="preview__fig">
      <img src=${e.image} alt="${e.title}" />
    </figure>
    <div class="preview__data">
      <h4 class="preview__title">${e.title}</h4>
      <p class="preview__publisher">${e.publisher}</p>
      <div class="preview__user-generated ${this.data[i].key?'':'hidden'}">
      <svg>
        <use href="${icons}#icon-user"></use>
      </svg>
    </div>
    </div>
    
  </a>
</li>
  `;
      })
      .join();
  }
}
export const resultsView = new ResultsView();



class BookmarkView extends View {
  parentElement = document.querySelector(".bookmarks__list");
  errorMessage = "No bookmarks yet Find a nice recipe and bookmark it.";
addHandlerRender(handler){
  window.addEventListener('load', handler());

}

  generateMarkup() {
    
    return this.data
      .map((e,i) => {
        const id = window.location.hash.slice(1);
        return `
  <li class="preview">
  <a class="preview__link ${
    e.id === id ? "preview__link--active" : ""
  } " href="#${e.id}">
    <figure class="preview__fig">
      <img src=${e.image} alt="${e.title}" />
    </figure>
    <div class="preview__data">
      <h4 class="preview__title">${e.title}</h4>
      <p class="preview__publisher">${e.publisher}</p>
      <div class="preview__user-generated ${this.data[i].key? ' ' :'hidden'}">
      <svg>
        <use href="${icons}#icon-user"></use>
      </svg>
    </div>
    </div>
  </a>
</li>
  `;
      })
      .join();
  }
 
}

export const bookmarkView = new BookmarkView();


class SearchView {
  parentEl = document.querySelector(".search");

  clearInput() {
    this.parentEl.querySelector(".search__field").value = "";
  }

  getQuery() {
    const value = this.parentEl.querySelector(".search__field").value;
    this.clearInput();
    return value;
  }
  addHandlerSearch(handler) {
    this.parentEl.addEventListener("submit", function (e) {
      e.preventDefault();
      handler();
    });
  }
}
export const searchView = new SearchView();

class PaginationView extends View {
  parentElement = document.querySelector(".pagination");

  addHandlerClick(handler) {
    this.parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--inline");
      if (!btn) return;
      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }

  generateMarkup() {
    const numPages = Math.ceil(
      this.data.results.length / this.data.resultsPerPage
    );

    if (this.data.page === 1 && numPages > 1) {
      return `<button data-goto="${
        this.data.page + 1
      }" class="btn--inline pagination__btn--next">
  <span>page ${this.data.page + 1}</span>
  <svg class="search__icon">
    <use href="${icons}#icon-arrow-right"></use>
  </svg>
 
`;
    }

    if (this.data.page === numPages && numPages > 1) {
      return `<button data-goto="${
        this.data.page - 1
      }" class="btn--inline pagination__btn--prev">
 <svg class="search__icon">
   <use href="${icons}#icon-arrow-left"></use>
 </svg>
 <span>Page ${this.data.page - 1}</span>
</button>
`;
    }
    if (this.data.page < numPages) {
      return `
  <button data-goto="${
    this.data.page - 1
  }" class="btn--inline pagination__btn--prev">
  <svg class="search__icon">
    <use href="${icons}#icon-arrow-left"></use>
  </svg>
  <span>Page ${this.data.page - 1}</span>
 </button>
 <button data-goto="${
   this.data.page + 1
 }" class="btn--inline pagination__btn--next">
  <span>page ${this.data.page + 1}</span>
  <svg class="search__icon">
    <use href="${icons}#icon-arrow-right"></use>
  </svg>
  </button>
  `;
    }
    return ``;
  }
}

export const paginationView = new PaginationView();



class AddRecipeView extends View {
  parentElement = document.querySelector('.upload');
  message = 'Recie was sucessfully uploaded';
  window = document.querySelector('.add-recipe-window');
  overlay = document.querySelector('.overlay');
  btnOpen = document.querySelector('.nav__btn--add-recipe');
  btnClose = document.querySelector('.btn--close-modal');
 
  constructor(){
    super();
    this.addHandlerShowWindow();
  }
toggleWindow(){
  this.overlay.classList.toggle('hidden');
  this.window.classList.toggle('hidden');
}

  addHandlerShowWindow(){

    [this.btnOpen,this.overlay,this.btnClose].forEach((element)=>{
      element.addEventListener('click',()=>{
        this.overlay.classList.toggle('hidden');
        this.window.classList.toggle('hidden');
      });  
    })

  }

addHandlerUpload(handler){
  this.parentElement.addEventListener('submit',function(e){
    e.preventDefault();
    const dataArr = [...new FormData(this)];
    const data = Object.fromEntries(dataArr);
    handler(data);
  })
}

  generateMarkup() {}

}
export const addRecipeView = new AddRecipeView();