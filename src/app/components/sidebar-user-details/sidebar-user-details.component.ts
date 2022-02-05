import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'appdashboard-sidebar-user-details',
  templateUrl: './sidebar-user-details.component.html',
  styleUrls: ['./sidebar-user-details.component.scss']
})
export class SidebarUserDetailsComponent implements OnInit {
  @Input() HAS_CLICKED_OPEN_USER_DETAIL: boolean = false;
 @Output() valueChange = new EventEmitter();

  constructor() { }
  ngOnInit() {
  }

  ngOnChanges() {
    console.log('[SIDEBAR-USER-DETAILS] HAS_CLICKED_OPEN_USER_DETAIL', this.HAS_CLICKED_OPEN_USER_DETAIL)
    var element = document.getElementById('user-details');
    console.log('[SIDEBAR-USER-DETAILS] element', element)
    if (this.HAS_CLICKED_OPEN_USER_DETAIL === true) {
      element.classList.add("active");
    }
  }


  closeUserDetailSidePanel () {
    var element = document.getElementById('user-details');
    element.classList.remove("active");
    console.log('[SIDEBAR-USER-DETAILS] element', element)
    this.valueChange.emit(false);
  }



}
