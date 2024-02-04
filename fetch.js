function showMessage() {
  var inputVal = document.getElementById('searchInput').value.toLowerCase();
  inputVal = inputVal.replace(/[^a-zA-Z]/g, '');
  var FIREBASE_URL_PREFIX = 'https://etymolofly-default-rtdb.europe-west1.firebasedatabase.app'
  var firebaseUrl = `${FIREBASE_URL_PREFIX}/${inputVal}.json`;
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
