//test creating multiple gifs
const fs = require('fs')
const GIFEncoder = require('gifencoder');
const {createCanvas} = require('../js/node-canvas-webgl');

let MAX_FRAMES = 60;
let FPS = 16;

//make the fake canvas
let canvas = createCanvas(100,100);
let ctx = canvas.getContext('2d');
canvas.width = 100;
canvas.height = 100;

let sprite = {x:0,y:0,ox:canvas.width/2,oy:canvas.height/2+10,s:10,r:20,color:"#f00"};
let colors = ["#f00","#0f0","#00f"];

let t = 0;
setInterval(function(){
    t++;
    t %= 1000;
    //move sprite in a circle
    sprite.x = sprite.ox + sprite.r*Math.cos(t/10) - sprite.s/2;
    sprite.y = sprite.oy + sprite.r*Math.sin(t/10) - sprite.s/2;
},FPS);

function animate(){
    //render
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#dedede";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = sprite.color;
    ctx.fillRect(sprite.x,sprite.y,sprite.s,sprite.s);

    ctx.fillStyle = "#000";
    ctx.fillText("X",sprite.ox,sprite.oy);
    ctx.textAlign = "center";
    ctx.fillText("Time: " + t, canvas.width/2,20)
}
animate();

//setup the encoder
let encoder = new GIFEncoder(100, 100);

//record the canvas to the encoder
let idx = 0;
function recordGif(id,filename){
    idx = 0;
    animate();

    //setup the encoder for the new gif
    encoder.createReadStream().pipe(fs.createWriteStream(filename));
    encoder.start();
    encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
    encoder.setDelay(FPS); // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    update(id,filename)
}

//update the canvas and record it to the encoder
function update(id,filename){
    if(idx > 0) {
        encoder.addFrame(ctx);
        // console.log(`frame ${idx}: ${parseInt(sprite.x)}, ${parseInt(sprite.y)}`);
    }
    idx++;
    if(idx < MAX_FRAMES) {
        setTimeout(function(){update(id,filename)}, FPS);
    }else{
        encoder.finish();
        encoder = null;
        encoder = new GIFEncoder(100, 100);
        console.log("Finished #" + id + "!");

        //goto the next gif
        if(id < colors.length){
            id+=1;
            sprite.color = colors[id-1];
            recordGif(id,'./test_gifs/' + id + '.gif');
        }else{
            console.log("Finished all!");
            process.exit(0);
        }
    }
}

//do the first gif
let gifId = 1;
recordGif(gifId,'./test_gifs/' + gifId + '.gif');
   

