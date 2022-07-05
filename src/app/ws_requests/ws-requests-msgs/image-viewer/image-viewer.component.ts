import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
@Component({
  selector: 'appdashboard-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }


  closeImageViewerModal() {
    // console.log('HAS CLICKED CLOSE MODAL')
    var modal = document.getElementById("image-viewer-modal");
    // var span = document.getElementsByClassName("close")[0]; 
    modal.style.display = "none";
  }

  downloadImage()  {
    var modalImg = <HTMLImageElement>document.getElementById("image-viewer-img")
    // console.log('HAS CLICKED CLOSE DWNLD IMG modalImg ', modalImg)
    var modalImgURL = modalImg.src;
    // console.log('HAS CLICKED CLOSE DWNLD IMG modalImgURL ', modalImgURL)
    var captionText = document.getElementById("caption").innerHTML;
    // console.log('HAS CLICKED CLOSE DWNLD IMG captionText ', captionText)

    saveAs(modalImgURL, captionText);
    this.closeImageViewerModal()
  }

}
