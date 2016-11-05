//content.js

var xhr = new XMLHttpRequest();
xhr.open("GET", chrome.extension.getURL("congress.json"), true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    data = JSON.parse(xhr.responseText);
    parseResult(data);
  }
}
xhr.send();

bodyText = $('body').text().split(' ');

function getMembers(lastname) {
    var members = data[lastname]
    var firstnames = []
    for (var j = 0; j < members.length; j++) {
        firstnames.push(members[j]['first_name']);
    }
    return firstnames;
}

function parseResult(data) {
    for (var i = 0; i < bodyText.length; i++) {
        if (data[bodyText[i]] !== undefined) {
            var firstNames = getMembers(bodyText[i]);
            for (var n = 0; n < firstNames.length; n++) {
                if (bodyText[i-1] === firstNames[n] || bodyText[i-2] === firstNames[n]) {
                    console.log(firstNames[n]+' '+bodyText[i]);
                }
            }
        }
    }
}

