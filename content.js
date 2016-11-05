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
    var names = {}
    for (var j = 0; j < members.length; j++) {
        if (typeof(members) === 'object') {
            names[members[j]['first_name']] = [
                members[j]['last_name'],
                members[j]['state'],
                members[j]['title']
            ];
        };
    };
    return names;
}

var foundNames = [];

function parseResult(data) {
    for (var i = 0; i < bodyText.length; i++) {
        if (data[bodyText[i]] !== undefined) {
            var names = getMembers(bodyText[i]);
            if (names[bodyText[i-1]] !== undefined) {
                foundNames.push([
                    bodyText[i], // lastname
                    bodyText[i-1], // firstname,
                    names[bodyText[i-1]][1], // state,
                    names[bodyText[i-1]][2] // title
                ]);
            } else if (names[bodyText[i-2]] !== undefined) {
                foundNames.push([
                    bodyText[i], // lastname
                    bodyText[i-2], // firstname,
                    names[bodyText[i-2]][1], // state,
                    names[bodyText[i-2]][2] // title
                ]);
            }

        }
    }
    if (foundNames.length > 1) {
        console.log(foundNames);
        walk(document.body);
    }
    
}


console.log

function walk(node) {
    // thanks to:
    // http://stackoverflow.com/questions/5904914/javascript-regex-to-replace-text-not-in-html-attributes/5904945#5904945
    // and
    // 
    var child, next;

    switch (node.nodeType) {
        case 1:
        case 9:
        case 11:
            child = node.firstChild;
            while (child) {
                next = child.nextSibling;
                walk(child);
                child = next;
            }
            break;
        case 3:
            replaceText(node);
            break;
    }
}

function replaceText(textNode) {

    for (var i = 0; i < foundNames.length; i++) {
        var re = new RegExp(foundNames[i][0], "g");
        textNode.nodeValue = textNode.nodeValue.replace(re, 'A '+foundNames[i][3].toLowerCase()+ ' from '+ foundNames[i][2]);
    }


}


