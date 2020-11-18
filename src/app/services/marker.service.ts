import { PopupService } from './popup.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable()
export class MarkerService {

  capitals: string = '/assets/data/us_capitals.geojson';
  urlOR: string = 'http://test.api.openrecordz.com/service/v1/datasets/5f914471e4b03389c65eaaf3';

  static ScaledRadius(val: number, maxVal: number): number {
    return 20 * (val / maxVal);
  }

  constructor(private http: HttpClient,
        private popupService: PopupService) { }

  makeSegnalationsMarkers(map: L.map): void {
    this.http.get(this.urlOR).subscribe((res: any) => {
      console.log("RESPONSE OPENRECORDZ: ", res)
      for (let record of res) {
        const lat = record._latitude;
        const lon = record._longitude;
        const marker = L.marker([lat, lon]);

        marker.bindPopup(this.popupService.makeSegnalationsPopup(record));
        marker.addTo(map);
      }
    })
  }
  
  // makeCapitalMarkers(map: L.map): void {
  //   this.http.get(this.capitals).subscribe((res: any) => {
  //     for (const c of res.features) {
  //       const lat = c.geometry.coordinates[0];
  //       const lon = c.geometry.coordinates[1];
  //       const marker = L.marker([lon, lat]).addTo(map);
  //       console.log("MARKER: ", marker)
  //     }
  //   })
  // }

  // makeCapitalCircleMarkers(map: L.map): void {
  //   this.http.get(this.capitals).subscribe((res: any) => {

  //     // Find the maximum population to scale the radii by.
  //     const maxVal = Math.max(...res.features.map(x => x.properties.population), 0);

  //     for (const c of res.features) {
  //       const lat = c.geometry.coordinates[0];
  //       const lon = c.geometry.coordinates[1];
  //       const circle = L.circleMarker([lon,lat], {
  //         radius: MarkerService.ScaledRadius(c.properties.population, maxVal)
  //       }).addTo(map);
  //     }
  //   });
  // }
}
