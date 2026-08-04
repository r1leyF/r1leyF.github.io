const asciiOffSet = 32;
const alphabetSize = 94;

const rotor1Default = new Uint8Array([ 
    77, 50, 45, 63, 19, 22, 81, 92, 78, 15, 82, 55, 34, 48, 11, 17, 43, 41, 56, 83, 61, 7, 52, 71, 32, 67, 80, 6, 44, 31, 42, 
    53, 75, 90, 10, 20, 25, 69, 85, 70, 36, 24, 12, 76, 59, 16, 0, 47, 73, 33, 54, 30, 49, 79, 86, 64, 62, 40, 5, 88, 8, 4, 89,
    35, 66, 37, 18, 28, 13, 26, 58, 46, 93, 29, 87, 14, 60, 68, 74, 27, 1, 38, 72, 3, 21, 65, 2, 51, 23, 39, 57, 9, 91, 84, 
]);
const rotor2Default = new Uint8Array([ 
    57, 41, 67, 15, 32, 74, 11, 19, 90, 60, 37, 68, 76, 84, 72, 62, 64, 21, 24, 52, 88, 2, 4, 82, 46, 23, 81, 69, 30, 18, 40, 
    14, 27, 47, 42, 71, 86, 31, 17, 87, 16, 26, 43, 9, 77, 35, 85, 49, 45, 7, 1, 8, 55, 73, 38, 44, 50, 12, 92, 58, 83, 80, 59, 
    22, 10, 53, 3, 79, 56, 25, 54, 70, 34, 28, 89, 13, 6, 78, 20, 29, 93, 75, 51, 66, 61, 5, 63, 48, 0, 65, 33, 39, 36, 91, 
]);
const rotor3Default = new Uint8Array([ 
    55, 65, 72, 35, 50, 38, 20, 79, 69, 33, 26, 10, 93, 28, 2, 12, 52, 0, 47, 11, 43, 51, 23, 73, 36, 40, 39, 42, 27, 30, 29, 
    83, 78, 32, 44, 80, 82, 22, 87, 86, 13, 57, 3, 19, 74, 31, 85, 34, 77, 53, 45, 46, 17, 14, 71, 92, 21, 8, 56, 59, 70, 58, 
    84, 48, 62, 76, 68, 91, 60, 67, 81, 9, 66, 90, 4, 88, 18, 16, 64, 37, 61, 7, 75, 6, 63, 41, 25, 1, 24, 5, 49, 15, 89, 54, 
]);
const reflector = new Uint8Array([ 
    69, 37, 40, 4, 3, 88, 44, 65, 81, 76, 42, 51, 84, 43, 70, 20, 49, 27, 91, 21, 15, 19, 93, 46, 35, 72, 39, 17, 63, 34, 47, 
    31, 41, 54, 29, 24, 60, 1, 59, 26, 2, 32, 10, 13, 6, 75, 23, 30, 55, 16, 92, 11, 85, 73, 33, 48, 89, 90, 74, 38, 36, 79, 
    86, 28, 80, 7, 77, 67, 87, 0, 14, 82, 25, 53, 58, 45, 9, 66, 83, 61, 64, 8, 71, 78, 12, 52, 62, 68, 5, 56, 57, 18, 50, 22
]);
const plugBoard = new Uint8Array(94);
plugBoard.fill(255);

let rotor1 = new Uint8Array(94);
let rotor2 = new Uint8Array(94);
let rotor3 = new Uint8Array(94);

let rotorsStartPosition = new Uint8Array([0,0,0]);

let rotorsTickCount = new Uint8Array(3);

let p1 = -1;
let p2 = -1;

const plugSet = new Uint8Array([255,255]);

