import { PopupService } from './popup.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as L from 'leaflet';

import { LoggerService } from '../services/logger/logger.service';
@Injectable()
export class MarkerService {

  capitals: string = '/assets/data/us_capitals.geojson';
  //urlOR: string = 'http://test.api.openrecordz.com/service/v1/datasets/5f914471e4b03389c65eaaf3';

  static ScaledRadius(val: number, maxVal: number): number {
    return 20 * (val / maxVal);
  }

  constructor(
    private http: HttpClient,
    private popupService: PopupService,
    private logger: LoggerService
    ) { }



  makeSegnalationsMarkers(map: L.map, requests): void {
    for (let request of requests) {
      // Check if request have location field. Only new request have it.
      if (request.location) {
        const lat = request.location.geometry.coordinates[0];
        const lon = request.location.geometry.coordinates[1];
        const marker = L.marker([lat, lon]);

        marker.bindPopup(this.popupService.makeSegnalationsServedPopup(request));
        marker.addTo(map);

      } else {
        this.logger.error("[MARKER-SERV] make Segnalations Markers - Location not available for this request." ,requests)
      }

    }
  }

  makeSegnalationsServedMarkers(map: L.map, requests): void {
    for (let request of requests) {
      if (request.status === 200) {
        this.logger.log("[MARKER-SERV] make Segnalations Served Markers - add to served request");
        if (request.location) {
          const lat = request.location.geometry.coordinates[0];
          const lon = request.location.geometry.coordinates[1];

          const marker = L.marker([lat, lon], {
            icon: L.icon({
              iconUrl: 'assets/img/marker/blue.png',
              shadowUrl: 'assets/img/marker/marker-shadow.png',
              iconSize: [25, 41],
              shadowSize: [30, 34],
              iconAnchor: [13, 41],
              shadowAnchor: [10, 32],
              popupAnchor: [-1, -34]
            })
          });
          marker.bindPopup(this.popupService.makeSegnalationsServedPopup(request));
          marker.addTo(map);
        }
      }
    }
  }

  makeSegnalationsUnservedMarkers(map: L.map, requests): void {
    for (let request of requests) {
      if (request.status === 100) {
        this.logger.log("[MARKER-SERV] make Segnalations Unserved Markers - add to unserved requests");
        if (request.location) {
          const lat = request.location.geometry.coordinates[0];
          const lon = request.location.geometry.coordinates[1];

          const marker = L.marker([lat, lon], {
            icon: L.icon({
              iconUrl: 'assets/img/marker/red.png',
              shadowUrl: 'assets/img/marker/marker-shadow.png',
              iconSize: [25, 41],
              shadowSize: [30, 34],
              iconAnchor: [13, 41],
              shadowAnchor: [10, 32],
              popupAnchor: [-1, -34],
            })
          });
          marker.bindPopup(this.popupService.makeSegnalationsUnservedPopup(request));
          marker.addTo(map);
        }
      }
    }
  }

  // makeSegnalationsMarkersFromOR(map: L.map): void {
  //   this.http.get(this.urlOR).subscribe((res: any) => {
  //     this.logger.log("RESPONSE OPENRECORDZ: ", res)
  //     for (let record of res) {
  //       const lat = record._latitude;
  //       const lon = record._longitude;
  //       const marker = L.marker([lat, lon]);

  //       marker.bindPopup(this.popupService.makeSegnalationsPopup(record));
  //       marker.addTo(map);
  //     }
  //   })
  //}

}
