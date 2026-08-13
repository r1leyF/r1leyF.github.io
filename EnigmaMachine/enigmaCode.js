const asciiOffSet = 32;
const alphabetSize = 95;

const rotor1Default = new Uint8Array([ 
    40, 70, 13, 81, 76, 77, 84, 86, 30, 38, 36, 6, 32, 43, 46, 2, 69, 54, 52, 82, 15, 14, 39, 78, 66, 87, 67, 10, 79, 44, 31, 
    88, 65, 8, 48, 22, 12, 26, 11, 74, 62, 16, 3, 94, 71, 58, 55, 37, 49, 18, 21, 19, 20, 41, 60, 29, 0, 89, 85, 27, 42, 24, 23, 
    7, 34, 50, 90, 92, 28, 73, 33, 51, 75, 47, 93, 57, 68, 72, 80, 5, 64, 17, 45, 59, 53, 63, 4, 9, 56, 35, 61, 25, 1, 83, 91, 
]);
const rotor2Default = new Uint8Array([ 
    11, 65, 23, 10, 22, 64, 2, 91, 5, 37, 48, 9, 84, 33, 81, 29, 40, 7, 13, 47, 28, 3, 93, 79, 12, 26, 87, 76, 39, 46, 67, 27, 
    83, 45, 53, 75, 34, 31, 4, 80, 68, 16, 30, 58, 18, 1, 82, 92, 44, 49, 14, 57, 0, 94, 77, 78, 6, 25, 55, 85, 61, 63, 89, 20, 
    56, 59, 21, 86, 24, 69, 52, 60, 50, 19, 54, 41, 51, 32, 42, 15, 88, 62, 36, 72, 8, 43, 90, 38, 71, 35, 66, 73, 74, 17, 70, 
]);
const rotor3Default = new Uint8Array([ 
    42, 81, 72, 61, 62, 11, 30, 90, 74, 23, 43, 94, 49, 21, 7, 33, 78, 80, 70, 17, 13, 67, 35, 59, 77, 16, 34, 1, 38, 9, 12, 0, 
    40, 19, 46, 50, 75, 51, 41, 56, 47, 55, 26, 25, 88, 54, 8, 32, 39, 69, 73, 27, 87, 15, 76, 24, 66, 65, 28, 29, 4, 63, 85, 
    58, 82, 20, 91, 83, 68, 6, 86, 53, 84, 60, 22, 79, 31, 37, 45, 3, 92, 93, 57, 48, 2, 44, 14, 52, 18, 89, 10, 36, 5, 71, 64, 
]);
const reflector = new Uint8Array([ 
    51, 24, 40, 44, 48, 79, 88, 84, 17, 19, 11, 10, 33, 92, 39, 42, 47, 8, 46, 9, 91, 71, 75, 83, 1, 36, 89, 82, 72, 70, 67, 32,
    31, 12, 62, 90, 25, 66, 65, 14, 2, 45, 15, 64, 3, 41, 18, 16, 4, 74, 52, 0, 50, 59, 63, 77, 68, 76, 86, 53, 93, 78, 34, 54, 
    43, 38, 37, 30, 56, 69, 29, 21, 28, 85, 49, 22, 57, 55, 61, 5, 87, 81, 27, 23, 7, 73, 58, 80, 6, 26, 35, 20, 13, 60, 94, 
]);
const plugBoard = new Uint8Array(95);
plugBoard.fill(255);

let rotor1 = new Uint8Array(95);
let rotor2 = new Uint8Array(95);
let rotor3 = new Uint8Array(95);

const rotor1Notch = 24; // completly arbitrary notches
const rotor2Notch = 57;

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

    document.getElementById("plug_paragraph").innerHTML = s;

    // clear the plugset
    plugSet.fill(255);
}
function checkPlugBoard(index){
    if(plugBoard[index] == 255) return index;
    return plugBoard[index];
}
function tickRotorStart(rotorNum, add){

    rotorsStartPosition[rotorNum] += add;
    if(rotorsStartPosition[rotorNum] == 255) rotorsStartPosition[rotorNum] = alphabetSize-1;
    else if(rotorsStartPosition[rotorNum] == alphabetSize) rotorsStartPosition[rotorNum] = 0;

    switch(rotorNum){
        case 0:
            document.getElementById("idicator1").value = String.fromCharCode(rotorsStartPosition[0] + asciiOffSet);
            break;
        case 1:
            document.getElementById("idicator2").value = String.fromCharCode(rotorsStartPosition[1] + asciiOffSet);
            break;
        case 2:
            document.getElementById("idicator3").value = String.fromCharCode(rotorsStartPosition[2] + asciiOffSet);
            break;
    }
}
function resetRotors(){
    // set the start positions
    rotorsStartPosition[0] = document.getElementById("idicator1").value.charCodeAt(0)-asciiOffSet;
    rotorsStartPosition[1] = document.getElementById("idicator2").value.charCodeAt(0)-asciiOffSet;
    rotorsStartPosition[2] = document.getElementById("idicator3").value.charCodeAt(0)-asciiOffSet;

    // copy defualts into rotors with the start offset
    for(let i = 0; i < alphabetSize; i++){
        rotor1[i] = rotor1Default[(i+rotorsStartPosition[0])%alphabetSize];
        rotor2[i] = rotor2Default[(i+rotorsStartPosition[1])%alphabetSize];
        rotor3[i] = rotor3Default[(i+rotorsStartPosition[2])%alphabetSize];
    }

    rotorsTickCount[0] = rotorsStartPosition[0];
    rotorsTickCount[1] = rotorsStartPosition[1];
    rotorsTickCount[2] = rotorsStartPosition[2];
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
    let tickR2 = false;
    let tickR3 = false;

    rotorsTickCount[0]++;
    if(rotorsTickCount[0] == alphabetSize) rotorsTickCount[0] = 0;

    if(rotorsTickCount[0] == rotor1Notch){
        tickR2 = true;
        rotorsTickCount[1]++;
        if(rotorsTickCount[1] == alphabetSize) rotorsTickCount[1] = 0;

        if(rotorsTickCount[1] == rotor2Notch){
            tickR3 = true;
            rotorsTickCount[2]++;
            if(rotorsTickCount[2] == alphabetSize) rotorsTickCount[2] = 0;
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