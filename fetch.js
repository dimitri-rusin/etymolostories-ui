function showMessage() {
  var inputVal = document.getElementById('searchInput').value;
  var firebaseUrl = 'https://etymolofly-default-rtdb.europe-west1.firebasedatabase.app/' + inputVal + '.json';

  fetch(firebaseUrl)
    .then(response => response.json())
    .then(data => {
      // Check if data is a string and not an object or other type
      if (typeof data === 'string') {
        // Replace \n with <br> for proper paragraph formatting
        var formattedData = data.replace(/\\n/g, '<br>');
        document.getElementById('message').innerHTML = formattedData;
      } else {
        // Handle non-string data (e.g., objects or arrays)
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
