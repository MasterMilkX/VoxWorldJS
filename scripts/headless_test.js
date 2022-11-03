var fs = require('fs')

const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(200, 200)
const ctx = canvas.getContext('2d')

// Write "Awesome!"
ctx.font = '30px Impact'
ctx.rotate(0.1)
ctx.fillText('Awesome!', 50, 100)

// Draw line under text
var text = ctx.measureText('Awesome!')
ctx.strokeStyle = 'rgba(0,0,0,0.5)'
ctx.beginPath()
ctx.lineTo(50, 102)
ctx.lineTo(50 + text.width, 102)
ctx.stroke()

let im_data = canvas.toDataURL("image/png");

// strip off the data: url prefix to get just the base64-encoded bytes
const data = im_data.replace(/^data:image\/\w+;base64,/, "");
var filename = "test_img.png"
const buf = Buffer.from(data, "base64");
fs.writeFileSync(filename, buf);

// Draw a bookshelf from the textures
// loadImage('./textures/bookshelf.png').then((image) => {
//   ctx.drawImage(image, 50, 0, 70, 70)

// //   console.log('<img src="' + canvas.toDataURL() + '" />')
// })
    