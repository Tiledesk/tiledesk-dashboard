import { Injectable } from '@angular/core';

@Injectable()
export class PopupService {

  constructor() { }

  makeSegnalationsPopup(data: any): string {
    let category: string = data._category.replace('_', ' ');
    let categoryCapitalize = category.charAt(0).toUpperCase() + category.slice(1);
    return `` + 
      `<div>Segnalato da: <b>${ data._fullName }</b></div>` + 
      `<div>Tipo: <b>${ categoryCapitalize }</xb></div>`
  }
}
