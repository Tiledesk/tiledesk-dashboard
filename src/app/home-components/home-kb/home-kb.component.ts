import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HomeKbModalComponent } from './home-kb-modal/home-kb-modal.component';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { OpenaiService } from 'app/services/openai.service';
import { AuthService } from 'app/core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'appdashboard-home-kb',
  templateUrl: './home-kb.component.html',
  styleUrls: ['./home-kb.component.scss']
})
export class HomeKbComponent implements OnInit {
  @Output() trackUserAction = new EventEmitter()
  addButtonDisabled: boolean = false;
  project: any;
  kbSettings: KbSettings = {
    _id: null,
    id_project: null,
    gptkey: null,
    maxKbsNumber: null,
    maxPagesNumber: null,
    kbs: []
  }

  newKb: KB = {
    _id: null,
    name: '',
    url: ''
  }
  constructor(
    public dialog: MatDialog,
    private kbService: KnowledgeBaseService,
    private logger: LoggerService,
    private openaiService: OpenaiService,
    private auth: AuthService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.getKnowledgeBaseSettings();
    this.getCurrentProject();
  }

  getCurrentProject() {
    this.logger.log('[HOME-KB] - $ubscribe to CURRENT PROJECT ',this.project)
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      
    })
  }


  presentModalAddKb() {
    this.logger.log('[HOME-KB] - presentModalAddKb ');
    const addKbBtnEl = <HTMLElement>document.querySelector('#home-material-btn'); 
    this.logger.log('[HOME-KB] - presentModalAddKb addKbBtnEl ', addKbBtnEl);
    addKbBtnEl.blur()
    const dialogRef = this.dialog.open(HomeKbModalComponent, {
      width: '600px',
      // data: {
      //   calledBy: 'step1'
      // },
    })

    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`[HOME-KB] Dialog result:`, result);

      if (result) {
        this.newKb = result.newKb;
        this.kbSettings = result.kbSettings;

        this.logger.log(`[HOME-KB] Dialog this.newKb:`, this.newKb);

        if (this.newKb) {
          this.saveKnowledgeBase()
        }
      }
    });
  }


  saveKnowledgeBase() {

    let first_index = this.newKb.url.indexOf('://') + 3;
    let second_index = this.newKb.url.indexOf('www.') + 4;
    let split_index;
    if (second_index > first_index) {
      split_index = second_index;
    } else {
      split_index = first_index;
    }
    this.newKb.name = this.newKb.url.substring(split_index);

    this.kbService.addNewKb(this.kbSettings._id, this.newKb).subscribe((savedSettings: KbSettings) => {
      this.getKnowledgeBaseSettings();
      let kb = savedSettings.kbs.find(kb => kb.url === this.newKb.url);
      this.checkStatus(kb).then((status_code) => {
        if (status_code === 0) {
          this.runIndexing(kb);
        }
      })
    }, (error) => {
      this.logger.error("[HOME-KB]] ERROR add new kb: ", error);
    }, () => {
      this.logger.info("[HOME-KB]] add new kb *COMPLETED*");
    })
  }

  getKnowledgeBaseSettings() {
    this.kbService.getKbSettings().subscribe((kbSettings: KbSettings) => {
      this.logger.log("[HOME-KB] get kbSettings: ", kbSettings);
      this.kbSettings = kbSettings;
    
      if (this.kbSettings.kbs.length < kbSettings.maxKbsNumber) {
        this.addButtonDisabled = false;
      } else {
        this.addButtonDisabled = true;
      }
      // this.checkAllStatuses();
    }, (error) => {
      this.logger.error("[HOME-KB] ERROR get kbSettings: ", error);
    }, () => {
      this.logger.log("[HOME-KB] get kbSettings *COMPLETE*");
    })
  }

  checkStatus(kb) {
    let data = {
      "full_url": kb.url
    }
    return new Promise((resolve, reject) => {
      this.openaiService.checkScrapingStatus(data).subscribe((response: any) => {
        resolve(response.status_code);
      }, (error) => {
        this.logger.error(error);
        reject(null)
      })
    })
  }

  runIndexing(kb) {
    let data = {
      full_url: kb.url,
      gptkey: this.kbSettings.gptkey
    }
    this.openaiService.startScraping(data).subscribe((response) => {
      this.logger.log("[HOME-KB] start scraping response: ", response);
    }, (error) => {
      this.logger.error("[HOME-KB] error start scraping response: ", error);
    }, () => {
      this.logger.log("[HOME-KB] start scraping *COMPLETE*");
    })
  }

  goToKnowledgeBases() {
    // this.trackUserAction.emit({action:'Home, Add Knowledge Base button clicked',actionRes: null })
    this.logger.log("goToKnowledgeBases -----> project._id: ", this.project._id);
    this.router.navigate(['project/' + this.project._id + '/knowledge-bases/h'])
  }


}
