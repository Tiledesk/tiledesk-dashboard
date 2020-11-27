import { Injectable } from '@angular/core';

@Injectable()
export class PopupService {

  constructor() { }

  makeSegnalationsServedPopup(request: any): string {

    console.log("request: ", request)
    console.log("request.first_text", request.first_text)
    console.log("request.department.name", request.department.name)
    let requester = request.requester_fullname_initial;
    console.log("REQUESTER: ", requester)
    if (requester === 'N/A') {
      requester = 'Guest'
    }
    let createdAt = this.timeSince(request.createdAt);
    
    return "" +
      "<div>Message: <b>" + request.first_text + "</b></div>" +
      "<div>Requester: <b>" + requester + "</b></div>" +
      "<div>Department: <b>" + request.department.name + "</b></div>" +
      "<div>Served by: <b>" + request.participanting_Agents[0].firstname + request.participanting_Agents[0].lastname.slice(0, 1) + "." + "</b></div>" +
      "<div>Created: <b>" + createdAt + "</b></div>" +
      "<div><button class='btn btn-primary btn-xs goToRequestDetail' value=" + request.request_id + ">Request Detail</button></div>"

  }

  makeSegnalationsUnservedPopup(request: any): string {
    console.log("request: ", request)
    let requester = request.requester_fullname_initial;
    if (requester === 'N/A') {
      requester = 'Guest'
    }
    let createdAt = this.timeSince(request.createdAt);
    
    return "" +
      "<div>Message: <b>" + request.first_text + "</b></div>" +
      "<div>Requester: <b>" + requester + "</b></div>" +
      "<div>Department: <b>" + request.department.name + "</b></div>" +
      "<div>Created: <b>" + createdAt + "</b></div>" +
      "<div><button class='btn btn-primary btn-xs goToRequestDetail' value=" + request.request_id + ">Request Detail</button></div>"
  }

  // makeSegnalationsPopupFromOR(data: any): string {
  //   let category: string = data._category.replace('_', ' ');
  //   let categoryCapitalize = category.charAt(0).toUpperCase() + category.slice(1);

  //   return `` +
  //     `<div>Requester: <b>Nome Cognome</b></div>` +
  //     `<div>Tipo: <b>${categoryCapitalize}</xb></div>`
  // }

  timeSince(date) {

    let requestDate = new Date(date).valueOf() / 1000;
    var seconds = Math.floor(((new Date().getTime() / 1000) - requestDate))

    var interval = seconds / 31536000;


    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    //return Math.floor(seconds) + " few seconds ago";
    return "few seconds ago";
  }


}
