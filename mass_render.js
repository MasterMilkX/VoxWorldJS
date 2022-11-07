// HEADLESS VERSION OF THE INTERACTIVE CODE THAT MAKES IMAGES AND GIFS OF PASSED JSON DATA
// KIND OF HACKY - STRINGS TOGETHER THE STEPS OF THE FUNCTIONS (BECAUSE OF THE IMPORTING TEXTURES CAUSING ASYNC ISSUES)
// Written by: Milk

// Input: JSON data => { "structure": str (3d int array of the structure), "textures" : [str list] (texture names), ("id": int, "angle": int (0-359), "distance": int, "height":double, "offset": [float list]) }


//imports
const fs = require('fs');
const THREE = require('three');
const GIFEncoder = require('gifencoder');
const {createCanvas, loadImage} = require('./js/node-canvas-webgl');
const { exit } = require('process');
const yaml = require('js-yaml');



//default parameters (can be changed in the config.yaml file and overwritten)
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
var DEF_ANGLE = 180;
var DEF_RADIUS = 15;
var DEF_CENTER_Y = 2;
var use_struct_center = false;

var RENDER_DELAY = 50;   //how long to wait (ms) after attempting to render the structure onto the canvas 
var EXPORT_DELAY = 10;   //how long to wait (ms) after exporting the image file before going to the next structure
var GIF_FRAMES = 30;
var FRAME_DELAY = 1;
var CLOCKWISE = true;

var CUR_TEXTURE_LIST = []
var CUR_STRUCTURE = []
var DEFAULT_TEXTURE_LIST = ["air","stonebrick","dirt","planks_oak","sand","iron_bars","glass","iron_block","log_oak","wool_colored_red","stone_slab_side"];


var OUTMODE = "PNG";
var OUTPUT_DIR = `./output_${OUTMODE}/`;
var PARENT_OUT_DIR = ".";


// import the config file and overwrite the default parameters if they exist
let configCont = fs.readFileSync('./config.yaml', 'utf8');
let config = yaml.load(configCont);

//overwrite the default parameters if they exist in the config file
function parseConfig(){
    if(config["BG_COLOR"] != undefined)
        BG_COLOR = config["BG_COLOR"];
    if(config["CANV_WIDTH"] != undefined)
        CANV_WIDTH = config["CANV_WIDTH"];
    if(config["CANV_HEIGHT"] != undefined)
        CANV_HEIGHT = config["CANV_HEIGHT"];
    if(config["TEXTURE_DIR"] != undefined)
        TEXTURE_DIR = config["TEXTURE_DIR"];
    if(config["DEFAULT_TEXTURES"] != undefined)
        DEFAULT_TEXTURE_LIST = config["DEFAULT_TEXTURES"];
    if(config["RADIUS"] != undefined)
        DEF_RADIUS = config["RADIUS"];
    if(config["ANGLE"] != undefined)
        DEF_ANGLE = config["ANGLE"];
    if(config["CENTER_Y"] != undefined)
        DEF_CENTER_Y = config["CENTER_Y"];
    if(config["RENDER_DELAY"] != undefined)
        RENDER_DELAY = config["RENDER_DELAY"];
    if(config["EXPORT_DELAY"] != undefined)
        EXPORT_DELAY = config["EXPORT_DELAY"];
    if(config["GIF_FRAMES"] != undefined)
        GIF_FRAMES = config["GIF_FRAMES"];
    if(config["FRAME_DELAY"] != undefined)
        FRAME_DELAY = config["FRAME_DELAY"];
    if(config["CLOCKWISE"] != undefined)
        CLOCKWISE = config["CLOCKWISE"];
    if(config["OUTMODE"] != undefined)
        OUTMODE = config["OUTMODE"];
    if(config["OUTPUT_DIR"] != undefined)
       PARENT_OUT_DIR = config["OUTPUT_DIR"];
}


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


//////////////   OTHER SETUP  ///////////////

var encoder = new GIFEncoder(CANV_WIDTH, CANV_HEIGHT);



///////////////    THREE.JS + STRUCTURE FUNCTIONS     ///////////////


//parse the JSON data for the structure
function setupStruct(full_data,id){
    //get the structure data
    let data = full_data[id];
    if(data.id == undefined)
        console.log(" ------- STRUCTURE #" + id + " ------- ");
    else
        console.log(" ------- STRUCTURE #" + id + " (" +data.id + ") ------- ");

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
    console.log("> GETTING TEXTURES...");
    // use new textures
    if(data.texture_set != undefined){
        CUR_TEXTURE_LIST = data.texture_set;
        importTextureID(full_data,id,0);
    }
    //use default textures if none are passed and not already loaded
    else if(CUR_TEXTURE_LIST.length == 0){
        console.log("> WARNING: No texture set provided, using default");
        CUR_TEXTURE_LIST = DEFAULT_TEXTURE_LIST;
        importTextureID(full_data,id,0);
    }
    //all textures already loaded
    else{
        console.log("> Using previously loaded textures");
        make3dStructure(full_data,id,CUR_STRUCTURE);
    }

    
}

