import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { OpenaikbsService } from 'app/services/openaikbs.service';

@Component({
  selector: 'appdashboard-knowledge-bases',
  templateUrl: './knowledge-bases.component.html',
  styleUrls: ['./knowledge-bases.component.scss']
})
export class KnowledgeBasesComponent implements OnInit {

  public IS_OPEN_SETTINGS_SIDEBAR: boolean;
  public isChromeVerGreaterThan100: boolean;

  addKnowledgeBaseModal = 'none';
  previewKnowledgeBaseModal = 'none';
  deleteKnowledgeBaseModal = 'none';
  showSpinner: boolean = true;
  buttonDisabled: boolean = true;
  addButtonDisabled: boolean = false;

  kbForm: FormGroup;
  kbsList = [];

  newKb = {
    name: '',
    url: '',
    gptkey: ''
  }

  // PREVIEW
  question: string = "";
  answer: string = "";
  source_url: any;
  searching: boolean = false;
  error_answer: boolean = false;
  show_answer: boolean = false;
  kbid_selected: any;

  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private openaikbService: OpenaikbsService
  ) { }

  ngOnInit(): void {
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
    this.getKnowledgeBases();
    this.kbForm = this.createConditionGroup();
  }

  // ----------------------
  // UTILS FUNCTION - Start
  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[HOURS] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }
  // UTILS FUNCTION - End
  // --------------------

  getKnowledgeBases() {
    this.openaikbService.getAllOpenaikbs().subscribe((kbs: any[]) => {
      this.kbsList = kbs;
      if (this.kbsList.length === 3) {
        this.addButtonDisabled = true;
      } else {
        this.addButtonDisabled = false
      }
      this.checkAllStatuses();
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR get all kbs");
    }, () => {
      this.logger.info("[KNOWLEDGE BASES COMP] get all kbs *COMPLETE*");
      this.showSpinner = false;
    })
  }

  createConditionGroup(): FormGroup {
    return this.formBuilder.group({
      url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      gptkey: ['', Validators.required]
    })
  }

  onChangeInput(event): void {
    if (this.kbForm.valid) {
      this.buttonDisabled = false;
    } else {
      this.buttonDisabled = true;
    }
  }

  onInputPreviewChange() {
    let element = document.getElementById('enter-button')
    if (this.question !== "") {
      element.style.display = 'inline-block';
    } else {
      element.style.display = 'none';
    }
  }

  saveKnowledgeBase() {

    if (this.kbsList.length === 3) {
      return false;
    }

    let first_index = this.newKb.url.indexOf('://') + 3;
    let second_index = this.newKb.url.indexOf('www.') + 4;

    let split_index;
    if (second_index > first_index) {
      split_index = second_index;
    } else {
      split_index = first_index;
    }
    this.newKb.name = this.newKb.url.substring(split_index);

    this.openaikbService.addOpenaiKb(this.newKb).subscribe((savedKb) => {
      this.getKnowledgeBases();
      this.closeAddKnowledgeBaseModal();
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR add new kb: ", error);
    }, () => {
      this.logger.info("[KNOWLEDGE BASES COMP] add new kb *COMPLETED*");
    })
  }

  deleteKnowledgeBase(id) {
    this.openaikbService.deleteOpenaiKb(id).subscribe((response) => {
      this.getKnowledgeBases();
      this.closeDeleteKnowledgeBaseModal();
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR delete kb: ", error);
    }, () => {
      this.logger.info("[KNOWLEDGE BASES COMP] delete kb *COMPLETE*: ");
    })
  }

  runIndexing(kb) {
    let data = {
      full_url: kb.url,
      gptkey: kb.gptkey
    }
    this.openaikbService.startScraping(data).subscribe((response) => {
      console.log("start scraping response: ", response);
    }, (error) => {
      console.error("error start scraping response: ", error);
    }, () => {
      console.log("start scraping *COMPLETE*");
    })
  }

  checkAllStatuses() {
    let promises = [];
    this.kbsList.forEach((kb) => {
      promises.push(this.checkStatus(kb).then((status_code) => {
        console.log("kb " + kb.url + " status: " + status_code);
        kb.status = status_code;
      }).catch((err) => {
        console.log("kb " + kb.url + " error: " + err);
      }))
    })

    Promise.all(promises).then((res) => {
      console.log("Promise all COMPLETED");
    })
  }

  checkStatus(kb) {
    let data = {
      "full_url": kb.url
    }
    return new Promise((resolve, reject) => {
      this.openaikbService.checkScrapingStatus(data).subscribe((response: any) => {
        console.log("checkScrapingStatus response ----> : ", response);
        resolve(response.status_code);
      }, (error) => {
        reject(null)
      })
    })
  }

  submitQuestion() {
    let data = {
      question: this.question,
      kbid: this.kbid_selected.url,
      gptkey: this.kbid_selected.gptkey
    }

    this.searching = true;
    this.show_answer = false;

    this.openaikbService.askGpt(data).subscribe((response: any) => {
      if (response.success == false) {
        this.error_answer = true;
      } else {
        this.answer = response.answer;
        this.source_url = response.source_url;
      }

      this.show_answer = true;
      this.searching = false;
      setTimeout(() => {
        let element = document.getElementById("answer");
        element.classList.add('answer-active');
      }, (200));
    }, (error) => {
      this.logger.error("ERROR ask gpt: ", error);
      this.searching = false;
    }, () => {
      this.logger.info("ask gpt *COMPLETE*")
      this.searching = false;
    })
  }

  openAddKnowledgeBaseModal() {
    this.addKnowledgeBaseModal = 'block';
  }

  openPreviewKnowledgeBaseModal(kb) {
    this.kbid_selected = kb;
    this.previewKnowledgeBaseModal = 'block';
  }

  openDeleteKnowledgeBaseModal(kb) {
    this.kbid_selected = kb;
    this.deleteKnowledgeBaseModal = 'block';
  }

  closeAddKnowledgeBaseModal() {
    this.addKnowledgeBaseModal = 'none';
    this.newKb = { name: '', url: '', gptkey: ''}
  }

  closePreviewKnowledgeBaseModal() {
    this.previewKnowledgeBaseModal = 'none';
  }

  closeDeleteKnowledgeBaseModal() {
    this.deleteKnowledgeBaseModal = 'none';
  }

}
