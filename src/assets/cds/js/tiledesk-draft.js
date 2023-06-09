export class TiledeskDraft {

    tx = 0;
    ty = 0;
    scale = 1;
    containerId;
    drawerId;
    container;
    drawer;
    classDraggable = "tds-draggable";

    constructor(containerId, drawerId, classDraggable) {
        this.containerId = containerId;
        this.drawerId = drawerId;
        this.classDraggable = classDraggable;
    }

    
    setDrawer() {
        this.container = document.getElementById(this.containerId);
        this.drawer = document.getElementById(this.drawerId);

        console.log("setDrawer:", this.container, this.drawer);
        this.container.onwheel = this.moveAndZoom;
    }

    moveAndZoom(event) {
        event.preventDefault();
        console.log("moveAndZoom:", event);
        const dx = event.deltaX;
        const dy = event.deltaY;
        // getPositionNow();
        console.log("moveAndZoom:", this.drawer);
        if (event.ctrlKey === false) {
            // pan
            // console.log("pan");
            // translate(42px, 18px)
            let direction = -1;
            this.tx += event.deltaX * direction;
            this.ty += event.deltaY * direction;
            transform();
        } else {
            // zoom
            // console.log("zoom");
            this.scale += dy * -0.01;
            // Restrict scale
            this.scale = Math.min(Math.max(0.125, scale), 4);
            // Apply scale transform
            transform();
            const event = new CustomEvent("scaled", { detail: {scale: this.scale} });
            document.dispatchEvent(event);
        }

        function transform() {
            let tcmd = `translate(${this.tx}px, ${this.ty}px)`;
            let scmd = `scale(${this.scale})`;
            // console.log("tcmd:", tcmd);
            // console.log("scmd:", scmd);
            this.drawer.style.transform = tcmd + " " + scmd;
        }
    }
    
  
    


    // getPositionNow(){
    //     if(window.getComputedStyle(this.drawer)){
    //         var computedStyle = window.getComputedStyle(this.drawer);
    //         // console.log('computedStyle :', computedStyle);
    //         var transformValue = computedStyle.getPropertyValue('transform');
    //         // console.log('transformValue :', transformValue);
    //         if(transformValue !== "none") {
    //             var transformMatrix = transformValue.match(/matrix.*\((.+)\)/)[1].split(', ');
    //             console.log('transformMatrix :', transformMatrix);
    //             var translateX = parseFloat(transformMatrix[4]);
    //             var translateY = parseFloat(transformMatrix[5]);
    //             var scaleX = parseFloat(transformMatrix[0]);
    //             console.log('Translate X:', translateX);
    //             console.log('scaleX :', scaleX);
    //             tx = translateX;
    //             ty = translateY;
    //             scale = scaleX;
    //         }
    //     }
    // }



    setDragElement(elementId) {
        var elmnt = document.getElementById(elementId);
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            console.log('dragMouseDown');
            // console.log("classDraggable", classDraggable)
            if (!e.target.classList.contains(this.classDraggable)) {
                return;
            }
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos_mouse_x = e.clientX;
            pos_mouse_y = e.clientY;
            //const e_rect = e.target.getBoundingClientRect();
            //console.log("e_rect.left:", e_rect.left, "e_rect.top:", e_rect.top);
            //console.log("e_rect:", e_rect);
            console.log("pos_mouse_x:", pos_mouse_x, "pos_mouse_y:", pos_mouse_y);
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
      
        function elementDrag(e) {
            console.log('elementDrag');
            //console.log("---------------------------", e.target.id);
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            // const drawer = document.getElementById("drawer");
            //var d_rect = drawer.getBoundingClientRect();
            //const e_rect = e.target.getBoundingClientRect();
            //console.log("e_rect.left:", e_rect.left, "e_rect.top:", e_rect.top);
            //var shift_x = d_rect.left / scale
            //var shift_y = d_rect.top / scale
            //console.log("shift_x:", shift_x);
            //var x = (e.clientX) / scale - shift_x
            //var y = (e.clientY) / scale - shift_y
            //console.log("scale:", scale);
            //console.log("pos_mouse_x:", pos_mouse_x, "pos_mouse_y:", pos_mouse_y);
            const delta_x = e.clientX - pos_mouse_x; // phisical
            const delta_y = e.clientY - pos_mouse_y;  // phisical
            pos_mouse_x = e.clientX;
            pos_mouse_y = e.clientY;
            //console.log("elmnt.style.left:", elmnt.style.left);
            //console.log("delta_x:", delta_x);
            pos_x = elmnt.offsetLeft + delta_x/ this.scale;//pos_mouse_x/ scale - e.clientX/ scale - shift_x; // logic
            pos_y = elmnt.offsetTop + delta_y / this.scale;//pos_mouse_y/ scale - e.clientY/ scale - shift_y;
            //pos_y = ( e_rect.top + delta_y)/ scale;//pos_mouse_y/ scale - e.clientY/ scale - shift_y;
            console.log("pos_x:", pos_x, "pos_y:", pos_y);
            // set the element's new position:
            elmnt.style.top = pos_y + "px";//(elmnt.offsetTop - pos_y) + "px";
            elmnt.style.left = pos_x + "px"; //(elmnt.offsetLeft - pos_x) + "px";
        }
      
        function closeDragElement() {
          /* stop moving when mouse button is released:*/
          document.onmouseup = null;
          document.onmousemove = null;
          console.log('closeDragElement');
        }
      }
  
  }