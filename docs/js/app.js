var tweetsContainer = document.getElementById('tweets-container');
var usernameInput = document.getElementById('username-input');
var submitButton = document.getElementById('submit-button');
var loadingIndicator = document.getElementById('loading-indicator');


// Prefill the value if the user is coming from a direct link (oldtweets.today/#username)
// Normally, I'd want to do this using a path, but GitHub Pages doesn't support routing via paths
    let hash = window.location.hash.split('#')[1];
    if (hash != '' && hash != undefined) {
        usernameInput.value = hash;
    } else {
        // Also support query string (oldtweets.today?username=<username>)
        let queryString = window.location.search;
        let queryParams = new URLSearchParams(queryString);
        if (queryParams.get('username')) {
            usernameInput.value = queryParams.get('username');
        }
    }

    function showLoadingIndicator() {
      submitButton.disabled = true;
      loadThatShit();
  }

  function doneWithLoading(succesful = true) {
      clearInterval(window.loaderInterval);
      succesful && (loadingIndicator.innerText = "Done! ✅");
      setTimeout(() => {
          submitButton.removeAttribute('disabled');
          succesful && (loadingIndicator.style.display = 'none');
          succesful && (tweetsContainer.style.display = 'block');
      }, 500);
  }

  function loadThatShit() {
      loadingIndicator.innerText = `Fetching ${window.username}'s tweets from ${day}...just a sec 🚀`;
      loadingIndicator.style.display = 'block';
      emojiLoad();
  }

  function emojiLoad() {
      window.loaderInterval = setInterval(() => {
          let emojis = ['🤔', '📝', '👩‍🏭', '🤗', '🙈', '😸', '🙂', '😅', '💪', '😊'];
          loadingIndicator.innerText = `Fetching ${window.username}'s tweets from ${day}...just a sec ${emojis[Math.floor(Math.random() * emojis.length)]}`;
      }, 750);
  }



/**@param {Event} event
 *
*/
    function handleFormSubmit(event) {
      event.preventDefault();
      window.username = usernameInput.value;
      window.username = window.username.trim();

      history.pushState({ username }, '', '#' + username);
      window.day = (new Date).toLocaleString('en-us', { month: 'long', day: 'numeric' });

      showLoadingIndicator();
      // get rid of any existing content
      tweetsContainer.innerHTML = '';
      getTweetsOnThisDay(username)
          .then(tweets => {
              let tweetsHtml = [];
              let hasContent = false;
              for (let year of Object.keys(tweets).reverse()) {
                  if (tweets[year].length) {
                      hasContent = true;
                      tweetsHtml.push(`<div>`);
                      tweetsHtml.push(`<h3>${year}</h3>`);
                      tweetsHtml.push(tweets[year].join("\n"));
                      tweetsHtml.push("</div><br>");
                  }
              }

              if (!hasContent) {
                  throw `Sorry, we couldn't find any tweets by <b>${window.username}</b> on <b>${window.day}</b>😕`;
              }
              injectContentIntoPage(tweetsHtml.join("\n"), true);
              document.title = `@${username.replace("@", "")}'s old Tweets`;
          })
          .catch(showError);
  }

/** @param {string} username
 *
*/
  function getTweetsOnThisDay(username) {
      const utcOffset = (new Date()).getTimezoneOffset();
      const apiUrl = `https://europe-west1-tweetedonthisday.cloudfunctions.net/getTweetsOnThisDay?username=${username}&utcOffset=${utcOffset}`;
      return fetch(apiUrl).then(r => r.json())
          .then(r => {
              if (r.error) {
                  console.log(r.error);
                  throw 'Something went wrong. Please try again.😭';
              }
              return r;
          })
          .catch(r => {
              if (r.error) {
                  console.log(r.error);
              }
              throw 'Something went wrong. Please try again.😭';
          })
  }

/** @param {string} content
*
*/
  function injectContentIntoPage(content) {
      twttr.events.bind('loaded', () => setTimeout(doneWithLoading, 1000));
      let container = document.getElementById('tweets-container');
      container.innerHTML = content;
      twttr.widgets.load(container);
  }

  function showError(message) {
      doneWithLoading(false);
      setTimeout(() => {
          loadingIndicator.innerHTML = message;
          loadingIndicator.style.display = 'block';
      }, 1000);
  }