//import a particular texture image from the texture list then render
function importTextureID(full_data,struct_id,id){
    //load the texture as raw data 
    let filename = TEXTURE_DIR + CUR_TEXTURE_LIST[id] + ".png"
    loadImage(filename).then((image) => {
        console.log("> Loaded texture #" + id + ": " + filename);

        //fake mini canvas for the imported images
        const img_canvas = createCanvas(image.width, image.height)
        const itx = img_canvas.getContext('2d')

        //draw onto mini canvas
        itx.drawImage(image, 0, 0, img_canvas.width, img_canvas.height);

        //add to the scene
        TEXTURE_PNG[id] = new THREE.CanvasTexture(img_canvas);
        TEXT_MAT[id] = new THREE.MeshBasicMaterial({map: TEXTURE_PNG[id],transparent: true});
        TEXT_LOAD[id] = true;

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

    //import offset if specified
    if(full_data[struct_id].offset != undefined){
        offset = JSON.parse(full_data[struct_id].offset);
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
        ANGLE = parseInt(full_data[struct_id].angle);
    }
    if(full_data[struct_id].distance != undefined){
        RADIUS = parseInt(full_data[struct_id].distance);
    }
    if(full_data[struct_id].height != undefined){
        //center it on the structure's height
        if(String(full_data[struct_id].height).toLowerCase() == "center")
            use_struct_center = true;
        //or use the specified height
        else{
            CENTER_Y = parseFloat(full_data[struct_id].height);
            use_struct_center = false;
        }
    }
    if(use_struct_center)
        CENTER_Y = Math.max(2,structCen[1]);

    //move the camera into position
    console.log(`> Camera position set to: angle=${ANGLE}, zoom=${RADIUS}, height=${CENTER_Y}`);
    rotateCam(ANGLE,CENTER_Y,RADIUS);

    //add the structure to the scene
    SCENE.add(structObj);

    //render the scene
    RENDERER.render(SCENE, CAMERA);


    //wait some time, then export it
    let filename = (full_data[struct_id].id ? `${full_data[struct_id].id}` : `structure_${struct_id}`);
    setTimeout(function(){
        if(OUTMODE == "PNG"){
            exportPNG(full_data,struct_id,`${OUTPUT_DIR}/${filename}.png`);
        }else if(OUTMODE == "GIF"){
            exportGIF(full_data,struct_id,`${OUTPUT_DIR}/${filename}.gif`);
        }
    },RENDER_DELAY);


}

//reset the camera's angle and position
function resetCamera(){
    ANGLE = DEF_ANGLE;
    RADIUS = DEF_RADIUS;
    CENTER_Y = DEF_CENTER_Y;

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
function exportPNG(full_data,struct_id,filename){
    //load the image from the renderer canvas
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

//export the canvas as gif with rotating the structure
var idx = 0;
function exportGIF(full_data,struct_id,filename){
    idx = 0;
    //setup gif
    encoder.createReadStream().pipe(fs.createWriteStream(filename));


    //start recording
    encoder.start();
    encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
    encoder.setDelay(FRAME_DELAY); // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    //rotate and save frames
    console.log("> Making " + GIF_FRAMES + " gif frames...");
    gifUpdate(full_data,struct_id,filename,GIF_FRAMES);
}

//rotates the structure and saves a frame
function gifUpdate(full_data,struct_id,filename,maxFrames) {
    //rotate the camera
    if(!CLOCKWISE)
        ANGLE += Math.floor(360/maxFrames);
    else
        ANGLE -= Math.floor(360/maxFrames);
    ANGLE %= 360;  
    // console.log(`Angle: ${ANGLE}`);
    rotateCam(ANGLE,CENTER_Y,RADIUS);
    RENDERER.render( SCENE, CAMERA );


    //iterate the frame counter
    if(idx > 0) {
        encoder.addFrame(rendCanvas.__ctx__);
        // encoder.addFrame(RENDERER.domElement.toDataURL("image/png"))
      // console.log(`add frame ${idx}`);
    }
    idx++;

    //goto next frame
    if(idx < maxFrames+1) {
        setTimeout(function(){gifUpdate(full_data,struct_id,filename,maxFrames)}, FRAME_DELAY);
    }
    //finish and goto next structure
    else{
        //save the encoded frames and make a new encoder (doesn't make new gifs otherwise)
        encoder.finish();
        encoder = null;
        encoder = new GIFEncoder(CANV_WIDTH, CANV_HEIGHT);
        console.log("> Exported GIF to " + filename);

        //FINISHED! do the next structure or exit
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
  }


///////////////    MAIN FUNCTION    ///////////////

// starting execution function
function start(){

    ///// READ THE ARGUMENTS FROM COMMAND LINE /////

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
    OUTPUT_DIR = `${PARENT_OUT_DIR}/output_${OUTMODE}`;
    if(args.length > 2){
        OUTPUT_DIR = args[2];
    }
    if (!fs.existsSync(OUTPUT_DIR)){
        fs.mkdirSync(OUTPUT_DIR);
    }



    /////  VALIDATE THE JSON FILE  /////

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
    resetCamera();
    setupStruct(STRUCTURE_LIST,struct_id);
}

start();