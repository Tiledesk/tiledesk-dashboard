
var tx = 0;
var ty = 0;
let scale = 1;
let el;
let drawer;

function setDrawer(el,drawer) {
    this.drawer = drawer;
    this.el = el;
    el.onwheel = zoom;
}


function zoom(event) {
    console.log("event:", event);
    event.preventDefault();
    const dx = event.deltaX;
    const dy = event.deltaY;
    if (event.ctrlKey === false) {
    // pan
    //console.log("pan");
    // translate(42px, 18px)
    let direction = -1;
    tx += event.deltaX * direction;
    ty += event.deltaY * direction;
    transform();
    } else {
    // zoom
    //console.log("zoom");
    scale += dy * -0.01;
    // Restrict scale
    scale = Math.min(Math.max(0.125, scale), 4);
    // Apply scale transform
    transform();
    }
}

function transform() {
    let tcmd = `translate(${tx}px, ${ty}px)`;
    let scmd = `scale(${scale})`;
    console.log("tcmd:", tcmd);
    console.log("scmd:", scmd);
    this.drawer.style.transform = tcmd + " " + scmd;
}

// const el = document.getElementById("container");
// const drawer = document.getElementById("drawer");
// el.onwheel = zoom;