'use strict';

/* Clifford Patterson 
 *
 * Based on
 * https://gist.github.com/luruke/0704bc594c81e3f4c491ba919b96450a
 * @see https://www.smashingmagazine.com/2016/07/improving-user-flow-through-page-transitions/
 *
 *
 * When a user clicks a  lienk, changePage() fetchs html, extracts .csc container
 * and adds it to page. animate() crossfades between the two.  
 */

/* Prevent Default Link Behavior 
 * @see https://stackoverflow.com/questions/1687296/what-is-dom-event-delegation/1688293#1688293
 * @see https://stackoverflow.com/questions/4616694/what-is-event-bubbling-and-capturing/4616720#4616720
 */

window.addEventListener('popstate', changePage);

document.addEventListener('click', function (e) {
  var el = e.target;
  while (el && !el.href) {
    el = el.parentNode;
  }

  if (el) {
    e.preventDefault();
    history.pushState(null, null, el.href);
    changePage();
    return;
  }
});

// Fetch page /
var cache = {};
// TODO use Cache API
function loadPage(url) {

  if (cache[url]) {
    return new Promise(function (resolve) {
      resolve(cache[url]);
    });
  }

  return fetch(url, { method: 'GET' }).then(function (res) {
    cache[url] = res.text();
    return cache[url];
  });
}

// Parse and Add Content 
// csc = content swap container 

function changePage() {
  var url = void 0,
      wrapper = void 0,
      oldContent = void 0,
      newContent = void 0;

  url = window.location.href; // url, has alread been changed 

  loadPage(url).then(function (responseText) {
    wrapper = document.createElement('div');
    wrapper.innerHTML = responseText;

    oldContent = document.querySelector('.csc');
    newContent = wrapper.querySelector('.csc');

    var main = document.querySelector('main');
    main.appendChild(newContent);
    animate(oldContent, newContent);
  });
}

function animate(oldContent, newContent) {
  oldContent.style.position = 'absolute';

  var fadeOut = oldContent.animate({
    opacity: [1, 0],
    transform: ['translateY(0)', 'translateY(100vh)'],
    easing: 'ease-out'

    //easing: 'cubic-bezier(0.075, 0.82, 0.165, 1)' //easeOutCirc
  }, 250);

  var fadeIn = newContent.animate({
    opacity: [0, 1],
    easing: 'ease-in'
  }, 250);

  fadeIn.onfinish = function () {
    oldContent.parentNode.removeChild(oldContent);
  };
}