export class TiledeskConnectors {

    constructor(drawerId, classes) {
      //this.connectors = [];
      this.classes = {
        "connector_selected": "tds_connector_selected",
        "input_block": "tds_input_block",
        "connectable": "tds_connectable",
        "connector": "tds_connector",
        "connector_over": "tds_connector_over",
        "path": "tds_path"
      }
      if (classes && classes["connector_selected"]) {
        this.classes["connector_selected"] = classes["connector_selected"];
      }
      if (classes && classes["input_block"]) {
        this.classes["input_block"] = classes["input_block"];
      }
      if (classes && classes["connectable"]) {
        this.classes["connectable"] = classes["connectable"];
      }
      if (classes && classes["connector"]) {
        this.classes["connector"] = classes["connector"];
      }
      if (classes && classes["connector_over"]) {
        this.classes["connector_over"] = classes["connector_over"];
      }
      if (classes && classes["path"]) {
        this.classes["path"] = classes["path"];
      }
      //this.connectors = new Map();
      //this.blocks = new Map();
      this.connectors = {};
      this.blocks = {};
      //this.document = document;
      this.svgContainer = document.getElementById("svgConnectors");
      this.drawerId = drawerId;
      this.scale = 1;
      // connector draft drawing (cubic bezier)
      this.drawingBack = { x: 0, y: 0 };
      this.controlBack = { x: 0, y: 0 };
      this.drawingFront = { x: 0, y: 0 };
      this.controlFront = { x: 0, y: 0 };
      this.selectedConnector = null;
    }



    // Funzione per verificare se un elemento contiene la classe "pippo"
    contienePippo(elemento, classe) {
      return elemento.classList.contains(classe);
    }

    // Funzione per eseguire la verifica gerarchica
    verificaGerarchica(elemento, classe) {
        // console.log("verificaGerarchica elemento: --> ", elemento);
        let genitore = elemento.parentElement;
        // let contiene = false;
        while (genitore !== null) {
        //   console.log("verificaGerarchica: genitore ::: ", genitore); 
            if (this.contienePippo(genitore, classe)) {
              // contiene = true;
              // console.log("L'elemento genitore contiene la classe 'pippo'.");
              return true;
            } 
            if(genitore.parentElement){
              // console.log("verificaGerarchica: genitore ::: ", genitore.parentElement);
              genitore = genitore.parentElement;
              
            } else {
              genitore = null;
              // console.log("verificaGerarchica: genitore ::: ", genitore);
            }
        }
        return false;
        
        // console.log("Nessun elemento genitore contiene la classe 'pippo'.");
        // return false;
    }
  
    /*add(connector) {
      this.connectors.push(connector)
    }*/
  
    createConnector(fromId, toId, fromPoint, toPoint) {
      const id = fromId + "/" + toId;
      console.log('createConnector: fromId-> ', fromId);
      // condition example id
      // "start_blockID/actionID/(sub-action path, ex: true)/end_blockID"
      // fromId: "block1/action1/true"
      // toId: "block2"
      // id = fromId + "/" + toId
      let connector = {
        id: id,
        fromId: fromId,
        toId: toId,
        fromPoint: fromPoint,
        toPoint: toPoint
      }
      //this.connectors.push(connector);
      this.connectors[connector.id] = connector;
  
      // connector as outConnector in outBlock
      const parentBlockId = fromId.split("/")[0];
      //let outblock = this.blocks.get(parentBlockId);
      let outblock = this.blocks[parentBlockId];
      if (!outblock) {
        outblock = this.createBlock(parentBlockId);
        //this.blocks.set(outblock.id, outblock);
        this.blocks[outblock.id] = outblock;
      }
      //outblock.outConnectors.set(connector.id, connector.id);
      outblock.outConnectors[connector.id] = connector.id;
  
      // connector as outConnector in outBlock
      const destBlockId = toId.split("/")[0];
      let inblock = this.blocks[destBlockId];
      if (!inblock) {
        inblock = this.createBlock(destBlockId);
        this.blocks[inblock.id] = inblock;
      }
      inblock.inConnectors[connector.id] = connector.id;
  
      //block.addConnector()
      console.log("blocks:", this.blocks);
      console.log("connectors:", this.connectors);
      this.#drawConnector(id, fromPoint, toPoint);
      this.removeConnectorDraft();
    }
  
    createBlock(blockId) {
      let block = {
        id: blockId
      }
      block.inConnectors = {}; //new Map();
      block.outConnectors = {}; //new Map();
      return block;
    }
  
