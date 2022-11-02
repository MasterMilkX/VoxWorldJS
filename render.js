// HEADLESS VERSION OF THE INTERACTIVE CODE THAT MAKES IMAGES AND GIFS OF PASSED JSON DATA
// Input: JSON data => { "structure": str (3d int array of the structure), "textures" : [str list] (texture names) }

//imports
var fs = require('fs');
global.THREE = require('three');
const { createCanvas } = require('canvas')

//parameters
var TEXTURE_DIR = "./textures/";
var IMG_OUTPUT = "./offline_json_sets/imgs/"
var GIF_OUTPUT = "./offline_json_sets/gifs/"

var RADIUS = 15;
var ANGLE = 0;
var CENTER_Y = 2;

CUR_TEXTURE_LIST = []
CUR_STRUCTURE = []
var DEFAULT_TEXTURE_LIST = ["air","stonebrick","dirt","planks_oak","sand","iron_bars","glass","iron_block","log_oak","wool_colored_red","stone_slab_side"];


//////////////      THREE.JS SETUP     ///////////////

var rendCanvas = createCanvas(400,300)

//set up the canvas
// const RENDERER = new THREE.WebGLRenderer({canvas: rendCanvas, antialias: false, preserveDrawingBuffer: true });
const RENDERER = new THREE.CanvasRenderer({canvas: rendCanvas, antialias: false, preserveDrawingBuffer: true });
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


///////////////    THREE.JS FUNCTIONS     ///////////////


//parse the JSON data for the structure
function setupStruct(data){
    //parse the json
    try{
        //use new textures
        if(data.texture_set != undefined){
            CUR_TEXTURE_LIST = data.texture_set;
            for(var i = 0; i < CUR_TEXTURE_LIST.length; i++){
                CUR_TEXTURE_LIST[i] = TEXTURE_DIR + CUR_TEXTURE_LIST[i] + ".png";
            }
        }
        //use default textures if none are passed and not already loaded
        else if(CUR_TEXTURE_LIST.length == 0){
            console.log("> WARNING: No texture set provided, using default");
            CUR_TEXTURE_LIST = DEFAULT_TEXTURE_LIST;
            for(var i = 0; i < CUR_TEXTURE_LIST.length; i++){
                CUR_TEXTURE_LIST[i] = TEXTURE_DIR + CUR_TEXTURE_LIST[i] + ".png";
            }
        }
        
        //add structure
        CUR_STRUCTURE = JSON.parse(data.structure);

        console.log("> JSON data parsed successfully!");
        return 1;
    }
    //ERROR OCCURED
    catch(e){
        console.log(e);
        console.log("> ERROR: Invalid data! \n> Make sure the file is a .json file with 'structure' and 'texture_set'\n Values for 'structure' must be a stringified 3d integer array and 'texture_set' data must be a list of strings.");
        return 0;
    }
}

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
                    let geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
                    let  material = new THREE.MeshBasicMaterial({map: TEXTURE_PNG[arr3d[i][j][k]] ,transparent: true});
                    let cube = new THREE.Mesh( geometry, material );
                    cube.position.set(i+off[0]-structCen[0],structDim[1]-j+off[1],k+off[2]-structCen[2]);
                    structObj.add(cube);
                }
            }
        }
    }
    console.log("Rendering structure!");

    //move the camera up some to account for new height
    CENTER_Y = Math.max(2,structCen[1]);
    
    // resetCamera();
    rotateCam(ANGLE,CENTER_Y,RADIUS)

    //add the structure to the scene
    SCENE.add(structObj);

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
}

/////////////   EXPORTING FUNCTIONS   //////////////


//export the canvas as a png
function exportPNG(filename){
    //render the scene
    RENDERER.render(SCENE, CAMERA);

    let im_data = RENDERER.domElement.toDataURL("image/png");

    // strip off the data: url prefix to get just the base64-encoded bytes
    const data = im_data.replace(/^data:image\/\w+;base64,/, "");

    // write to a file
    const buf = Buffer.from(data, "base64");
    fs.writeFile(filename, buf);
    
}

//export the rotation of the building as a gif
// let RPS = 6;   //rotations per second
// let ROT_INT = (360*RPS)/1000  //rotation interval
// var rot_gif_int = 0;
// function exportGIF(){
//     //reset the rotation
//     ANGLE = 0;
//     rotateCam(ANGLE,CENTER_Y,RADIUS);

//     //Rotate the camera around the structure
//     rot_gif_int = setInterval(function(){
//         ANGLE = (ANGLE + ROT_INT) % 360;
        
//         //rotate the camera
//         CAMERA.position.x = RADIUS * Math.cos( ANGLE * (Math.PI/180) );  
//         CAMERA.position.z = RADIUS * Math.sin( ANGLE * (Math.PI/180) ); 
//         CAMERA.lookAt(0,CENTER_Y,0);
//     },1)

//     capturer.start();

//     // set a timeout before saving the gif (1 second)
//     setTimeout(function(){
//         capturer.stop();
//         capturer.save();
//         clearInterval(rot_gif_int);
//         rot_gif_int = 0;
//         console.log("GIF saved!");
//     },1000);
// }



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
    for(let s=0;s<STRUCTURE_LIST.length;s++){
        //parse the structure data
        if(!setupStruct(STRUCTURE_LIST[s])){
            console.log(`> ERROR: Invalid structure data for structure ${s}! Skipping...`);
            continue
        }

        //render the structure (to a secret canvas)
        // exportPNG(`${IMG_OUTPUT}struct_${s}.png`);

    }
    

}


main();