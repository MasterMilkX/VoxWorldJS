// HEADLESS VERSION OF THE INTERACTIVE CODE THAT MAKES IMAGES AND GIFS OF PASSED JSON DATA
// Input: JSON data => { "structure": str (3d int array of the structure), "textures" : [str list] (texture names) }

//imports
var fs = require('fs');
var THREE = require('./js/three');
// var Canvas = require('canvas');

var TEXTURE_DIR = "./textures/";
CUR_TEXTURE_LIST = []
CUR_STRUCTURE = []
var DEFAULT_TEXTURE_LIST = ["air","stonebrick","dirt","planks_oak","sand","iron_bars","glass","iron_block","log_oak","wool_colored_red","stone_slab_side"];


//////////////      THREE.JS SETUP     ///////////////

// var rendCanvas = Canvas.IMAGE;

// //set up the canvas
// const RENDERER = new THREE.WebGLRenderer({canvas: rendCanvas, antialias: false, preserveDrawingBuffer: true });
// RENDERER.setSize(400, 300);
// // RENDERER.domElement.id = "renderCanvas";
// // document.getElementById("render").appendChild(RENDERER.domElement);

// //setup scene and camera
// const SCENE = new THREE.Scene();
// SCENE.background = new THREE.Color( BG_COLOR ).convertSRGBToLinear();
// const CAMERA = new THREE.PerspectiveCamera( 75, rendCanvas.clientWidth / rendCanvas.clientHeight, 0.1, 1000);

// //load a texture loader
// const loader = new THREE.TextureLoader();

// //add a light
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
// SCENE.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
// directionalLight.position.set(10, 20, 0); // x, y, z
// SCENE.add(directionalLight);


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
    document.getElementById("heightView").value = CENTER_Y;
    document.getElementById("heightViewVal").value = CENTER_Y;
    
    // resetCamera();
    rotateCam(ANGLE,CENTER_Y,RADIUS)

    //add the structure to the scene
    SCENE.add(structObj);

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


    }
    

}


main();