const dialog = document.getElementById("art_dialog");
const art = document.getElementById("view");
const closeBut = document.getElementById("close_button");

function showArt(el){
    /*
    art.src = "";
    art.src = el.getAttribute("src");
    */
    art.setAttribute("class", `viewImage ${el.getAttribute("class")}`)
    dialog.showModal();
    dialog.focus({ focusVisible: false });
}
closeBut.addEventListener("click", function(){dialog.close();})