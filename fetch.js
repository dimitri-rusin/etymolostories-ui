// Function to check if a string is a subsequence of another string
function isSubsequence(input, word) {
  input = input.toLowerCase();
  word = word.toLowerCase();
  let i = 0;
  let j = 0;

  while (i < input.length && j < word.length) {
    if (input[i] === word[j]) {
      i++;
    }
    j++;
  }

  return i === input.length;
}

// Function to find words where input is a subsequence
function findSubsequenceWords(input, wordList) {
  input = input.toLowerCase();
  const subsequenceWords = [];

  for (const word of wordList) {
    if (isSubsequence(input, word)) {
      subsequenceWords.push(word);
    }
  }

  return subsequenceWords;
}

// Function to store keys in local storage
function storeKeysLocally(list_of_words) {
  if (!localStorage.getItem('etymoloKeys')) {
    localStorage.setItem('etymoloKeys', list_of_words);
  }
}

// Function to retrieve and display _KEYS from Firebase
function showKeys() {

  // Check if keys are already in Local Storage
  var storedKeys = localStorage.getItem('etymoloKeys');

  // Fetch keys from Firebase if not in Local Storage
  if (!storedKeys) {
    var FIREBASE_URL_PREFIX = 'https://etymolofly-default-rtdb.europe-west1.firebasedatabase.app';
    var firebaseKeysUrl = `${FIREBASE_URL_PREFIX}/_KEYS.json`;
    fetch(firebaseKeysUrl)
      .then(response => response.json())
      .then(data => {
        if (typeof data === 'string') {
          // Store keys in Local Storage
          console.log('The _KEYS have been fetched.');
          storeKeysLocally(data);
          updateAvailableWordCount(data.split(',').length);
        } else {
          console.error('Received invalid _KEYS.');
        }
      })
      .catch(error => {
        console.error('Error fetching _KEYS:', error);
      });
  } else {
    updateAvailableWordCount(storedKeys.split(',').length);
    console.log('Recycling _KEYS.');
  }
}

// Function to update available word count on the page
function updateAvailableWordCount(count) {
  document.getElementById('available').textContent = 'Available words: ' + count;
}

// Function to handle the search and display the result
async function showMessage() {
  var inputVal = document.getElementById('searchInput').value.toLowerCase();
  inputVal = inputVal.replace(/[^a-zA-Z]/g, '');
  var FIREBASE_URL_PREFIX = 'https://etymolofly-default-rtdb.europe-west1.firebasedatabase.app';

  // Find subsequence words based on the user input
  var list_of_words = localStorage.getItem('etymoloKeys');
  if (list_of_words === null) {
    updateMessage('First, press "Get Keys" to be able to search the Etymolo database.');
    return;
  }

  const subsequenceWords = findSubsequenceWords(inputVal, list_of_words.split(','));

  if (subsequenceWords.length === 0) {
    updateMessage('Uups: No similar word has not yet been added to the Etymolo database.');
    return;
  }

  // Clear previous search results
  document.getElementById('searchResults').innerHTML = '';

  // Create an array of promises
  const fetchPromises = subsequenceWords.map(word => fetchStoryForWord(FIREBASE_URL_PREFIX, word));

  // Wait for all promises to resolve
  const results = await Promise.all(fetchPromises);

  // Process results in order
  results.forEach(({ word, story }) => createSearchResultBlock(word, story, inputVal));
}

// Modified function to fetch story for each word
async function fetchStoryForWord(FIREBASE_URL_PREFIX, word) {
  var firebaseUrl = `${FIREBASE_URL_PREFIX}/${word}.json`;

  try {
    const response = await fetch(firebaseUrl);
    const data = await response.json();
    const story = typeof data !== 'string' ? 'Story not available' : data.replace(/\\n/g, '<br>');
    return { word, story }; // return both word and story
  } catch (error) {
    console.error('Error fetching data for word:', word, error);
    return { word, story: 'Error fetching data' };
  }
}

// Function to create the search result block dynamically
function createSearchResultBlock(word, story, inputVal) {
  var highlightedWord = highlightSubsequence(word, inputVal);
  var searchResults = document.getElementById('searchResults');
  searchResults.innerHTML += `
    <div class="mb-4">
      <span class="highlight">${highlightedWord}</span>
      <p class="story">${story}</p>
    </div>
    <hr class="my-2 h-1 bg-gray-500">`; // Thicker and darker horizontal rule
}

// Function to highlight the subsequence within a word
function highlightSubsequence(word, subsequence) {
  let result = '';
  let subIndex = 0;

  for (let i = 0; i < word.length; i++) {
    if (word[i].toLowerCase() === subsequence[subIndex]?.toLowerCase()) {
      result += `<span class="subsequence">${word[i]}</span>`;
      subIndex++;
    } else {
      result += word[i];
    }
  }

  return result;
}

// Function to update the message in case of an error or notification
function updateMessage(message) {
  var searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = `<p class="story">${message}</p>`;
}

// Event listener for Enter key
document.getElementById('searchInput').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    showMessage();
  }
});



showKeys();
