// Javascript code for the VoxWorld JS web app
// Code by Milk + Github Copilot


/////////////    GLOBAL VARIABLES     //////////////

var BG_COLOR = 0xfafafa;

var TEXTURE_DIR = "textures/";
var DEFAULT_TEXTURE_LIST = ["air","stonebrick","dirt","planks_oak","sand","iron_bars","glass","iron_block","log_oak","wool_colored_red","stone_slab_side"];
var ALL_TEXTURES = [];
var CUR_TEXTURE_LIST = [];  
var CUR_TEXTURE_NUM = 11;
var TEXTURE_PNG = [];  //texture images
var TEXTURE_MAT = [];  //texture materials
var TEXTURE_MAT2 = [];
for(let i=0;i<11;i++){
    TEXTURE_MAT2[i] = new THREE.MeshBasicMaterial({color: 0x0000ff});
}

var CUR_STRUCTURE = [];

var RADIUS = 15;
var ANGLE = 0;
var CENTER_Y = 2;




//////////////      THREE.JS SETUP     ///////////////

var rendCanvas = document.getElementById("renderCanvas");

//set up the canvas
const RENDERER = new THREE.WebGLRenderer({canvas: rendCanvas, antialias: false, preserveDrawingBuffer: true });
RENDERER.setSize(400, 300);
// RENDERER.domElement.id = "renderCanvas";
// document.getElementById("render").appendChild(RENDERER.domElement);

//setup scene and camera
const SCENE = new THREE.Scene();
SCENE.background = new THREE.Color( BG_COLOR ).convertSRGBToLinear();
const CAMERA = new THREE.PerspectiveCamera( 75, rendCanvas.clientWidth / rendCanvas.clientHeight, 0.1, 1000);

//load a texture loader
const loader = new THREE.TextureLoader();

//add a light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
SCENE.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(10, 20, 0); // x, y, z
SCENE.add(directionalLight);

//set the voxel geometry
var VOXEL = new THREE.BoxBufferGeometry( 1, 1, 1 );



//////////////      CCAPTURE SETUP     ///////////////

// Create a capturer that exports an animated GIF
// Notices you have to specify the path to the gif.worker.js 
var capturer = new CCapture( { format: 'gif', workersPath:'js/', name: 'render', framerate: 80, quality:30} );


//////////////     GENERAL FUNCTIONS    ///////////////


