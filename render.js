// HEADLESS VERSION OF THE INTERACTIVE CODE THAT MAKES IMAGES AND GIFS OF PASSED JSON DATA
// Input: JSON data => { "structure": str (3d int array of the structure), "textures" : [str list] (texture names), ("id": int, "angle": int (0-359), "zoom": int, "height":int, "offset": [float list]) }

//imports
const fs = require('fs');
const THREE = require('three');
const GIFEncoder = require('gifencoder');
const {createCanvas, loadImage} = require('./js/node-canvas-webgl');
const { exit } = require('process');

//parameters
var BG_COLOR = 0xfafafa;
var CANV_WIDTH = 400;
var CANV_HEIGHT = 300;

var TEXTURE_DIR = "./textures/";
var TEXTURE_PNG = [];
var TEXT_MAT = [];
var TEXT_LOAD = [];

var RADIUS = 15;
var ANGLE = 0;
var CENTER_Y = 2;

var RENDER_DELAY = 500;
var EXPORT_DELAY = 100;
var RPS = 0.7;  //rotations per second for the model GIF output

CUR_TEXTURE_LIST = []
CUR_STRUCTURE = []
var DEFAULT_TEXTURE_LIST = ["air","stonebrick","dirt","planks_oak","sand","iron_bars","glass","iron_block","log_oak","wool_colored_red","stone_slab_side"];


var OUTMODE = "PNG";
var OUTPUT_DIR = `./output_${OUTMODE}/`;

//////////////      THREE.JS SETUP     ///////////////

const rendCanvas = createCanvas(CANV_WIDTH, CANV_HEIGHT);

//set up the canvas
const RENDERER = new THREE.WebGLRenderer({canvas: rendCanvas, antialias: false, preserveDrawingBuffer: true});
RENDERER.setSize(400, 300);
// RENDERER.domElement.id = "renderCanvas";
// document.getElementById("render").appendChild(RENDERER.domElement);

//setup scene and camera
const SCENE = new THREE.Scene();
SCENE.background = new THREE.Color( BG_COLOR ).convertSRGBToLinear();
const CAMERA = new THREE.PerspectiveCamera( 75, rendCanvas.clientWidth / rendCanvas.clientHeight, 0.1, 1000);

//load a texture loader
var loader = new THREE.TextureLoader(  );
loader.crossOrigin = true;

//add a light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
SCENE.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(10, 20, 0); // x, y, z
SCENE.add(directionalLight);

//set cube geometry to use as voxels
let VOXEL = new THREE.BoxGeometry( 1, 1, 1 );


///////////////    THREE.JS FUNCTIONS     ///////////////


//parse the JSON data for the structure
function setupStruct(full_data,id){
    //get the structure data
    let data = full_data[id];
    console.log(" ------- STRUCTURE #" + id + " ------- ");

    //parse the structure json
    console.log("> GETTING STRUCTURE...");
    try{
        //add structure
        CUR_STRUCTURE = JSON.parse(data.structure);
    //ERROR OCCURED
    }catch(e){
        console.log(e);
        console.log("> ERROR: Invalid data for #" + id + "! \n> Make sure the file is a .json file with 'structure' and 'texture_set'\n Values for 'structure' must be a stringified 3d integer array and 'texture_set' data must be a list of strings.");
        console.log("Skipping...")
        setupStruct(full_data,id+1);
    }

    // //parse the texture json
    // console.log("> GETTING TEXTURES...");
    // // use new textures
    // if(data.texture_set != undefined){
    //     CUR_TEXTURE_LIST = data.texture_set;
    //     importTextureID(full_data,id,0);
    // }
    // //use default textures if none are passed and not already loaded
    // else if(CUR_TEXTURE_LIST.length == 0){
    //     console.log("> WARNING: No texture set provided, using default");
    //     CUR_TEXTURE_LIST = DEFAULT_TEXTURE_LIST;
    //     importTextureID(full_data,id,0);
    // }
    // //all textures already loaded
    // else{
    //     console.log("> Using previously loaded textures");
    //     make3dStructure(full_data,id,CUR_STRUCTURE);
    // }


    //make it just blue cubes
    CUR_TEXTURE_LIST = ["air"];
    TEXT_MAT = [];
    for(let i = 0; i < 16; i++){
        CUR_TEXTURE_LIST.push("blue");
        TEXT_MAT.push(new THREE.MeshBasicMaterial({color: 0x0000ff}));
    }
    make3dStructure(full_data,id,CUR_STRUCTURE);
    
}

