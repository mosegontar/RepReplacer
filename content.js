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


function walk(node) {
    // thanks to:
    // http://stackoverflow.com/questions/5904914/javascript-regex-to-replace-text-not-in-html-attributes/5904945#5904945
    // and
    // http://mattpic.com/talks/chrome-extensions
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


    function replaceInstance(rule) {
        var re = RegExp(rule[0], "g")
        textNode.nodeValue = textNode.nodeValue.replace(re, rule[1]);
    }

    textNode.nodeValue = textNode.nodeValue.replace(/Sen\./g, 'Senator');
    textNode.nodeValue = textNode.nodeValue.replace(/U\.S\. Senator/g, 'Senator');
    textNode.nodeValue = textNode.nodeValue.replace(/Republican Senator/g, 'Senator');
    textNode.nodeValue = textNode.nodeValue.replace(/Democratic Senator/g, 'Senator');        
    textNode.nodeValue = textNode.nodeValue.replace(/Rep\./g, 'Representative');
    textNode.nodeValue = textNode.nodeValue.replace(/\(D-.+\)/g, '');
    textNode.nodeValue = textNode.nodeValue.replace(/\(R-.+\)/g, '');
    textNode.nodeValue = textNode.nodeValue.replace(/\(D\)/g, '');
    textNode.nodeValue = textNode.nodeValue.replace(/\(R\)/g, '');

    for (var i = 0; i < foundNames.length; i++) {

        var lastname = foundNames[i][0];
        var firstname = foundNames[i][1];
        var state = foundNames[i][2];
        var titles = foundNames[i][3];

        function getRules(title) {
            var replacement = 'a '+title.toLowerCase()+ ' from ' +state
            var rules = [
                [state+' '+title+' '+firstname+' '+lastname, replacement],
                ['Incumbent '+title+' '+firstname+' '+lastname, replacement],
                [title+' '+firstname+' '+lastname, replacement],
                ['Republican '+firstname+' '+lastname, replacement],
                ['Democrat '+firstname+' '+lastname, replacement],
                ['Republican '+title+' '+firstname+' '+lastname, replacement],
                ['Democratic '+title+' '+firstname+' '+lastname, replacement],                
                [firstname+' '+lastname, replacement],
                [lastname, 'the '+state+' '+title.toLowerCase()],
            ] 
            return rules;           
        }

        for (var t = 0; t < titles.length; t++) {
            var rules = getRules(titles[t]);
            for (var r = 0; r < rules.length; r ++) {
                replaceInstance(rules[r]);
            };
        }
    }

    textNode.nodeValue = textNode.nodeValue.replace(/^\S/g, function(x){return x.toUpperCase();});

}