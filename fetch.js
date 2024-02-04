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
  var FIREBASE_URL_PREFIX = 'https://etymolofly-default-rtdb.europe-west1.firebasedatabase.app';
  var firebaseKeysUrl = `${FIREBASE_URL_PREFIX}/_KEYS.json`;

  // Check if keys are already in Local Storage
  var storedKeys = localStorage.getItem('etymoloKeys');

  if (storedKeys) {
    document.getElementById('keysResult').value = storedKeys;
  } else {
    // Fetch keys from Firebase if not in Local Storage
    fetch(firebaseKeysUrl)
      .then(response => response.json())
      .then(data => {
        if (typeof data === 'string') {
          // Store keys in Local Storage
          document.getElementById('keysResult').value = data;
          storeKeysLocally(data);
        } else {
          document.getElementById('keysResult').value = 'Invalid data received.';
        }
      })
      .catch(error => {
        console.error('Error fetching _KEYS:', error);
        document.getElementById('keysResult').value = 'Error fetching _KEYS';
      });
  }
}

// Function to handle the search and display the result
function showMessage() {
  var inputVal = document.getElementById('searchInput').value.toLowerCase();
  inputVal = inputVal.replace(/[^a-zA-Z]/g, '');
  var FIREBASE_URL_PREFIX = 'https://etymolofly-default-rtdb.europe-west1.firebasedatabase.app'

  // Find subsequence words based on the user input
  list_of_words = localStorage.getItem('etymoloKeys');
  const subsequenceWords = findSubsequenceWords(inputVal, list_of_words.split(','));

  // Use the first word from the subsequence words as the word for Firebase URL
  var wordForFirebaseUrl = subsequenceWords.length > 0 ? subsequenceWords[0] : '';

  var firebaseUrl = `${FIREBASE_URL_PREFIX}/${wordForFirebaseUrl}.json`;

  fetch(firebaseUrl)
    .then(response => response.json())
    .then(data => {
      if (data === null || (typeof data === 'object' && Object.keys(data).length === 0)) {
        // Handle the case where the word does not exist
        document.getElementById('message').innerText = 'Uups: The word has not yet been added to the Etymolo database.';
      } else if (typeof data === 'string') {
        var formattedData = data.replace(/\\n/g, '<br>');
        document.getElementById('message').innerHTML = formattedData;
      } else {
        var formattedData = JSON.stringify(data, null, 2)
          .replace(/\\n/g, '<br>')
          .replace(/\\"/g, '&quot;');
        document.getElementById('message').innerHTML = formattedData;
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      document.getElementById('message').innerText = 'Error fetching data';
    });
}

// Event listener for Enter key
document.getElementById('searchInput').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    showMessage();
  }
});