    updateBlockPosition(blockId, x, y) {
      let block = this.blocks.get(blockId);
      if (block) {
        block.x = x;
        block.y = y;
      }
    }
  
    mousedown(target) {
      this.target = target;
      if (target.addEventListener) {
        target.addEventListener("mousedown", (event) => {
            console.log("mousedown   el.id:", event.target.id)
            let el = event.target;
            this.#removeSelection(el);
            let elConnectable = this.verificaGerarchica(el, this.classes["connectable"]);
            console.log("connectable? ", elConnectable);
            //if(elConnectable){
            if (el.classList.contains(this.classes["connectable"])) {
                console.log("connectable");
                this.fromId = event.target.id;
                this.drawingBack = this.#elementLogicCenter(el);
                this.ref_handleMouseMove;
                this.ref_handleMouseUp;
                target.addEventListener("mousemove", this.ref_handleMouseMove = this.#handleMouseMove.bind(this), false);
                target.addEventListener("mouseup", this.ref_handleMouseUp = this.#handleMouseUp.bind(this), false);
            }
            else {
                console.log("un-connectable");
            }
        }, false);
        /* 
        target.addEventListener("click", (event) => {
            console.log("clicked el.id:", event.target.id)
            let el = event.target;
            this.#removeSelection(el);
        }, false);
        */
        console.log("mouse down added");
      }
    }
  
    #removeSelection(target) {
      //console.log("resetting connector selection?")
      if (this.selectedConnector) {
        if (!target.id || (this.selectedConnector.id !== target.id)) {
          this.selectedConnector.setAttributeNS(null, "class", "connector");
          this.selectedConnector = null;
        }
      }
    }
  
    #handleMouseMove(event) {
      //console.log("move...", event.target.id);
      let mouse_pos_logic;
      const target = event.target;
      // let isConnectable = this.verificaGerarchica(event.target, this.classes["input_block"]);
      // console.log("connectable? ", isConnectable);
      // if(isConnectable){
      if (target.classList.contains(this.classes["input_block"])) {
        const block_rect = target.getBoundingClientRect();
        let pos_x_phis = block_rect.left;
        let pos_y_phis = block_rect.top;
        mouse_pos_logic = this.#logicPoint({ x: pos_x_phis, y: pos_y_phis });
        mouse_pos_logic.y = mouse_pos_logic.y + 20;
        this.toPoint = mouse_pos_logic;
      }
      else {
        let pos_x_phis = event.clientX;
        let pos_y_phis = event.clientY;
        mouse_pos_logic = this.#logicPoint({ x: pos_x_phis, y: pos_y_phis });
      }
      this.drawingFront = mouse_pos_logic;
      this.#moveControlPoint();
    }
  
    #handleMouseUp(event) {
      //console.log("mouse up event...", event);
      this.target.removeEventListener("mousemove", this.ref_handleMouseMove, false);
      this.target.removeEventListener("mouseup", this.ref_handleMouseUp, false);
      /*if (event.target.classList.contains("container")) {
        const fire_event = new CustomEvent("connector-draft-released",
          {
            detail: {
              point: this.toPoint,
              target: event.target
            }
        });
        document.dispatchEvent(fire_event);
        console.log("connector-draft-released fired!");
      }
      else */
      console.log('handleMouseUp ------> ', event.target, event.srcElement);
      // let isConnectable = this.verificaGerarchica(event.target, this.classes["input_block"]);
      // console.log("connectable? ", isConnectable);
      // if(isConnectable){
      