function encryptMessage(){
    // reset the rotors to the defualt settings
    resetRotors();

    // get the text to encrypt from text area
    let message = document.getElementById("text_area").value;

    // the message with are going to return
    let encrypt = "";

    // loop through all characters of orignal message doing cipher to them
    for(let i = 0; i < message.length; i++){
        // get the ascii code for array use
        code = message.charCodeAt(i);
        // if not a letter in range skip it
        if(code < 32 || code > 126) continue;
        // offset it back to 0 for array indexing
        code -= asciiOffSet;
        // plug board
        code = checkPlugBoard(code);
        // rotors
        code = doRotors(code);
        // plug board again
        code = checkPlugBoard(code);
        // make the code a letter again
        code += asciiOffSet;
        // add letter to message
        encrypt += String.fromCharCode(code);
    }

    // change text area value to the encrypted message
    document.getElementById("text_area").value = encrypt;
}
function enterPlugCode(charCode){
    console.log(charCode);

    // set the first plug
    if(plugSet[0] == 255){
        plugSet[0] = charCode;
    }
    // second entry is repeat do nothing
    if(plugSet[0] == charCode) return;

    plugSet[1] = charCode;
    setPlug();
}
function setPlug(){
    // also link the lower case version of this letter
    let otherCharA = plugSet[0] + 32;
    let otherCharB = plugSet[1] + 32;

    // this exact plug exists so remove it
    if(plugBoard[plugSet[0]] != 255 && plugBoard[plugSet[0]] == plugSet[1]){
        plugBoard[plugSet[0]] = 255;
        plugBoard[plugSet[1]] = 255;
        plugBoard[otherCharA] = 255;
        plugBoard[otherCharB] = 255;
    }
    // add the plug
    else{
        // if plug 0 was already set remove it
        if(plugBoard[plugSet[0]] != 255){
            plugBoard[plugBoard[plugSet[0]]] = 255;
            plugBoard[plugBoard[otherCharA]] = 255;
        }
        // if plug 1 was already set remove it
        if(plugBoard[plugSet[1]] != 255){
            plugBoard[plugBoard[plugSet[1]]] = 255;
            plugBoard[plugBoard[otherCharB]] = 255;
        }

        plugBoard[plugSet[0]] = plugSet[1];
        plugBoard[plugSet[1]] = plugSet[0];
        plugBoard[otherCharA] = otherCharB;
        plugBoard[otherCharB] = otherCharA;
    }

    // show the plug text
    let s = "";
    const seen = [];
    // loop through the capital letter
    for(let i = 33; i < 59; i++){
        // no plug skip
        if(plugBoard[i] == 255) continue;
        // alrady added this plug skip
        if(seen.indexOf(i) != -1) continue;

        s += String.fromCharCode(i+asciiOffSet);
        s += String.fromCharCode(plugBoard[i]+asciiOffSet);
        s += "<br>";

        seen.push(plugBoard[i]);
    }
    console.log(s);
    document.getElementById("plug_paragraph").innerHTML = s;

    // clear the plugset
    plugSet.fill(255);
}
function checkPlugBoard(index){
    if(plugBoard[index] == 255) return index;
    return plugBoard[index];
}
function resetRotors(){
    // copy the defaults into the rotors
    rotor1.set(rotor1Default);
    rotor2.set(rotor2Default);
    rotor3.set(rotor3Default);

    // set the start positions
    rotorsStartPosition[0] = document.getElementById("idicator1").value.charCodeAt(0)-asciiOffSet;
    rotorsStartPosition[1] = document.getElementById("idicator2").value.charCodeAt(0)-asciiOffSet;
    rotorsStartPosition[2] = document.getElementById("idicator3").value.charCodeAt(0)-asciiOffSet;

    console.log(rotorsStartPosition[0]);
    console.log(rotorsStartPosition[1]);
    console.log(rotorsStartPosition[2]);

    let maxTick = -1;
    for(let i = 0; i < 3; i++){
        if(maxTick < rotorsStartPosition[i]) maxTick = rotorsStartPosition[i];
        rotorsTickCount[i] = rotorsStartPosition[i];
    }

    let doTick = [true, true, true];
    for(let i = 0; i < maxTick; i++){
        for(let j = 0; j < 3; j++){
            if(i >= rotorsStartPosition[j]) doTick[j] = false;
        }

        let temp = [rotor1[0], rotor2[0], rotor3[0]];
        for(let j = 0; j < alphabetSize-1; j++){
            if(doTick[0]) rotor1[j] = rotor1[j+1];
            if(doTick[1]) rotor2[j] = rotor2[j+1];
            if(doTick[2]) rotor3[j] = rotor3[j+1];
        }

        if(doTick[0]) rotor1[alphabetSize-1] = temp[0];
        if(doTick[1]) rotor2[alphabetSize-1] = temp[1];
        if(doTick[2]) rotor3[alphabetSize-1] = temp[2];
    }
}
function doRotors(index){

    index = rotor1[index];
    index = rotor2[index];
    index = rotor3[index];

    index = reflector[index];

    index = rotor3.indexOf(index);
    index = rotor2.indexOf(index);
    index = rotor1.indexOf(index);

    // do the rotor ticks
    rotorsTickCount[0]++;
    let tickR2 = false;
    let tickR3 = false;

    if(rotorsTickCount[0] > alphabetSize){
        rotorsTickCount[1]++;
        tickR2 = true;
        rotorsTickCount[0] = 0;

        if(rotorsTickCount[1] > alphabetSize){
            rotorsTickCount[2]++;
            tickR3 = true;
            rotorsTickCount[1] = 0;
        }
    }

    let temp = [rotor1[0], rotor2[0], rotor3[0]];
    for(let i = 0; i < alphabetSize-1; i++){
        rotor1[i] = rotor1[i+1];
        if(tickR2) rotor2[i] = rotor2[i+1];
        if(tickR3) rotor3[i] = rotor3[i+1];
    }
    rotor1[alphabetSize-1] = temp[0];
    if(tickR2) rotor2[alphabetSize-1] = temp[1];
    if(tickR3) rotor3[alphabetSize-1] = temp[2];

    return index;
}
function reset(){
    // set start postions to 0
    for(let i = 0; i < 3; i++){
        rotorsStartPosition[i] = 0;
    }
    document.getElementById("idicator1").value = '';
    document.getElementById("idicator2").value = '';
    document.getElementById("idicator3").value = '';

    plugBoard.fill(255);
    document.getElementById("plug_paragraph").innerHTML = "";
}