import { Component, OnInit } from '@angular/core';
import {SlideshowModule} from 'ng-simple-slideshow';

// node_modules/ng-simple-slideshow/src/app/modules/slideshow/IImage.d.ts
// src/app/static-pages/departments-static/departments-static.component.ts
@Component({
  selector: 'appdashboard-departments-static',
  templateUrl: './departments-static.component.html',
  styleUrls: ['./departments-static.component.scss']
})
export class DepartmentsStaticComponent implements OnInit {


  imageUrlArray = [
   { url: 'assets/img/static-depts4.png' , backgroundSize: 'contain'},
   { url: 'assets/img/static-depts5.png' , backgroundSize: 'contain'}
  ];


  // ,
    // 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/9278671/jbareham_170917_2000_0124.jpg',
    // 'https://cdn.vox-cdn.com/uploads/chorus_image/image/56789263/akrales_170919_1976_0104.0.jpg'

  constructor(slideshowModule: SlideshowModule) { }

  ngOnInit() {



  }

}
