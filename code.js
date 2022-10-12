// Javascript code for the VoxWorld JS web app
// Code by Milk + Github Copilot



/////////////    TEXTURE FUNCTIONS    //////////////


//create a new dropdown texture item
var ALL_TEXTURES = [];
var CUR_TEXTURE_LIST = [];

//import the list of textures from the JSON file (textures.json)
function importTextures(){
    var request = new XMLHttpRequest();
    request.open("GET", "textures.json", false);
    request.send(null);
    ALL_TEXTURES = JSON.parse(request.responseText);
    // console.log(ALL_TEXTURES);
    makeTextures();
}

//make dropdowns of the textures
function makeTextures(numTexture=10){
    



}
//change the texture ID's name and image
function changeTexture(){

}


////////////     RENDERING FUNCTIONS    ////////////


//change the values of the angle and zoom
function changeSlideVal(id, value) {
    var label = document.getElementById(id);
    label.value = value;
}
function changeSlidePos(id, value){
    var pos = document.getElementById(id);
    pos.value = value;
}



//initial function for the app
function init(){
    console.log("Hello world!");
    importTextures();
}