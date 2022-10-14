// Javascript code for the VoxWorld JS web app
// Code by Milk + Github Copilot


/////////////    GLOBAL VARIABLES     //////////////


var TEXTURE_DIR = "textures/";
var DEFAULT_TEXTURE_LIST = ["air","stone","dirt","planks_oak","sand","leaves_oak","glass","iron_block","log_oak","rail_normal","stone_slab_side"];
var ALL_TEXTURES = [];
var CUR_TEXTURE_LIST = [];  
var TEXTURE_PNG = [];

var CUR_STRUCTURE = [];

var RADIUS = 10;
var ANGLE = 0;


//////////////      THREE.JS SETUP     ///////////////

//set up the canvas
const SCENE = new THREE.Scene();
SCENE.background = new THREE.Color( 0xfafafa ).convertSRGBToLinear();
const CAMERA = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const RENDERER = new THREE.WebGLRenderer();
RENDERER.setSize(400, 300);
RENDERER.domElement.id = "renderCanvas";
document.getElementById("render").appendChild(RENDERER.domElement);

//load a texture loader
const loader = new THREE.TextureLoader();

//add a light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
SCENE.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(10, 20, 0); // x, y, z
SCENE.add(directionalLight);



/////////////    TEXTURE FUNCTIONS    //////////////



//import the list of textures from the JSON file (textures.json)
function importTextures(){
    fetch('./'+ TEXTURE_DIR +'textures.json')
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
        TEXTURE_PNG[id_num] = loader.load(TEXTURE_DIR + "/" + CUR_TEXTURE_LIST[id_num] + ".png");
    }else{
        img.src = TEXTURE_DIR + "/air.png";
        TEXTURE_PNG[id_num] = loader.load(TEXTURE_DIR + "/air.png");
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
    TEXTURE_PNG[id] = loader.load(TEXTURE_DIR+"/"+dd.value+".png");
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



/////////////  3D STRUCTURE FUNCTIONS  //////////////

//import the 3d structure from the txt file
function txt2array(txt){
    try{
        var arr = JSON.parse(txt);
        return arr;
    }catch(error){
        alert("Invalid file! \nMake sure the file is a .txt file with a 3D array of integers.");
        return [];
    }
    
}

//read in the text file and convert it to a 3d structure
function readStructFile(){
    var file = document.getElementById("structFile").files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(){
        CUR_STRUCTURE = txt2array(reader.result);
        localStorage.struct = JSON.stringify(CUR_STRUCTURE);
        let shape = [CUR_STRUCTURE.length,CUR_STRUCTURE[0].length,CUR_STRUCTURE[0][0].length];
        console.log("Imported structure: " + shape);
        document.getElementById("arr3din").value = JSON.stringify(CUR_STRUCTURE);
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
    localStorage.struct = JSON.stringify(CUR_STRUCTURE);
    let shape = [CUR_STRUCTURE.length,CUR_STRUCTURE[0].length,CUR_STRUCTURE[0][0].length];
    console.log("Imported structure: " + shape);
}



////////////     RENDERING FUNCTIONS    ////////////



//make the structure given a 3d array
//represented as y,x,z in the 3d array
function make3dStructure(arr3d,offset=[0,0,0]){
    //check if a structure was passed
    if(arr3d == null || arr3d.length == 0){
        alert("No structure to render!\nPlease import a structure or paste one in the textarea to the right.");
        return;
    }

    //remove any previous structures
    while(SCENE.children.length > 0){ 
        SCENE.remove(SCENE.children[0]); 
    }

    //default offset
    let def_off = [0.5,-0.5,0.5];
    // let def_off = [-0.5,0.5,0.5];
    let off = [offset[0]+def_off[0],offset[1]+def_off[1],offset[2]+def_off[2]];

    //get the structure properties
    let structDim = [arr3d.length, arr3d[0].length, arr3d[0][0].length]; //w,h,d
    let structCen = [structDim[0]/2, structDim[1]/2, structDim[2]/2]; //x,y,z

    //build the structure
    let structObj = new THREE.Group();
    for(let i = 0; i < arr3d.length; i++){
        for(let j = 0; j < arr3d[i].length; j++){
            for(let k = 0; k < arr3d[i][j].length; k++){
                if(CUR_TEXTURE_LIST[arr3d[i][j][k]] != "air"){
                    let geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
                    let  material = new THREE.MeshBasicMaterial({map: TEXTURE_PNG[arr3d[i][j][k]],transparent: true});
                    let cube = new THREE.Mesh( geometry, material );
                    cube.position.set(j+off[0]-structCen[1],structDim[0]-i+off[1],k+off[2]-structCen[2]);  //top down of the array (reverse y)
                    structObj.add(cube);
                }
            }
        }
    }
    console.log("Rendering structure!");

    //add the structure to the scene
    SCENE.add(structObj);
    
}

//reset the camera's angle and position
function resetCamera(){
    CAMERA.position.set(0,5,RADIUS);
    CAMERA.lookAt(0,5,0);
}

//rotate the camera around the structure
function rotateCam(angle,radius=10){
    CAMERA.position.x = radius * Math.cos( angle * (Math.PI/180) );  
    CAMERA.position.z = radius * Math.sin( angle * (Math.PI/180) ); 
    CAMERA.lookAt(0,5,0);
}


//change the values of the angle and zoom
function changeSlideVal(id, value) {
    //update the value
    var label = document.getElementById(id);
    label.value = value;
    if(id.includes("angle"))
        ANGLE = value;
    else if(id.includes("zoom"))
        RADIUS = value;

    //update the camera
    rotateCam(ANGLE,RADIUS);
}
function changeSlidePos(id, value){
    //update the values
    var pos = document.getElementById(id);
    pos.value = value;
    if(id.includes("angle"))
        ANGLE = value;
    else if(id.includes("zoom"))
        RADIUS = value;

    //update the camera
    rotateCam(ANGLE,RADIUS);

}



//initial function for the app
function init(){
    //set default selected texture
    CUR_TEXTURE_LIST = (localStorage.tex_list ? JSON.parse(localStorage.tex_list) : DEFAULT_TEXTURE_LIST);
    document.getElementById("numTextures").value = CUR_TEXTURE_LIST.length;

    //import the textures
    importTextures();

    //set default structure and render if exists
    CUR_STRUCTURE = (localStorage.struct ? JSON.parse(localStorage.struct) : []);
    if(CUR_STRUCTURE.length > 0){
        document.getElementById("arr3din").value = JSON.stringify(CUR_STRUCTURE);
        make3dStructure(CUR_STRUCTURE);
    }

    //reset the camera
    resetCamera();
}


//animation loop and rendering
function main(){
    requestAnimationFrame( main );
    RENDERER.render( SCENE, CAMERA );
}

main();