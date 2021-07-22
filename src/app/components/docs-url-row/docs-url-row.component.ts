import { Component, OnInit , Input} from '@angular/core';
import { LoggerService } from '../../services/logger/logger.service';
@Component({
  selector: 'appdashboard-docs-url-row',
  templateUrl: './docs-url-row.component.html',
  styleUrls: ['./docs-url-row.component.scss']
})
export class DocsUrlRowComponent implements OnInit {
  @Input() doctitle: string;
  @Input() docurl: string;
  @Input() customtext: boolean;
  @Input() text_to_display: string;
  
  translateparam: any; 
  constructor(
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.translateparam = { helpdoc: this.doctitle };
    this.logger.log('[Docs_Url_Row-COMP] doctitle ', this.doctitle);
    this.logger.log('[Docs_Url_Row-COMP] docurl ', this.docurl)  
    this.logger.log('[Docs_Url_Row-COMP] customtext ', this.customtext)  
    this.logger.log('[Docs_Url_Row-COMP]text_to_display ', this.text_to_display) 
  }

}
