import { Location } from '@angular/common';
import { slideInOutAnimation } from './../_animations/slide-in-out.animation';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkerService } from './../services/marker.service';
import { Component, AfterViewInit, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import * as L from 'leaflet';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'appdashboard-map-request',
  templateUrl: './map-request.component.html',
  styleUrls: ['./map-request.component.scss'],
  animations: [slideInOutAnimation],
  host: { '[@slideInOutAnimation]': ''}
})
export class MapRequestComponent implements OnInit, AfterViewInit {
  
  //@Input() wsRequestsServed: Request[];
  @Input() wsRequestsServed: any[];
  @Output() closeMapsView = new EventEmitter();

  private map;
  
  constructor(private markerService: MarkerService,
      private acRoute: ActivatedRoute,
      private router: Router) { }

  ngOnInit() {
    console.log("REQUESTS TO SHOW ON MAP: ", this.wsRequestsServed);
    console.log("Location ", this.wsRequestsServed[0].location);
  }


  ngAfterViewInit(): void {
    this.initMap();
    this.markerService.makeSegnalationsMarkers(this.map);
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [41.8919300, 12.5113300],
      zoom: 6
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    console.log(L.Icon.Default.prototype._getIconUrl())

    tiles.addTo(this.map);

  }

  closeRightSideBar() {
    console.log("CLOSE RIGHT SIDEBAR");
    this.closeMapsView.emit();
  }
}
