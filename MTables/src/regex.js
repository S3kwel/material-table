/**
 * Matches:
 * 1. function(something)
 * 2. function(something())
 * 3. any level of nesting seen in 2. 
 * 
 * Does not match:
 * 1. function()
 * 
 * Capture Groups:
 * 1. Function name w/o parens.
 * 2. Whatever was passed into parens.  
 * */

const func = {
    expression: /([a-zA-Z_{1}][a-zA-Z0-9_]*)(?=\()\(([\*\(\)a-zA-Z_{1}][\(\)a-zA-Z0-9_]*)\)/g,
    labels: ['name', 'params'] 
}
const regex = {
    "func": func
};


function parse(r, string) {
    let reg = ''; 
    if (regex[r]) { reg = regex[r].expression; }
    else { return []; }

    let results = reg.exec(string);
    results.splice(0,1); 
    
    //If labels exist for this expression and the results match the expected length
    if (regex[r].labels && regex[r].labels.length == results.length) {
        let newResults = {};
        if (results == null) {
            return newResults; 
        }

        for (let label of regex[r].labels) {
            newResults[label] = results[regex[r].labels.indexOf(label)]; 
        }
        results = newResults; 
    }

    else if (results == null) {
        results = []; 
    }
    return results; 
}


const REGEXP = {
    parse: parse,
    ...regex
}


export default REGEXP; 





