//initial function for the app
function init(){
    console.log("Hello world!");
}

//change the values of the angle and zoom
function changeSlideVal(id, value) {
  var label = document.getElementById(id);
  label.value = value;
}
function changeSlidePos(id, value){
    var pos = document.getElementById(id);
    pos.value = value;
}