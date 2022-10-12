// Javascript code for the VoxWorld JS web app
// Code by Milk + Github Copilot



/////////////    TEXTURE FUNCTIONS    //////////////


//create a new dropdown texture item
var ALL_TEXTURES = [];
var CUR_TEXTURE_LIST = [];  

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
        makeTextures();
    });
}

//make dropdowns of the textures
function makeTextures(numTexture=10){
    var textureSet = document.getElementById("texturekey");
    textureSet.innerHTML = "";  //clear out previous texture rows if any

    //make more rows of textures
    for (var i = 0; i < numTexture; i++){
        //make a new row
        let trow = makeTextureRow(i);
        textureSet.appendChild(trow);
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
        img.src = "textures/" + CUR_TEXTURE_LIST[id_num] + ".png";
    }else{
        img.src = "textures/air.png";
    }

    imgCol.appendChild(img);
    row.appendChild(imgCol);

    return row
}

//change the texture ID's name and image based on the dropdown selection
function changeTexture(dd){
    var id = dd.id.split("_")[2];
    var img = document.getElementById("tex_img_"+id);
    img.src = "textures/"+dd.value+".png";
    CUR_TEXTURE_LIST[id] = dd.value;
    localStorage.tex_list = JSON.stringify(CUR_TEXTURE_LIST);
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
    CUR_TEXTURE_LIST = (localStorage.tex_list ? JSON.parse(localStorage.tex_list) : ["air","stone","dirt","grass_side","planks_oak","sand","leaves_oak","glass","iron_block","log_oak","rail_normal","stone_slab_side"]);

    importTextures();
}