//create a downloadable file the data passed
function makeDownload(data,filename){
    //make it a downloadable text
    let file = new Blob([data], {type: 'text/plain'});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        let a = document.createElement("a"),
        url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        //simultate clicking and downloading the link
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}



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

    CUR_TEXTURE_NUM = numTexture;
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
        TEXTURE_MAT[id_num] = new THREE.MeshBasicMaterial({map: TEXTURE_PNG[id_num],transparent: true});
    }else{
        img.src = TEXTURE_DIR + "/air.png";
        TEXTURE_PNG[id_num] = loader.load(TEXTURE_DIR + "/air.png");
        TEXTURE_MAT[id_num] = new THREE.MeshBasicMaterial({map: TEXTURE_PNG[id_num],transparent: true});
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
    TEXTURE_MAT[id] = new THREE.MeshBasicMaterial({map: TEXTURE_PNG[id],transparent: true});
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


//export the texture set to a .txt file
function exportTextureSet(){
    //make the text file
    let text = "";
    for (let i = 0; i < Math.min(CUR_TEXTURE_NUM,CUR_TEXTURE_LIST.length); i++){
        text += CUR_TEXTURE_LIST[i] + "\n";
    }
    let filename = "texture_set.txt";
    makeDownload(text,filename);
}




/////////////  3D STRUCTURE FUNCTIONS  //////////////



//read in the text file and convert it to a 3d structure
function readStructFile(){
    var file = document.getElementById("structFile").files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(){
        try{
            CUR_STRUCTURE = JSON.parse(reader.result);
            localStorage.struct = JSON.stringify(CUR_STRUCTURE);
            let shape = [CUR_STRUCTURE.length,CUR_STRUCTURE[0].length,CUR_STRUCTURE[0][0].length];
            console.log("Imported structure: " + shape);
            document.getElementById("arr3din").value = JSON.stringify(CUR_STRUCTURE);
        }catch(e){
            alert("Error parsing structure file! \nMake sure the file is a .txt file with a valid 3d array.");
            return [];
        }
    }
}

//read in the textarea's input 3d array
function readStructTextArea(text){
    //make sure it is valid json
    try {
        CUR_STRUCTURE = JSON.parse(text);
        localStorage.struct = JSON.stringify(CUR_STRUCTURE);
        let shape = [CUR_STRUCTURE.length,CUR_STRUCTURE[0].length,CUR_STRUCTURE[0][0].length];
        console.log("Imported structure: " + shape);
    } catch (e) {
        console.log("cannot parse array: " + text);
        alert("Invalid 3d structure! \nMake sure the text input is a 3D array of integers.");
        return [];
    }
}



/////////////  STRUCT + TEXTURE FUNCTIONS  //////////////


//import both the structure and the texture set from a json file
function importFullJSON(){
    var file = document.getElementById("fullJSONFile").files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(){
        //parse the json
        try{
            var data = JSON.parse(reader.result);
            console.log(data)
            readStructTextArea(data.structure);
            CUR_TEXTURE_LIST = data.texture_set;
            localStorage.struct = JSON.stringify(CUR_STRUCTURE);
            localStorage.tex_list = JSON.stringify(CUR_TEXTURE_LIST);

            //update the texture list
            makeTextures(CUR_TEXTURE_LIST.length,true);

            //update the structure
            if(CUR_STRUCTURE.length > 0){
                document.getElementById("arr3din").value = JSON.stringify(CUR_STRUCTURE);
                make3dStructure(CUR_STRUCTURE);
            }
        }catch(e){
            console.log(e);
            alert("Invalid JSON file! \nMake sure the file is a .json file with 'structure' and 'texture_set' data.");
        }
    }
}

//export both the structure and the texture set to a .json file
function exportFullJSON(){
    //make the json file
    let dat = {
        "structure": JSON.stringify(CUR_STRUCTURE),
        "texture_set": CUR_TEXTURE_LIST
    }
    let text = JSON.stringify(dat, null, 3);
    let filename = "full_set.json";
    makeDownload(text,filename);
}




////////////     RENDERING FUNCTIONS    ////////////



//make the structure given a 3d array
//represented as x,y,z in the 3d array
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
    let def_off = [0.5,0.5,0.5];
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
                    let cube = new THREE.Mesh( VOXEL, TEXTURE_MAT[arr3d[i][j][k]] );
                    cube.position.set(i+off[0]-structCen[0],structDim[1]-j+off[1],k+off[2]-structCen[2]);
                    structObj.add(cube);
                }
            }
        }
    }
    console.log("Rendering structure!");

    //move the camera up some to account for new height
    CENTER_Y = Math.max(2,structCen[1]);
    document.getElementById("heightView").value = CENTER_Y;
    document.getElementById("heightViewVal").value = CENTER_Y;
    
    // resetCamera();
    rotateCam(ANGLE,CENTER_Y,RADIUS)

    //add the structure to the scene
    SCENE.add(structObj);

}

//export the canvas as a png
function exportPNG(){
    let filename = "vox_struct.png";
    let data = RENDERER.domElement.toDataURL("image/png");

    //make a fake image to download
    let img = document.createElement("img");
    img.width = rendCanvas.width;
    img.height = rendCanvas.height;
    img.src = data;
    img.style.display = "none";
    document.body.appendChild(img);
    
    //make a custom image download
    let a = document.createElement("a");
    a.href = img.src;
    a.download = filename;
    document.body.appendChild(a);

    //simultate clicking and downloading the link
    a.click();
    setTimeout(function() {
        //remove the fake image and link
        document.body.removeChild(a);
        document.body.removeChild(img);
    }, 0); 
    
}

