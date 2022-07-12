import { slideInOutAnimation } from './../_animations/slide-in-out.animation';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkerService } from './../services/marker.service';
import { Component, AfterViewInit, OnInit, Input, Output, EventEmitter, HostListener, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { LoggerService } from './../services/logger/logger.service';

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
  @Input() calling_page: string
  @Output() closeMapsView = new EventEmitter();

  requests: Request[];
  private map;
  projectId: any;
  i = 1;
  afterViewFlag: boolean = false;
  SIDEBAR_APPS_IN_CHAT_PANEL_MODE: boolean;
  // lat: number;
  // lon: number;
  constructor(
    private markerService: MarkerService,
    private router: Router,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.getIfRouteUrlIsRequestForPanel();
    // console.log("[MAP-REQUESTS] - ngOnInit CALLING PAGE: ", this.calling_page)
    // console.log("[MAP-REQUESTS] - ngOnInit SERVED REQUEST: ", this.wsRequestsServed)
    // console.log("[MAP-REQUESTS] - ngOnInit UNSERVED REQUEST: ", this.wsRequestsUnserved)

    if (this.wsRequestsServed[0]) {
      this.projectId = this.wsRequestsServed[0].id_project;
    }
  }

  getIfRouteUrlIsRequestForPanel() {
    this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE = false
    if (this.router.url.indexOf('/request-for-panel') !== -1) {
      this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE = true;
      this.logger.log('[MAP-REQUESTS] - SIDEBAR_APPS_IN_CHAT_PANEL_MODE »»» ', this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE);


    } else {
      this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE = false;
      this.logger.log('[MAP-REQUESTS] - SIDEBAR_APPS_IN_CHAT_PANEL_MODE »»» ', this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE);

    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.log("[MAP-REQUESTS] - ONCHANGES: ", changes)
    if (this.map) {
      if (changes.wsRequestsServed.currentValue != changes.wsRequestsServed.previousValue) {
        this.markerService.makeSegnalationsServedMarkers(this.map, this.wsRequestsServed, this.calling_page)
      }

      if (changes.wsRequestsUnserved.currentValue != changes.wsRequestsUnserved.previousValue) {
        this.markerService.makeSegnalationsUnservedMarkers(this.map, this.wsRequestsUnserved, this.calling_page)
      }

    }
  }

  ngAfterViewInit(): void {
    //  console.log("[MAP-REQUESTS] - AFTERVIEWINIT - REQUESTS TO SHOW ON MAP: ", this.wsRequestsServed);
    this.afterViewFlag = true;
    this.initMap();
    this.markerService.makeSegnalationsServedMarkers(this.map, this.wsRequestsServed, this.calling_page)
    this.markerService.makeSegnalationsUnservedMarkers(this.map, this.wsRequestsUnserved, this.calling_page);
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [41.8919300, 12.5113300],
      // zoom: 6
      zoom: 3
    });
    if (this.calling_page === 'conv_details') {
      if (this.wsRequestsServed.length > 0 && this.wsRequestsServed[0]['location'] && this.wsRequestsServed[0]['location']['geometry']) {
        // console.log('[MAP-REQUESTS] wsRequestsServed > location > geometry > coordinates' , this.wsRequestsServed[0]['location']['geometry']['coordinates'])
        const Lat  =  this.wsRequestsServed[0]['location']['geometry']['coordinates'][0];
        const Lng  =  this.wsRequestsServed[0]['location']['geometry']['coordinates'][1]
        this.map.panTo(new L.LatLng(Lat, Lng));
      }
      if (this.wsRequestsUnserved.length > 0 && this.wsRequestsUnserved[0]['location'] && this.wsRequestsUnserved[0]['location']['geometry']) {
        // console.log('[MAP-REQUESTS] wsRequestsServed > location > geometry > coordinates' , this.wsRequestsServed[0]['location']['geometry']['coordinates'])
        const Lat  =  this.wsRequestsUnserved[0]['location']['geometry']['coordinates'][0];
        const Lng  =  this.wsRequestsUnserved[0]['location']['geometry']['coordinates'][1]
        this.map.panTo(new L.LatLng(Lat, Lng));
      }
    }

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    this.logger.log(L.Icon.Default.prototype._getIconUrl())

    tiles.addTo(this.map);

  }

  goToRequestDetail(requestId) {
    this.logger.log("[MAP-REQUESTS]  GO TO DETAIL - REQUEST ID: ", requestId)
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
    this.logger.log("[MAP-REQUESTS] - CLOSE RIGHT SIDEBAR");
    this.closeMapsView.emit();
  }
}
