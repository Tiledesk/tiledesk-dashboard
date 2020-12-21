import { slideInOutAnimation } from './../_animations/slide-in-out.animation';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkerService } from './../services/marker.service';
import { Component, AfterViewInit, OnInit, Input, Output, EventEmitter, HostListener, SimpleChanges } from '@angular/core';
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
  host: { '[@slideInOutAnimation]': '' }
})
export class MapRequestComponent implements OnInit, AfterViewInit {

  //@Input() wsRequestsServed: Request[];
  @Input() wsRequestsServed: any[];
  @Input() wsRequestsUnserved: any[];
  @Output() closeMapsView = new EventEmitter();

  requests: Request[];
  private map;
  projectId: any;
  i = 1;
  afterViewFlag: boolean = false;

  constructor(private markerService: MarkerService,
    private acRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    console.log("--- MAP REQUESTS --- SERVED REQUEST: ", this.wsRequestsServed)
    console.log("--- MAP REQUESTS --- UNSERVED REQUEST: ", this.wsRequestsUnserved)

    if (this.wsRequestsServed[0]) {
      this.projectId = this.wsRequestsServed[0].id_project;
    }
  }
  
  ngOnChanges(changes: SimpleChanges) {
    console.log("ONCHANGES: ", changes)
    if(this.map) {
      if (changes.wsRequestsServed.currentValue != changes.wsRequestsServed.previousValue) {
        this.markerService.makeSegnalationsServedMarkers(this.map, this.wsRequestsServed)
      }

      if (changes.wsRequestsUnserved.currentValue != changes.wsRequestsUnserved.previousValue){
        this.markerService.makeSegnalationsUnservedMarkers(this.map, this.wsRequestsUnserved)
      }

    }
  }

  ngAfterViewInit(): void {
    console.log("AFTERVIEWINIT - REQUESTS TO SHOW ON MAP: ", this.wsRequestsServed);
    this.afterViewFlag = true;
    this.initMap();
    this.markerService.makeSegnalationsServedMarkers(this.map, this.wsRequestsServed)
    this.markerService.makeSegnalationsUnservedMarkers(this.map, this.wsRequestsUnserved);
    //this.markerService.makeSegnalationsMarkers(this.map, this.wsRequestsServed);
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

  goToRequestDetail(requestId) {
    console.log("GO TO DETAIL --- REQUEST ID: ", requestId)
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + requestId + '/messages']);
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.classList.contains("goToRequestDetail")) {
      const button = event.target;
      this.goToRequestDetail(button.value);
    }
  }

  closeRightSideBar() {
    console.log("CLOSE RIGHT SIDEBAR");
    this.closeMapsView.emit();
  }
}