//export the rotation of the building as a gif
let RPS = 6;   //rotations per second
let ROT_INT = (360*RPS)/1000  //rotation interval
var rot_gif_int = 0;
function exportGIF(){
    //reset the rotation
    ANGLE = 0;
    rotateCam(ANGLE,CENTER_Y,RADIUS);

    //Rotate the camera around the structure
    rot_gif_int = setInterval(function(){
        ANGLE = (ANGLE + ROT_INT) % 360;
        
        //rotate the camera
        CAMERA.position.x = RADIUS * Math.cos( ANGLE * (Math.PI/180) );  
        CAMERA.position.z = RADIUS * Math.sin( ANGLE * (Math.PI/180) ); 
        CAMERA.lookAt(0,CENTER_Y,0);
    },1)

    capturer.start();

    // set a timeout before saving the gif (1 second)
    setTimeout(function(){
        capturer.stop();
        capturer.save();
        clearInterval(rot_gif_int);
        rot_gif_int = 0;
        console.log("GIF saved!");
    },1000);
}





//reset the camera's angle and position
function resetCamera(){
    ANGLE = 180;
    RADIUS = 10;

    //update the inputs
    updateSliders();


    rotateCam(ANGLE,CENTER_Y,RADIUS)
}

//rotate the camera around the structure
function rotateCam(angle,height,radius){
    CAMERA.position.y = height;
    CAMERA.position.x = radius * Math.cos( angle * (Math.PI/180) );  
    CAMERA.position.z = radius * Math.sin( angle * (Math.PI/180) ); 
    CAMERA.lookAt(0,height,0);

    //update localstorages to import when the page is reloaded
    localStorage.angle = ANGLE;
    localStorage.radius = RADIUS;
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
    else if(id.includes("height"))
        CENTER_Y = value;

    //update the camera
    rotateCam(ANGLE,CENTER_Y,RADIUS);
}
function changeSlidePos(id, value){
    //update the values
    var pos = document.getElementById(id);
    pos.value = value;
    if(id.includes("angle"))
        ANGLE = value;
    else if(id.includes("zoom"))
        RADIUS = value;
    else if(id.includes("height"))
        CENTER_Y = value;

    //update the camera
    rotateCam(ANGLE,CENTER_Y,RADIUS);

}

//update the sliders with the current set values
function updateSliders(){
    document.getElementById("angleView").value = ANGLE;
    document.getElementById("angleViewVal").value = ANGLE;
    document.getElementById("zoomView").value = RADIUS;
    document.getElementById("zoomViewVal").value = RADIUS;
}


//make the structure on startup if the textures are loaded
let init_tries = 0;
function initStruct(){
    //don't try more than 10 times
    if(init_tries>10)
        return;

    //check if the textures are loaded
    for(let i = 0; i < TEXTURE_PNG.length; i++){
        //not finished loading
        if(TEXTURE_PNG[i] == null){
            init_tries++;
            setTimeout(initStruct,500);
            return;
        }
    }
    //finished loading
    make3dStructure(CUR_STRUCTURE);
}


//initial function for the app
function init(){
    //set default selected texture
    CUR_TEXTURE_LIST = (localStorage.tex_list ? JSON.parse(localStorage.tex_list) : DEFAULT_TEXTURE_LIST);
    document.getElementById("numTextures").value = CUR_TEXTURE_LIST.length;
    CUR_TEXTURE_NUM = CUR_TEXTURE_LIST.length

    //import the textures
    importTextures();

    //set default structure and render if exists
    CUR_STRUCTURE = (localStorage.struct ? JSON.parse(localStorage.struct) : []);
    if(CUR_STRUCTURE.length > 0){
        document.getElementById("arr3din").value = JSON.stringify(CUR_STRUCTURE);
        setTimeout(initStruct,500); //load the last structure if available
    }

    //import the camera angle and zoom 
    ANGLE = (localStorage.angle ? localStorage.angle : 180);
    RADIUS = (localStorage.radius ? localStorage.radius : 10);
    updateSliders();
    rotateCam(ANGLE,CENTER_Y,RADIUS);
}

//animation loop and rendering
function main(){
    requestAnimationFrame( main );
    RENDERER.render( SCENE, CAMERA );
    if(rot_gif_int != 0)
        capturer.capture( RENDERER.domElement );
}

main();