import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { OpenaiService } from 'app/services/openai.service';

@Component({
  selector: 'appdashboard-knowledge-bases',
  templateUrl: './knowledge-bases.component.html',
  styleUrls: ['./knowledge-bases.component.scss']
})
export class KnowledgeBasesComponent implements OnInit, OnDestroy {

  public IS_OPEN_SETTINGS_SIDEBAR: boolean;
  public isChromeVerGreaterThan100: boolean;

  addKnowledgeBaseModal = 'none';
  previewKnowledgeBaseModal = 'none';
  deleteKnowledgeBaseModal = 'none';
  secretsModal = 'none';
  showSpinner: boolean = true;
  buttonDisabled: boolean = true;
  addButtonDisabled: boolean = false;
  gptkeyVisible: boolean = false;

  kbForm: FormGroup;
  kbsList = [];

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

  // PREVIEW
  question: string = "";
  answer: string = "";
  source_url: any;
  searching: boolean = false;
  error_answer: boolean = false;
  show_answer: boolean = false;
  kbid_selected: any;

  interval_id;

  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private openaiService: OpenaiService,
    private kbService: KnowledgeBaseService,
    private notify: NotifyService
  ) { }

  ngOnInit(): void {
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
    //this.getKnowledgeBases();
    this.getKnowledgeBaseSettings();
    this.kbForm = this.createConditionGroup();
  }

  startPooling() {
    this.interval_id = setInterval(() => {
      this.checkAllStatuses();
    }, 30000);
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
      this.logger.log('[KNOWLEDGE BASES COMP] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }
  // UTILS FUNCTION - End
  // --------------------


  getKnowledgeBaseSettings() {
    this.kbService.getKbSettings().subscribe((kbSettings: KbSettings) => {
      this.logger.debug("[KNOWLEDGE BASES COMP] get kbSettings: ", kbSettings);
      this.kbSettings = kbSettings;
      if (this.kbSettings.kbs.length < kbSettings.maxKbsNumber) {
        this.addButtonDisabled = false;
      } else {
        this.addButtonDisabled = true;
      }
      this.checkAllStatuses();
      this.startPooling();
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR get kbSettings: ", error);
    }, () => {
      this.logger.info("[KNOWLEDGE BASES COMP] get kbSettings *COMPLETE*");
      this.showSpinner = false;
    })
  }

  createConditionGroup(): FormGroup {
    return this.formBuilder.group({
      url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]]
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

    let first_index = this.newKb.url.indexOf('://');
    let second_index = this.newKb.url.indexOf('www.');

    let split_index;
    if (first_index !== -1 || first_index !== -1) {
      if (second_index > first_index) {
        split_index = second_index + 4;
      } else {
        split_index = first_index + 3;
      }
      this.newKb.name = this.newKb.url.substring(split_index);
    } else {
      this.newKb.name = this.newKb.url;
    }

    this.kbService.addNewKb(this.kbSettings._id, this.newKb).subscribe((savedSettings: KbSettings) => {
      this.runIndexing(this.newKb);
      this.getKnowledgeBaseSettings();
      let kb = savedSettings.kbs.find(kb => kb.url === this.newKb.url);
      this.checkStatus(kb).then((status_code) => {
        if (status_code === 0) {
          this.runIndexing(kb);
        }
        this.closeAddKnowledgeBaseModal();
      })
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR add new kb: ", error);
    }, () => {
      this.logger.info("[KNOWLEDGE BASES COMP] add new kb *COMPLETED*");
    })
  }

  saveKnowledgeBaseSettings() {
    this.kbService.saveKbSettings(this.kbSettings).subscribe(((savedSettings) => {
      this.getKnowledgeBaseSettings();
      this.closeSecretsModal();
    }), (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR save kb settings: ", error);
    }, () => {
      this.logger.info("[KNOWLEDGE BASES COMP] save kb settings *COMPLETE*");
    })
  }

  deleteKnowledgeBase(id) {
    this.logger.debug("[KNOWLEDGE BASES COMP] kb to delete id: ", id);
    this.kbService.deleteKb(this.kbSettings._id, id).subscribe((response) => {
      this.getKnowledgeBaseSettings();
      this.closeDeleteKnowledgeBaseModal();
    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR delete kb: ", error);
    }, () => {
      this.logger.info("[KNOWLEDGE BASES COMP] delete kb *COMPLETE*");
    })
  }

  runIndexing(kb) {
    let data = {
      full_url: kb.url,
      gptkey: this.kbSettings.gptkey
    }
    this.openaiService.startScraping(data).subscribe((response: any) => {
      console.log("start scraping response: ", response);
      if (response.message && response.message === "Invalid Openai API key") {
        this.notify.showWidgetStyleUpdateNotification("Invalid Openai API key", 4, 'report_problem');
      }
      setTimeout(() => {
        this.checkStatus(kb).then((status_code: number) => {
          kb.status = status_code;
        })
      }, 1000);
    }, (error) => {
      console.error("error start scraping response: ", error);
    }, () => {
      console.log("start scraping *COMPLETE*");
    })
  }

  checkAllStatuses() {
    
    // SCANDALOSO - DA ELIMINARE IL PRIMA POSSIBILE
    // INDAGARE CON PUGLIA AI
    // Anche perchè ogni tanto risponde con tutti status 0 anche con 500ms di delay
    let promises = [];
    for (let i = 0; i < this.kbSettings.kbs.length; i++) {
      const delay = 500 * i;
      let kb = this.kbSettings.kbs[i];

      setTimeout(() => {
        promises.push(this.checkStatus(kb).then((status_code: number) => {
          kb.status = status_code;
          i = i + 1;
        }).catch((err) => {
          this.logger.error("kb " + kb.url + " error: " + err);
        }))
      }, delay);
    }

    Promise.all(promises).then((response) => {
      console.log("Promise All *COMPLETED* ", response);
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

  submitQuestion() {
    let data = {
      question: this.question,
      kbid: this.kbid_selected.url,
      gptkey: this.kbSettings.gptkey
    }

    this.searching = true;
    this.show_answer = false;

    this.answer = null;
    this.source_url = null;

    this.openaiService.askGpt(data).subscribe((response: any) => {
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

  showHideSecret(target) {
    this.gptkeyVisible = !this.gptkeyVisible;
    // let el = <HTMLInputElement>document.getElementById(target);
    // if (el.type === "password") {
    //   this.gptkeyVisible = true;
    //   el.type = "text";
    // } else {
    //   this.gptkeyVisible = false;
    //   el.type = "password"
    // }
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

  openSecretsModal() {
    this.secretsModal = 'block';
    if (this.kbSettings.gptkey) {
      let el = <HTMLInputElement>document.getElementById('gptkey-key');
      el.type = "password"
      this.gptkeyVisible = false;
    } else {
      this.gptkeyVisible = true;
    }
  }

  closeAddKnowledgeBaseModal() {
    this.addKnowledgeBaseModal = 'none';
    this.newKb = { name: '', url: ''}
  }

  closePreviewKnowledgeBaseModal() {
    this.previewKnowledgeBaseModal = 'none';
    this.question = "";
    this.answer = "";
    this.source_url = null;
    this.searching = false;
    this.error_answer = false;
    this.show_answer = false;
    let element = document.getElementById('enter-button')
    element.style.display = 'none';
  }

  closeDeleteKnowledgeBaseModal() {
    this.deleteKnowledgeBaseModal = 'none';
  }

  closeSecretsModal() {
    this.secretsModal = 'none';
  }

  ngOnDestroy(): void {
    clearInterval(this.interval_id);
  }

}
