export class TiledeskStage {

    tx = 0;
    ty = 0;
    scale = 1;
    containerId;
    drawerId;
    container;
    drawer;
    classDraggable = "tds_draggable";

    constructor(containerId, drawerId, classDraggable) {
        this.containerId = containerId;
        this.drawerId = drawerId;
        this.classDraggable = classDraggable;
        this.moveAndZoom = this.moveAndZoom.bind(this);

        // this.dragMouseDown2 = this.dragMouseDown2.bind(this);
        // this.closeDragElement = this.closeDragElement.bind(this);
        // this.elementDrag = this.elementDrag.bind(this);
    }
    
    setDrawer() {
        this.container = document.getElementById(this.containerId);
        this.drawer = document.getElementById(this.drawerId);
        // console.log("setDrawer:", this.containerId, this.drawerId, this.container, this.drawer);
        //this.container.onwheel = this.moveAndZoom;
        this.container.addEventListener("wheel", this.moveAndZoom);
    }

    moveAndZoom(event) {
        // console.log("moveAndZoom:", event, this.tx);
        event.preventDefault();
        const dx = event.deltaX;
        const dy = event.deltaY;
        this.getPositionNow();
        if (event.ctrlKey === false) {
            // console.log("pan");
            let direction = -1;
            this.tx += event.deltaX * direction;
            this.ty += event.deltaY * direction;
            this.transform();
        } else {
            // console.log("zoom");
            this.scale += dy * -0.01;
            this.scale = Math.min(Math.max(0.125, this.scale), 4);
            this.transform();
            // const event = new CustomEvent("scaled", { detail: {scale: this.scale} });
            // document.dispatchEvent(event);
        }

        setTimeout(() => {
            const customEvent = new CustomEvent("moved-and-scaled", { detail: {scale: this.scale, x: this.tx, y: this.ty} });
            document.dispatchEvent(customEvent);
        }, 0)
        
    }
    
    transform() {
        // console.log("transform:", this.drawer, drawer, this.scale, scale);
        let tcmd = `translate(${this.tx}px, ${this.ty}px)`;
        let scmd = `scale(${this.scale})`;
        // console.log("tcmd:", tcmd);
        // console.log("scmd:", scmd);
        this.drawer.style.transform = tcmd + " " + scmd;
    }


    getPositionNow(){
        if(window.getComputedStyle(this.drawer)){
            var computedStyle = window.getComputedStyle(this.drawer);
            // console.log('computedStyle :', computedStyle);
            var transformValue = computedStyle.getPropertyValue('transform');
            // console.log('transformValue :', transformValue);
            if(transformValue !== "none") {
                var transformMatrix = transformValue.match(/matrix.*\((.+)\)/)[1].split(', ');
                // console.log('transformMatrix :', transformMatrix);
                var translateX = parseFloat(transformMatrix[4]);
                var translateY = parseFloat(transformMatrix[5]);
                var scaleX = parseFloat(transformMatrix[0]);
                // console.log('Translate X:', translateX);
                // console.log('scaleX :', scaleX);
                this.tx = translateX;
                this.ty = translateY;
                this.scale = scaleX;
            }
        }
    }


    // NON è chiaro, non so se funziona da verificare!!!
    // deleteRefDragElement(elementId){
    
    //     var element = document.getElementById(elementId);
    //     let listenerMouseDown = dragMouseDown.bind(this);
    //     let handleMouseDown = (event) => listenerMouseDown(event, element);
    //     element.removeEventListener("mousedown", handleMouseDown, false);
    // }

