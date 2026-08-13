const asciiOffSet = 65;
const alphabetSize = 26;

const rotor1Default = new Uint8Array([ 4, 10, 12, 5, 11, 6, 3, 16, 21, 25, 13, 19, 14, 22, 24, 7, 23, 20, 18, 15, 0, 8, 1, 17, 2, 9, ]); // rotor I Enigma I
const rotor2Default = new Uint8Array([ 0, 9, 3, 10, 18, 8, 17, 20, 23, 1, 11, 7, 22, 19, 12, 2, 16, 6, 25, 13, 15, 24, 5, 21, 14, 4, ]); // rotro II Enigma I
const rotor3Default = new Uint8Array([ 1, 3, 5, 7, 9, 11, 2, 15, 17, 19, 23, 21, 25, 13, 24, 4, 8, 22, 6, 0, 10, 12, 20, 18, 16, 14, ]); // rotor III Enigma I
const reflector = new Uint8Array([ 24, 17, 20, 7, 16, 18, 11, 3, 15, 23, 13, 6, 14, 10, 12, 8, 4, 1, 5, 25, 2, 22, 21, 9, 0, 19, ]);

const plugBoard = new Uint8Array(26);
plugBoard.fill(255);

let rotor1 = new Uint8Array(26);
let rotor2 = new Uint8Array(26);
let rotor3 = new Uint8Array(26);

const rotor1Notch = 16; // Q rotor I rollover
const rotor2Notch = 4; // E rotot II rollover

let rotorsStartPosition = new Uint8Array([0,0,0]);

let rotorsTickCount = new Uint8Array(3);

const plugSet = new Uint8Array([255,255]);

function encryptMessage(){
    // reset the rotors to the defualt settings
    resetRotors();

    // get the text to encrypt from text area
    let message = document.getElementById("text_area").value;

    // the message with are going to return
    let encrypt = "";

    // loop through all characters of orignal message doing cipher to them
    count = 1;
    for(let i = 0; i < message.length; i++){
        // get the ascii code for array use
        code = message.charCodeAt(i);
        // if not a letter in range skip it
        if(code <= 122 && code >= 97) code -= 32;
        else if(code < 65 || code > 90) continue;
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
    // this exact plug exists so remove it
    if(plugBoard[plugSet[0]] != 255 && plugBoard[plugSet[0]] == plugSet[1]){
        plugBoard[plugSet[0]] = 255;
        plugBoard[plugSet[1]] = 255;
    }
    // add the plug
    else{
        // if plug 0 was already set remove it
        if(plugBoard[plugSet[0]] != 255) plugBoard[plugBoard[plugSet[0]]] = 255;
        // if plug 1 was already set remove it
        if(plugBoard[plugSet[1]] != 255) plugBoard[plugBoard[plugSet[1]]] = 255;

        plugBoard[plugSet[0]] = plugSet[1];
        plugBoard[plugSet[1]] = plugSet[0];
    }

    // show the plug text
    let s = "";
    const seen = [];
    // loop through the capital letter
    for(let i = 0; i < alphabetSize; i++){
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