      if (event.target.classList.contains(this.classes["input_block"])) {
        this.createConnector(this.fromId, event.target.id, this.drawingBack, this.toPoint);
      }
      else {
        //console.log("connector released on an unsupported element!");
        //this.removeConnectorDraft();
        const fire_event = new CustomEvent("connector-draft-released",
          {
            detail: {
              point: this.toPoint,
              target: event.target
            }
          });
        document.dispatchEvent(fire_event);
        console.log("connector-draft-released fired!");
      }
    }
  
    removeConnectorDraft() {
      let connector = document.getElementById("connectorDraft");
      if (connector) {
        connector.remove();
      }
    }
  
    //#moveControlPoint(mouse_x, mouse_y) {
    #moveControlPoint() {
      //this.drawingFront = this.#logicPoint({x: mouse_x, y: mouse_y});
      this.#updateControlPoints();
      this.#drawConnectorDraft();
    }
  
    #updateControlPoints() {
      //if (this.p1x < p4x) { // front point < back point
      if (this.drawingFront.x < this.drawingBack.x) {
        const front_back_dist_x = this.drawingBack.x - this.drawingFront.x;
        this.controlFront.x = this.drawingFront.x - (front_back_dist_x);
        this.controlBack.x = this.drawingBack.x + (front_back_dist_x);
      }
      else { // p1x > p4x
        const front_back_half_dist = Math.round((this.drawingFront.x - this.drawingBack.x) / 2);
        this.controlFront.x = this.drawingBack.x + front_back_half_dist;
        this.controlBack.x = this.drawingBack.x + front_back_half_dist;
      }
      this.controlFront.y = this.drawingFront.y;
      this.controlBack.y = this.drawingBack.y;
      //console.log("this.controlFront", this.controlFront);
      //console.log("this.controlBack", this.controlBack);
    }
  
    #drawConnectorDraft() {
      let connector = document.getElementById("connectorDraft");
      if (!connector) {
        connector = document.createElementNS("http://www.w3.org/2000/svg", "path");
        connector.setAttributeNS(null, "fill", "transparent");
        connector.setAttributeNS(null, "id", "connectorDraft");
        this.svgContainer.appendChild(connector);
      }
      let d = "M" + this.drawingFront.x + " " + this.drawingFront.y + " " + "C " + this.controlFront.x + " " + this.controlFront.y + " " + this.controlBack.x + " " + this.controlBack.y + " " + this.drawingBack.x + " " + this.drawingBack.y;
      connector.setAttributeNS(null, "d", d);
      connector.setAttributeNS(null, "class", this.classes["path"]);
      //connector.setAttributeNS(null, "stroke", "#FF0000");
      //connector.setAttributeNS(null, "stroke-width", "1px");
    }
  
    /** 
    Creates or modify a connector in HTML
    */
    #drawConnector(id, backPoint, frontPoint) {
      //console.log(id, backPoint, frontPoint);
      let connector = document.getElementById(id);
      if (!connector) {
        connector = document.createElementNS("http://www.w3.org/2000/svg", "path");
        connector.setAttributeNS(null, "fill", "transparent");
        connector.setAttributeNS(null, "id", id);
        connector.setAttributeNS(null, "class", "connector");
        connector.setAttributeNS(null, "pointer-events", "stroke");
        connector.addEventListener('mouseover', (e) => {
          //console.log("mouseover e", e.currentTarget);
          if (this.selectedConnector !== null) { // jump highlighting current selection
            if (this.selectedConnector.id !== e.currentTarget.id) {
              e.currentTarget.setAttributeNS(null, "class", this.classes["connector_over"]);
            }
          }
          else {
            e.currentTarget.setAttributeNS(null, "class", this.classes["connector_over"]);
          }
        });
        connector.addEventListener('mouseleave', (e) => {
          //console.log("mouseleave e", e.currentTarget);
          // let el = 
          // let isConnectable = this.verificaGerarchica(e.target, this.classes["connector_selected"]);
          // console.log("connectable? ", isConnectable);
          // if(isConnectable){
          if (!e.currentTarget.classList.contains(this.classes["connector_selected"])) {
            e.currentTarget.setAttributeNS(null, "class", this.classes["connector"]);
          }
        });
        connector.addEventListener('click', (e) => {
          //console.log("clicked e", e.currentTarget);
          if (this.selectedConnector) {
            this.selectedConnector.setAttributeNS(null, "class", this.classes["connector"]);
          }
          this.selectedConnector = e.currentTarget;
          this.selectedConnector.setAttributeNS(null, "class", this.classes["connector_selected"]);
        });
        this.svgContainer.appendChild(connector);
      }
      // control points
      let controlFront = { x: 0, y: 0 };
      let controlBack = { x: 0, y: 0 };
      if (frontPoint.x < backPoint.x) {
        const front_back_dist_x = backPoint.x - frontPoint.x;
        controlFront.x = frontPoint.x - (front_back_dist_x);
        controlBack.x = backPoint.x + (front_back_dist_x);
      }
      else {
        const front_back_half_dist = Math.round((frontPoint.x - backPoint.x) / 2);
        controlFront.x = backPoint.x + front_back_half_dist;
        controlBack.x = backPoint.x + front_back_half_dist;
      }
      controlFront.y = frontPoint.y;
      controlBack.y = backPoint.y;
  
      let d = "M" + frontPoint.x + " " + frontPoint.y + " " + "C " + controlFront.x + " " + controlFront.y + " " + controlBack.x + " " + controlBack.y + " " + backPoint.x + " " + backPoint.y;
      connector.setAttributeNS(null, "d", d);
      //connector.setAttributeNS(null, "stroke", "#FF0000");
      //connector.setAttributeNS(null, "stroke-width", "1px");
    }
  
    /** 
    Measure from phisical to logical
    */
    #toLogicScale(measure) {
      return measure / this.scale;
    }
  
    /** 
    Coordinate from phisical to logical
    */
    #logicPoint(coords) {
      const drawer = document.getElementById(this.drawerId);
      var drawer_rect = drawer.getBoundingClientRect();
      // https://stackoverflow.com/questions/24883585/mouse-coordinates-dont-match-after-scaling-and-panning-canvas
      const shift_x = this.#toLogicScale(drawer_rect.left); //d_rect.left / scale
      const shift_y = this.#toLogicScale(drawer_rect.top); //d_rect.top / scale
      const x = this.#toLogicScale(coords.x) - shift_x; //mouse_x / scale - shift_x
      const y = this.#toLogicScale(coords.y) - shift_y; //(mouse_y) / scale - shift_y
      return { x: x, y: y };
    }
  
    #elementLogicCenter(element) {
      const rect = element.getBoundingClientRect();
      //console.log("Logic center of phisical rect:", rect);
      let logic_rect_pos = this.#logicPoint({ x: rect.left, y: rect.top })
      //console.log("center: logic_rect_pos:", logic_rect_pos);
      const logic_width = this.#toLogicScale(rect.width);
      //console.log("center: logic_width:", logic_width);
      const logic_height = this.#toLogicScale(rect.height);
      //console.log("center: logic_height:", logic_height);
      let center_x = logic_rect_pos.x + logic_width / 2;
      let center_y = logic_rect_pos.y + logic_height / 2;
      //console.log("center_x:", center_x);
      //console.log("center_y:", center_y);
      return { x: center_x, y: center_y };
    }
  
    moved(element, x, y) {
      console.log("moving ----> ", element.id, x, y);

      // search all the connectors connected to blockID
      // connectors 
      //fromId: fromId
      //toId: toId
      // all connectors where fromId === blockId
      // all connectors where toId === blockId
      const blockId = element.id;
      let block = this.blocks[blockId];
      console.log("block:", block)
      if (!block) {
        return;
      }
  
      //block.outConnectors.forEach((conn_id, key) => {
      for (const [key, conn_id] of Object.entries(block.outConnectors)) {
        //for (k in block.outConnectors.keys) {
        //c_id = block.outConnectors[k];
        let conn = this.connectors[conn_id];
        const el = document.getElementById(conn.fromId);
        conn.fromPoint = this.#elementLogicCenter(el);
        this.#drawConnector(conn.id, conn.fromPoint, conn.toPoint);
      };
      //block.inConnectors.forEach((conn_id, key) => {
      for (const [key, conn_id] of Object.entries(block.inConnectors)) {
        //for (k in block.inConnectors.keys) {
        //c_id = block.inConnectors[k]
        //let conn = this.connectors.get(conn_id);
        let conn = this.connectors[conn_id];
        conn.toPoint.x = x;
        conn.toPoint.y = y + 20;
        this.#drawConnector(conn.id, conn.fromPoint, conn.toPoint);
      };
  
  
      /*
      for (let i in this.connectors) {
        console.log("conn:", this.connectors[i]);
        let connector = this.connectors[i];
        if (connector.fromId.startsWith(blockId)) {
          console.log("conn found connector.fromId === blockId:", connector.id)
          // update connector fromPoint
          const el = document.getElementById(connector.fromId);
          connector.fromPoint = this.#elementLogicCenter(el)
          //connector.fromPoint.x = x
          //connector.fromPoint.y = y
          this.#drawConnector(connector.id, connector.fromPoint, connector.toPoint);
        }
        else if (connector.toId.startsWith(blockId)) {
          console.log("conn found connector.toId === blockId:", connector.id)
          // update connector.toPoint
          connector.toPoint.x = x;
          connector.toPoint.y = y + 20;
          this.#drawConnector(connector.id, connector.fromPoint, connector.toPoint);
        }
      }
      */
    }
  
  }