    setDragElement(elementId) {
        console.log('-----> setDragElement', elementId);
        var element = document.getElementById(elementId);
        let pos_mouse_x;
        let pos_mouse_y;
        
        // let elementDrag3 = elementDrag.bind(this);
        // let listenerMouseMove = (event) => elementDrag3(event, element);
        // let listenerMouseDown = (event) => dragMouseDown3(event, element);


        let listenerMouseMove = elementDrag.bind(this);
        let handleMouseMove = (event) => listenerMouseMove(event, element);

        let listenerMouseDown = dragMouseDown.bind(this);
        let handleMouseDown = (event) => listenerMouseDown(event, element);


        // element.removeEventListener("mousedown", handleMouseDown, false);
        element.addEventListener("mousedown", handleMouseDown, false);

        //
        // element.addEventListener("mousedown", listenerMouseDown, true);
        // element.addEventListener("mousedown", (e)=> {
        //     dragMouseDown3(e,element);
        // });
        

        //console.log('setDragElement', element);
        
        // 


        function dragMouseDown(e, element) {
            console.log('dragMouseDown', e, this.classDraggable, element);
            if (!e.target.classList.contains(this.classDraggable)) {
                return;
            }
            e = e || window.event;
            e.preventDefault();
            pos_mouse_x = e.clientX;
            pos_mouse_y = e.clientY;
            console.log("pos_mouse_x:", pos_mouse_x, "pos_mouse_y:", pos_mouse_y);

            // document.addEventListener("mouseup", ()=> {
            //     closeDragElement();
            // });
            // document.addEventListener("mousemove", ()=> {
            //     elementDrag(e, element);
            // });
            document.onmouseup = closeDragElement;
            // let listener = (event) => elementDrag3(e, element);
            document.removeEventListener("mousemove", handleMouseMove, true);
            document.addEventListener("mousemove", handleMouseMove, true);
            // this.listener = (event) => this.closeDragElement(e, element);
            // document.addEventListener("mousemove", elementDrag3, true );
            // document.addEventListener("mousemove", (e)=> {
            //     elementDrag3(e, element);
            // }, true );
            // document.onmousemove = elementDrag3;
        }


        function closeDragElement() {
            console.log('closeDragElement::: ', handleMouseMove);
            /* stop moving when mouse button is released:*/
            document.removeEventListener("mousemove", handleMouseMove, true);
            // document.removeEventListener("mousemove", elementDrag3(e, element), true); // Succeeds
            // document.removeEventListener("mousemove", elementDrag3(e, element), false); 
            // document.removeEventListener("onmouseup", closeDragElement, true); // Succeeds
            document.onmouseup = null;
            // document.onmousemove = null;
            // document.removeEventListener("onmouseup", closeDragElement(e, element), true); 
            console.log('closeDragElement');
        }
      
        function elementDrag(e, elmnt) {
            // console.log('elementDrag', elmnt, this.scale);
            //console.log("---------------------------", e.target.id);
            e = e || window.event;
            e.preventDefault();
            const delta_x = e.clientX - pos_mouse_x; // phisical
            const delta_y = e.clientY - pos_mouse_y;  // phisical
            pos_mouse_x = e.clientX;
            pos_mouse_y = e.clientY;
            let pos_x = elmnt.offsetLeft + delta_x / this.scale;//pos_mouse_x/ scale - e.clientX/ scale - shift_x; // logic
            let pos_y = elmnt.offsetTop + delta_y / this.scale;//pos_mouse_y/ scale - e.clientY/ scale - shift_y;
            //pos_y = ( e_rect.top + delta_y)/ scale;//pos_mouse_y/ scale - e.clientY/ scale - shift_y;
            // console.log("pos_x:", pos_x, "pos_y:", pos_y);
            // set the element's new position:
            elmnt.style.top = pos_y + "px";//(elmnt.offsetTop - pos_y) + "px";
            elmnt.style.left = pos_x + "px"; //(elmnt.offsetLeft - pos_x) + "px";
            const moved_event = new CustomEvent("dragged", {
                detail: {
                    element: elmnt,
                    x: pos_x, 
                    y: pos_y
                }
            });
            document.dispatchEvent(moved_event);
        }
        
    }


    physicPointCorrector(point){
        const container = document.getElementById(this.containerId);
        const container_rect = container.getBoundingClientRect();
        const x = point.x - container_rect.left;
        const y = point.y - container_rect.top;
        return { x: x, y: y };
      }



  
  }