//import the textures and materials based on the texture list
// function importAllTextures(){
//     TEXT_LOAD = new Array(CUR_TEXTURE_LIST.length).fill(false);  //thanks copilot!
//     for(var i = 0; i < CUR_TEXTURE_LIST.length; i++){
//         // TEXTURE_PNG[i] = loader.load(TEXTURE_DIR + "/" + CUR_TEXTURE_LIST[i] + ".png");
//         // TEXTURE_PNG[i].onLoad = function(){TEXT_LOAD[i] = true;}

//         //load the texture as raw data 
//         let filename = TEXTURE_DIR + CUR_TEXTURE_LIST[i] + ".png"
//         loadImage(filename).then((image) => {
//             console.log("> Loaded texture: " + filename);
//             TEXTURE_PNG[i] = new THREE.DataTexture( image, image.width, image.height );
//             TEXT_LOAD[i] = true;
//             TEXT_MAT[i] = new THREE.MeshBasicMaterial({map: TEXTURE_PNG[i] ,transparent: true});
//         })
        
//     }
// }

//import a particular texture image from the texture list then render
function importTextureID(full_data,struct_id,id){
    //load the texture as raw data 
    let filename = TEXTURE_DIR + CUR_TEXTURE_LIST[id] + ".png"
    loadImage(filename).then((image) => {
        console.log("> Loaded texture #" + id + ": " + filename);
        TEXTURE_PNG[id] = new THREE.DataTexture( image, image.width, image.height );
        TEXT_LOAD[id] = true;
        TEXT_MAT[id] = new THREE.MeshBasicMaterial({map: TEXTURE_PNG[id] ,transparent: true});

        //finished loading textures, so continue
        if(id == CUR_TEXTURE_LIST.length -1){
            console.log("> All textures loaded!");
            console.log("> JSON data parsed successfully!");
            make3dStructure(full_data,struct_id,CUR_STRUCTURE);
        }
        //load the next texture
        else{
            importTextureID(full_data,struct_id,id+1);
        }
    })
}

//make the structure given a 3d array
//represented as x,y,z in the 3d array
function make3dStructure(full_data,struct_id,arr3d,offset=[0,0,0]){
    //check if a structure was passed
    if(arr3d == null || arr3d.length == 0){
        alert("No structure to render!\nPlease import a structure or paste one in the textarea to the right.");
        return;
    }

    //remove any previous structures
    while(SCENE.children.length > 0){ 
        SCENE.remove(SCENE.children[0]); 
    }

    if(full_data[struct_id].offset != undefined){
        offset = full_data[struct_id].offset;
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
                    let cube = new THREE.Mesh( VOXEL, TEXT_MAT[arr3d[i][j][k]] );
                    cube.position.set(i+off[0]-structCen[0],structDim[1]-j+off[1],k+off[2]-structCen[2]);
                    structObj.add(cube);
                }
            }
        }
    }

    //move the camera up some to account for new height
    CENTER_Y = Math.max(2,structCen[1]);
    // resetCamera();

    //use parameters to set the camera position if they exist
    if(full_data[struct_id].angle != undefined){
        ANGLE = full_data[struct_id].angle;
    }
    if(full_data[struct_id].zoom != undefined){
        RADIUS = full_data[struct_id].zoom;
    }
    if(full_data[struct_id].height != undefined){
        CENTER_Y = full_data[struct_id].height;
    }
    rotateCam(ANGLE,CENTER_Y,RADIUS)
    customCam();

    //add the structure to the scene
    SCENE.add(structObj);

    //render the scene
    RENDERER.render(SCENE, CAMERA);


    //wait some time, then export it
    let filename = (full_data[struct_id].id ? `${full_data[struct_id].id}` : `structure_${struct_id}`);
    setTimeout(function(){
        if(OUTMODE == "PNG"){
            exportPNG(full_data,struct_id,`${OUTPUT_DIR}/${filename}.png`);
        }
    },RENDER_DELAY);


}

//reset the camera's angle and position
function resetCamera(){
    ANGLE = 180;
    RADIUS = 10;

    rotateCam(ANGLE,CENTER_Y,RADIUS)
}

