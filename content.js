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
                members[j]['title'],
                members[j]['institution']
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
                    names[bodyText[i-1]][2], // title
                    names[bodyText[i-1]][3]
                ]);
            } else if (names[bodyText[i-2]] !== undefined) {
                foundNames.push([
                    bodyText[i], // lastname
                    bodyText[i-2], // firstname,
                    names[bodyText[i-2]][1], // state,
                    names[bodyText[i-2]][2], // title
                    names[bodyText[i-2]][3] // intitution
                ]);
            } 
        }
    }
    if (foundNames.length > 1) {
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
        if (rule === undefined) {return};
        var re = RegExp(rule[0], "g");
        textNode.nodeValue = textNode.nodeValue.replace(re, rule[1]);
    }

    var initialRules = [
        [/Sen\./, 'Senator'],
        [/U\.S\. Senator/, 'Senator'],
        [/Republican Senator/, 'Senator'],
        [/Democratic Senator/, 'Senator'],
        [/Rep\./, 'Representative'],
        [/\(D-.+\)/, ''],
        [/\(R-.+\)/, ''],
        [/\(D\)/, ''],
        [/\(R\)/, ''],
        [/Democrats/, 'members of one of the two major political parties'],
        [/Dems/, 'members of one of the two major political parties'],
        [/Republicans/, 'members of one of the two major political parties'],
        [/GOP/, 'members of one of the two major political parties'],
        [/Mrs\./, 'Misses'],
        [/Mr\./, 'Mister']
    ];

    for (var ir = 0; ir < initialRules.length; ir++) {
        replaceInstance(initialRules[ir]);
    };

    for (var i = 0; i < foundNames.length; i++) {

        var lastname = foundNames[i][0];
        var firstname = foundNames[i][1];
        var state = foundNames[i][2];
        var titles = foundNames[i][3];
        var institution = foundNames[i][4];

        function getRules(title) {

            var congressReplacement = 'a '+title.toLowerCase()+ ' from ' +state;
            var presCandReplacement = 'one of the presidential candidates';
            var presidentReplacement = 'the President of the United States';
            var vpReplacement = 'the Vice President of the United States';

            
            var congressRules = [
                [state+' '+title+' '+firstname+' '+lastname, congressReplacement],
                ['Incumbent '+title+' '+firstname+' '+lastname, congressReplacement],
                [title+' '+firstname+' '+lastname, congressReplacement],
                ['Republican '+firstname+' '+lastname, congressReplacement],
                ['Democrat '+firstname+' '+lastname, congressReplacement],
                ['Republican '+title+' '+firstname+' '+lastname, congressReplacement],
                ['Democratic '+title+' '+firstname+' '+lastname, congressReplacement],                
                [firstname+' '+lastname, congressReplacement],
                [lastname, 'the '+state+' '+title.toLowerCase()],
            ];

            var presCandRules = [
                ['The '+lastname, "The candidate's"],
                ['Democratic candidate '+firstname+' '+lastname, presCandReplacement],
                ['Republican candidate '+firstname+' '+lastname, presCandReplacement],                                        
                ['Democratic presidential candidate '+firstname+' '+lastname, presCandReplacement],
                ['Republican presidential candidate '+firstname+' '+lastname, presCandReplacement]                
                [title+' '+lastname, presCandReplacement],
                [title+' '+firstname+' '+lastname, presCandReplacement],
                [firstname+' '+lastname, presCandReplacement],
                [lastname, presCandReplacement],
                [title+' '+presCandReplacement, presCandReplacement],
                ['The '+presCandReplacement] // Fix any uncaught,
            ];

            var presidentRules = [
                [firstname+' '+lastname, presidentReplacement],            
                [title+' '+lastname, presidentReplacement],
                [title+' '+firstname+' '+lastname, presidentReplacement],
                [lastname, presidentReplacement],
                [title+' '+presidentReplacement, presidentReplacement]
            ];

            var vpRules = [
                [firstname+' '+lastname, vpReplacement],            
                [title+' '+lastname, vpReplacement],
                [title+' '+firstname+' '+lastname, vpReplacement],
                [lastname, vpReplacement],
                [title+' '+vpReplacement, vpReplacement]
            ]; 

            switch (institution) {
                case 'presidential candidate':

                case 'president':
                case 'vice president':
                case 'house':
                case 'senate':
            }           

            if (institution === 'presidential candidate') {
                rules = presCandRules;
            } else if (institution === 'president') {
                rules = presidentRules;
            } else if (institution === 'vice president') {
                rules = vpRules;
            } else {
                rules = congressRules;
            };

            return rules;           
        }
        if (titles === undefined) {return};
        for (var t = 0; t < titles.length; t++) {
            var rules = getRules(titles[t]);
            for (var r = 0; r < rules.length; r ++) {
                replaceInstance(rules[r]);
            };
        }
    }

    var endRules = [
        [/Democrats/, 'one of the major US political parties'],
        [/Democratic/, 'one of the major US political parties']
        [/Republicans/, 'one of the major US political parties'],
        [/Republican/, 'one of the major US political parties'],          
        [/^\S/, function(x){return x.toUpperCase();}],
        [/Misses/, 'Mrs\.'],
        [/Mister/, 'Mr\.']
    ]

    for (var er = 0; er < endRules.length; er++) {
        replaceInstance(endRules[er]);
    }; 
}