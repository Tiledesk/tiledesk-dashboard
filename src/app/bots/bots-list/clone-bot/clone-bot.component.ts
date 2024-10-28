import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { LoggerService } from 'app/services/logger/logger.service';
@Component({
  selector: 'appdashboard-clone-bot',
  templateUrl: './clone-bot.component.html',
  styleUrls: ['./clone-bot.component.scss']
})
export class CloneBotComponent implements OnInit {
  public projects: any;
  public activeProjects: any;
  public bot_name: string;
  public current_project_id: string;
  public selectedProjectId: Project;
  public selectedProject: Project;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CloneBotComponent>,
    public auth: AuthService,
    private router: Router,
    private logger: LoggerService,
  ) {
    this.logger.log('[CLONE-BOT] data ', data)
    this.projects = data.projects;
    this.bot_name = data.botName;
    this.current_project_id = data.currentProjectId
    this.logger.log('[CLONE-BOT] data botName  ', this.bot_name)
    // console.log('[CLONE-BOT] data projects  ', this.projects)
    this.logger.log('[CLONE-BOT] data current_project_id  ', this.current_project_id)

  this.activeProjects = this.projects.filter( (project) => {
      return project.id_project.status === 100
    });

    // console.log('[CLONE-BOT] newArray  ', this.activeProjects)
  }

  ngOnInit(): void {
  }


  onSelectProject(selectedprojectid) {
    this.logger.log('[CLONE-BOT] - ON SELECTED PROJECT - selectedprojectid ', selectedprojectid)
    this.selectedProjectId = selectedprojectid
  }


  duplicateChatbot() {
    // console.log('[CLONE-BOT] - DUPLICATE CHATBOT selectedProjectId ', this.selectedProjectId)
    
    this.projects.forEach(project => {
      // this.logger.log('[CLONE-BOT] - GET PROJECTS  project ', project);
      if (project.id_project.id === this.selectedProjectId) {
        // console.log('[CLONE-BOT] - GET PROJECTS selected project user ', project);
        const _project = project.id_project
        // console.log('[CLONE-BOT] - GET PROJECTS selected project  ', _project);
        // console.log('[CLONE-BOT] - GET PROJECTS selected project id ', _project._id);

        _project['role'] =  project['role']



        // const selectedProject: Project = {
        //   _id: project['id_project']['_id'],
        //   name: project['id_project']['name'],
        //   operatingHours: project['id_project']['activeOperatingHours'],
        //   profile_type: project['id_project']['profile'].type,
        //   profile_name: project['id_project']['profile'].name,
        //   trial_expired: project['id_project']['trialExpired']
        // }
        this.auth.projectSelected(_project, 'clone-bot')
        // localStorage.setItem(_project._id, JSON.stringify(_project));
        this.router.navigate(['project/' + this.selectedProjectId + '/bots/my-chatbots/all']);

        localStorage.setItem('last_project', JSON.stringify(project))
      }
    });


    this.closeDialog()
  }

  closeDialog() {
    this.dialogRef.close(this.selectedProjectId)
  }




}
