const userLetters = ["","","","",""];
var targetWord = "QWERT";
var currLetter = 0;
var currRow = 0;

const flipSpeed = 450;
const flipDelay = 100;
const dialog = document.getElementById("dialog");

var words;
var useWords = true;

var shareString = "";

async function loadDictionary() {
  const response = await fetch("dictionPlus.txt");
  if(!response.ok) {return;}
  words = (await response.text()).split("\r\n");
}

window.onload = () => init();

async function init(){
    dialog.close();
    await loadDictionary();
    // randomize word
    targetWord = randomWord();
}

function randomWord(){
    rLetters = ["","","","",""];

    // gnerate a random letters till no real word is produced
    do{
        // generate 5 random letters
        for(var i = 0; i < 5; i++){
            rChar = Math.floor(Math.random() * (90 - 65) ) + 65;
            rLetters[i] = String.fromCharCode(rChar);
        }
    }
    while(words.indexOf(rLetters.join("")) != -1);

    return rLetters.join("");
}

function addLetter(ch){
    if(currLetter > 4) {return};
    el = document.getElementById(`letter_${currRow}${currLetter}`)
    el.value = ch;
    el.style.animation = "pop 100ms";
    el.style.border = "1px solid black"
    userLetters[currLetter] = ch;
    currLetter++;
}

async function check(){
    // if not all letters filled early exit, cant do anything
    if(currLetter < 5) {return};

    // if words were read in make sure its not a word
    if(words.length > 0 && words.indexOf(userLetters.join("")) != -1){
        el = document.getElementById("err");
        animate(el, "disappear", 1500);
        animate(document.getElementById(`row${currRow}`),"shake",300);
        return;
    }

    const letters = targetWord.split("");

    for(let i = 0; i < 5; i++){
        el = document.getElementById(`letter_${currRow}${i}`);
        key = document.getElementById(userLetters[i]);
        if(letters[i] == userLetters[i]){
            el.style.animation = `flipCorrect ${flipSpeed+(flipDelay*i)}ms ease ${flipDelay*i}ms forwards`;
            key.style.backgroundColor = "rgb(106, 170, 100)";
            letters[i] = "";
            shareString += "🟩";
        }
        else if(letters.indexOf(userLetters[i]) != -1){
            el.style.animation = `flipAlmost ${flipSpeed+(flipDelay*i)}ms ease ${flipDelay*i}ms forwards`;
            key.style.backgroundColor = "rgb(201,180,88)";
            letters[letters.indexOf(userLetters[i])] = "";
            shareString += "🟨";
        }
        else{
            el.style.animation = `flipWrong ${flipSpeed+(flipDelay*i)}ms ease ${flipDelay*i}ms forwards`;
            key.style.backgroundColor = "rgb(120, 124, 126)";
            shareString += "⬜";
        }
        key.style.color = "white";
    }
    shareString += "\n";
    await wait(flipSpeed+flipDelay*4);

    // guess was right
    if(targetWord == userLetters.join("")){
        // animate jumping letters
        for(var i = 0; i < 5; i++){
            el = document.getElementById(`letter_${currRow}${i}`);
            el.style.backgroundColor = "rgb(106, 170, 100)";
            el.style.color = "white";
            el.style.border = "none";
            el.style.animation = `jump 300ms ease ${flipDelay*i}ms both`;
        }
        await wait(300+flipDelay*4);
        ShowResults(true);
        return;
    }
    // move to next row
    currLetter = 0;
    currRow++;

    // if last row game over
    if(currRow > 5){
        ShowResults(false);
    }
}

function deleteLetter(){
    if(currLetter == 0) {return};
    currLetter--;
    el = document.getElementById(`letter_${currRow}${currLetter}`);
    el.value = " ";
    el.style.border = "1px solid rgb(211, 214, 218)";
    el.style.animation = "none";
}

async function ShowResults(win){
    var shareHeader = `🎲Notawordle🎲\nword: ${targetWord}\n`;
    if(win) {shareHeader += `${currRow+1}/6\n`;}
    shareString = shareHeader + shareString;

    document.getElementById("resultTitle").innerHTML = (win ? "Sublime🤩" : "Unforturnate😬");
    document.getElementById("resultText").value = shareString;

    dialog.showModal();
    // unfocus the text area
    dialog.focus({ focusVisible: false });

    dialog.style.animation = "appear 100ms both";
    await wait(100);
    document.getElementById("app").style.display = "none";
}

async function animate(element, animName, time){
    // set element to animation
    element.style.animation = `${animName} ${time}ms`;
    // wait for animation to be done
    await wait(time);
    element.style.animation = "none";
}
async function wait(time){
    await new Promise((done) => setTimeout(done, time*1.2));
}

// -- event listeners --
// listeners for ui buttons
for(let i = 65; i <= 90; i++){
    document.getElementById(String.fromCharCode(i)).addEventListener("click", function(){addLetter(String.fromCharCode(i))});
}
document.getElementById("enter").addEventListener("click", function(){check()});
document.getElementById("back").addEventListener("click", function(){deleteLetter()});

// listener for keyboard presses
document.addEventListener("keydown", function (event) {

  if(event.code[0] == 'K'){
    addLetter(event.code[3]);
  }
  else if(event.code == "Enter"){
    check();
  }
  else if(event.code == "Backspace"){
    deleteLetter();
  }
});

document.getElementById("copyButton").addEventListener("click", function(){
    navigator.clipboard.writeText(shareString);
    document.getElementById("copyButton").innerHTML = "Copied!";
});
document.getElementById("replayButton").addEventListener("click", function(){window.location.reload();});