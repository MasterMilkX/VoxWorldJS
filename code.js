// Javascript code for the VoxWorld JS web app
// Code by Milk + Github Copilot


/////////////    GLOBAL VARIABLES     //////////////


var TEXTURE_DIR = "textures/";
var DEFAULT_TEXTURE_LIST = ["air","stone","dirt","planks_oak","sand","leaves_oak","glass","iron_block","log_oak","rail_normal","stone_slab_side"];
var ALL_TEXTURES = [];
var CUR_TEXTURE_LIST = [];  

var CUR_STRUCTURE = [];

/////////////  3D STRUCTURE FUNCTIONS  //////////////

//import the 3d structure from the txt file
function txt2array(txt){
    var arr = JSON.parse(txt);
    return arr;
}

//read in the text file and convert it to a 3d structure
function readStructFile(){
    var file = document.getElementById("structFile").files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(){
        CUR_STRUCTURE = txt2array(reader.result);
        let shape = [CUR_STRUCTURE.length,CUR_STRUCTURE[0].length,CUR_STRUCTURE[0][0].length];
        console.log("Imported structure: " + shape);
    }
}

//read in the textarea's input 3d array
function readStructTextArea(ta){
    var text = ta.value;
    //make sure it is valid json
    try {
        JSON.parse(text);
    } catch (e) {
        return false;
    }
    
    CUR_STRUCTURE = txt2array(text);
    let shape = [CUR_STRUCTURE.length,CUR_STRUCTURE[0].length,CUR_STRUCTURE[0][0].length];
    console.log("Imported structure: " + shape);
}


/////////////    TEXTURE FUNCTIONS    //////////////



//import the list of textures from the JSON file (textures.json)
function importTextures(){
    // var request = new XMLHttpRequest();
    // request.open("GET", "textures.json", false);
    // request.send(null);
    // ALL_TEXTURES = JSON.parse(request.responseText).textures;
    // console.log(ALL_TEXTURES);
    fetch('./textures.json')
    .then((response) => response.json())
    .then((json) =>  {
        ALL_TEXTURES = json.textures;
        console.log(ALL_TEXTURES.length);
        makeTextures(CUR_TEXTURE_LIST.length);
    });
}

//make dropdowns of the textures
function makeTextures(numTexture=10,scroll=false){
    //keep the number of textures between 2 and 100
    numTexture = Math.min(Math.max(numTexture,2),100);   //copilot is a gotdamn genius (and a telepath)

    var textureSet = document.getElementById("texturekey");
    textureSet.innerHTML = "";  //clear out previous texture rows if any

    //make more rows of textures
    for (var i = 0; i < numTexture; i++){
        //make a new row
        let trow = makeTextureRow(i);
        textureSet.appendChild(trow);
    }

    //scroll to the bottom of the div to see the latest texture
    if(scroll){
        textureSet.scrollTop = textureSet.scrollHeight;
    }
}

//makes a texture row to select from
function makeTextureRow(id_num){
    //make a new row object
    let row = document.createElement("div");
    row.className = "tex_row";
    row.id = "tex_row_" + id_num;

    //make an id column
    let idCol = document.createElement("div");
    idCol.className = "tex_id";
    idCol.innerHTML = id_num;
    row.appendChild(idCol);

    //make a selection column
    let selCol = document.createElement("div");
    selCol.className = "tex_name";
    let sel = document.createElement("select");
    sel.id = "tex_select_" + id_num;
    sel.className = "tex_select";
    sel.onchange = function(){changeTexture(sel)};
    
    //add the texture options
    for (var i = 0; i < ALL_TEXTURES.length; i++){
        var option = document.createElement("option");
        option.value = ALL_TEXTURES[i];
        option.innerHTML = ALL_TEXTURES[i];
        sel.appendChild(option);
    }

    //set the value of the dropdown
    if(id_num < CUR_TEXTURE_LIST.length){
        sel.value = CUR_TEXTURE_LIST[id_num];
    }else{
        sel.value = "air";
    }
    selCol.appendChild(sel);
    row.appendChild(selCol);

    //make an image column
    let imgCol = document.createElement("div");
    imgCol.className = "tex_img";
    let img = document.createElement("img");
    img.id = "tex_img_" + id_num;

    //set the src
    if(id_num < CUR_TEXTURE_LIST.length){
        img.src = TEXTURE_DIR + "/" + CUR_TEXTURE_LIST[id_num] + ".png";
    }else{
        img.src = TEXTURE_DIR + "/air.png";
    }

    imgCol.appendChild(img);
    row.appendChild(imgCol);

    return row
}

//change the texture ID's name and image based on the dropdown selection
function changeTexture(dd){
    var id = dd.id.split("_")[2];
    var img = document.getElementById("tex_img_"+id);
    img.src = TEXTURE_DIR+"/"+dd.value+".png";
    CUR_TEXTURE_LIST[id] = dd.value;
    localStorage.tex_list = JSON.stringify(CUR_TEXTURE_LIST);
}   

//read the texture list from the input and parse them to the new list
function readTextureFile(){
    var file = document.getElementById("textureFile").files[0];
    var reader = new FileReader();
    reader.onload = function(e){
        var text = this.result;
        var lines = text.split("\n");
        if(lines.length > 0){
            CUR_TEXTURE_LIST = [];
            for (var i = 0; i < lines.length; i++){
                if(lines[i].length > 0){
                    let t = lines[i] != "" ? lines[i] : "air";
                    CUR_TEXTURE_LIST.push(t);
                }
            }
            makeTextures(CUR_TEXTURE_LIST.length,true);
        }else{
            alert("No textures found in file! Make sure the file is a .txt file with one texture name per line.");
        }
    }
    reader.readAsText(file);
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
    //set default selected texture
    CUR_TEXTURE_LIST = (localStorage.tex_list ? JSON.parse(localStorage.tex_list) : DEFAULT_TEXTURE_LIST);
    document.getElementById("numTextures").value = CUR_TEXTURE_LIST.length;

    //import the textures
    importTextures();
}