function customCam(){
    ANGLE = 245;
    RADIUS = 15;

    rotateCam(ANGLE,6,RADIUS)
}

//rotate the camera around the structure
function rotateCam(angle,height,radius){
    CAMERA.position.y = height;
    CAMERA.position.x = radius * Math.cos( angle * (Math.PI/180) );  
    CAMERA.position.z = radius * Math.sin( angle * (Math.PI/180) ); 
    CAMERA.lookAt(0,height,0);
}

/////////////   EXPORTING FUNCTIONS   //////////////


//export the canvas as a png
var load_tries = 0;
function exportPNG(full_data,struct_id,filename){
    //set the canvas to the size of the structure
    // resetCamera();

    // //check if all textures are loaded, and repeat if not
    // if(load_tries < 10 && !TEXT_LOAD.every((val) => val == true)){
    //     console.log("> WARNING: Not all textures are loaded, trying again in 1 second");
    //     load_tries++;
    //     setTimeout(function(){exportPNG(filename);},1000);
    //     return;
    // }
    // //too many tries to load
    // if(load_tries >= 10){
    //     console.log("> ERROR: Not all textures are loaded, cannot export");
    //     return;
    // }

    

    

    let im_data = RENDERER.domElement.toDataURL("image/png");

    // strip off the data: url prefix to get just the base64-encoded bytes
    const data = im_data.replace(/^data:image\/\w+;base64,/, "");

    // write to a file
    const buf = Buffer.from(data, "base64");
    fs.writeFileSync(filename, buf);

    console.log("> Exported PNG to " + filename);
    console.log("")
    

    //FINISHED! do the next structure
    setTimeout(function(){
        if(struct_id < full_data.length -1){
            setupStruct(full_data,struct_id+1);
        }else{
            console.log("-------------------------------------------")
            console.log("> Finished exporting all structures!");
            process.exit(0);
        }
    },EXPORT_DELAY);
}




///////////////    MAIN FUNCTION    ///////////////

// main execution function
function main(){

    ///// IMPORT THE JSON DATA /////

    //read arguments from command line
    const args = process.argv.slice(2);

    //no json file provided - so exit
    if(args.length < 1){
        console.log("Please provide a JSON file to render!");
        process.exit(1);
    }

    //get as PNG output or GIF output (default = PNG)
    OUTMODE = "PNG";
    if (args.length > 1){
        OUTMODE = args[1];
    }

    //get output directory for the preview files
    OUTPUT_DIR = `./output_${OUTMODE}`;
    if(args.length > 2){
        OUTPUT_DIR = args[2];
    }
    if (!fs.existsSync(OUTPUT_DIR)){
        fs.mkdirSync(OUTPUT_DIR);
    }

    //parse the JSON data to the texture list and structure
    var jfile = fs.readFileSync(args[0], 'utf8')
    try{
        var data = JSON.parse(jfile);
    }catch(e){
        console.log("> ERROR: Invalid JSON file!");
        process.exit(1);
    }

    ///// RENDER EACH STRUCTURE /////
    let STRUCTURE_LIST = data.structure_set;

    //start with #0 then iterate through each
    let struct_id = 0;
    setupStruct(STRUCTURE_LIST,struct_id);


    // for(let s=0;s<STRUCTURE_LIST.length;s++){
    //     console.log(`----- STRUCTURE ${s} -----`)

    //     //parse the structure data
    //     if(!setupStruct(STRUCTURE_LIST[s])){
    //         console.log(`> ERROR: Invalid structure data for structure ${s}! Skipping...`);
    //         continue
    //     }

    //     //wait until everything is loaded
    //     while(!TEXT_LOAD.every((val) => val == true)){
    //         console.log("> WARNING: Not all textures are loaded, trying again in 1 second");
    //         console.log(TEXT_LOAD);
    //         await sleep(1000);
    //     }

    //     //render the structure (to a secret canvas)
    //     console.log(`Rendering and exporting PNG.`);
    //     if(outMode == "PNG"){
    //         let filename = (STRUCTURE_LIST[s].id ? `${STRUCTURE_LIST[s].id}` : `structure_${s}`);
    //         exportPNG(`${OUTPUT_DIR}/${filename}.png`);
    //     }
    //     console.log("")
    // }
    
    // console.log(TEXT_LOAD);
    // console.log(TEXTURE_PNG)

}

main();