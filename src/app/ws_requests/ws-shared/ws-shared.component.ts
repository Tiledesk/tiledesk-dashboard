import { Component, OnInit } from '@angular/core';
import { LocalDbService } from '../../services/users-local-db.service';
import { BotLocalDbService } from '../../services/bot-local-db.service';
import { CHANNELS, CHANNELS_NAME, avatarPlaceholder, getColorBck } from '../../utils/util';
import { Router } from '@angular/router';
import { WsRequestsService } from '../../services/websocket/ws-requests.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { UsersService } from '../../services/users.service';
import { NotifyService } from '../../core/notify.service';
import { LoggerService } from '../../services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'appdashboard-ws-shared',
  templateUrl: './ws-shared.component.html',
  styleUrls: ['./ws-shared.component.scss']
})
export class WsSharedComponent implements OnInit {

  priority = [
    {
      id: 1,
      name: 'urgent',
      avatar: 'assets/img/priority_icons/urgent_v2.svg'
    },
    {
      id: 2,
      name: 'high',
      avatar: 'assets/img/priority_icons/high_v2.svg '
    },
    {
      id: 3,
      name: 'medium',
      avatar: 'assets/img/priority_icons/medium_v2.svg'
    },
    {
      id: 4,
      name: 'low',
      avatar: 'assets/img/priority_icons/low_v2.svg'
    },
  ];
  // internal_note.svg
  // public_answer.svg
  responseType = [
    {
      id: 1,
      name: 'Public answer',
      icon: 'assets/img/public_answer.svg'
    },
    {
      id: 2,
      name: 'Internal note',
      icon: 'assets/img/internal_note.svg'
    },

  ]



  members_array: any;
  agents_array: any;
  cleaned_members_array: any;
  requester_fullname_initial: string;
  fillColour: string;
  user_name: string;
  user_email: string;
  department_name: string;
  department_id: string;
  source_page: string;
  participantsInRequests: any;
  conversationTypeInRequests: any;

  depts_array_noduplicate = [];
  OPEN_RIGHT_SIDEBAR = false;
  selectedQuestion: string;
  train_bot_sidebar_height: any;
  newParticipants: any
  user: any;

  // humanAgents: any;
  // botAgents: any;
  humanAgentsIdArray: any;
  botAgentsIdArray: any;
  you_are_successfully_added_to_the_chat: string
  constructor(
    public botLocalDbService: BotLocalDbService,
    public usersLocalDbService: LocalDbService,
    public router: Router,
    public wsRequestsService: WsRequestsService,
    public faqKbService: FaqKbService,
    public usersService: UsersService,
    public notify: NotifyService,
    public logger: LoggerService,
    public translate: TranslateService
  ) { }

  ngOnInit() { }

  // myWindow = window.open('https://console.tiledesk.com/v2/chat5-dev/#/conversation-detail?convId=222', 'Tiledesk - Open Source Live Chat');
  // myWindow.document.write("<p>This is 'myWindow'</p>");
  // if(doFocus)
  //     myWindow.focus();
  // getIndexOfPriority(priorityname: string) {
  //   const index = this.priority.findIndex(x => x.name === priorityname);
  //   return index
  // }
  openChatToTheSelectedConversation(CHAT_BASE_URL: string, requestid: string, requester_fullanme: string) {
    this.logger.log('[WS-SHARED] - openChatToTheSelectedConversation - requestid', requestid);
    this.logger.log('[WS-SHARED] - openChatToTheSelectedConversation - requester_fullanme', requester_fullanme);
    let _requester_fullanme = ""
    if (requester_fullanme.indexOf("#") !== -1) {
      this.logger.log("requester_fullanme contains #");
      _requester_fullanme = requester_fullanme.replace(/#/g, "%23")

    } else {
      this.logger.log("String does not contain #");
      _requester_fullanme = requester_fullanme
    }
    this.logger.log('[WS-SHARED] - openChatToTheSelectedConversation - CHAT_BASE_URL', CHAT_BASE_URL);
    const chatTabCount = localStorage.getItem('tabCount')
    this.logger.log('[WS-SHARED] openChatToTheSelectedConversation chatTabCount ', chatTabCount)

    let baseUrl = CHAT_BASE_URL + '#/conversation-detail/'
    let url = baseUrl + requestid + '/' + _requester_fullanme.trim() + '/active'
    this.logger.log('[WS-SHARED] openChatToTheSelectedConversation url ', url)
    const myWindow = window.open(url, '_self', 'Tiledesk - Open Source Live Chat');
    myWindow.focus();

    // if (chatTabCount) {
    //   if (+chatTabCount > 0) {
    //     this.logger.log('[WS-SHARED] openChatToTheSelectedConversation chatTabCount > 0 ')

    //     url = CHAT_BASE_URL + '#/conversation-detail?convId=' + requestid
    //     this.openWindow('Tiledesk - Open Source Live Chat', url)
    //   } else if (chatTabCount && +chatTabCount === 0) {
    //     url = CHAT_BASE_URL + '#/conversation-detail/' + requestid + "/" + requester_fullanme + "/active"
    //     this.openWindow('Tiledesk - Open Source Live Chat', url)
    //   }
    // } else {
    //   url = CHAT_BASE_URL + '#/conversation-detail/' + requestid + "/" + requester_fullanme + "/active"
    //   this.openWindow('Tiledesk - Open Source Live Chat', url)
    // }
  }

  openWindow(winName: any, winURL: any) {
    const myWindows = new Array();
    if (myWindows[winName] && !myWindows[winName].closed) {
      alert('window already exists');
    } else {
      myWindows[winName] = window.open(winURL, winName);
    }
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Create the agent array from the request's participant id (used in ws-requests-msgs) 
  // -----------------------------------------------------------------------------------------------------
  removeDuplicateAgents(agents_array){
    const unique = agents_array.filter(
      (obj, index) =>
      agents_array.findIndex((item) => item._id === obj._id) === index
    );
    this.logger.log('HERE Y2 USER agents_array (1) unique ', unique)
    this.agents_array = unique
  }

  createAgentsArrayFromParticipantsId(members_array: any, requester_id: string, isFirebaseUploadEngine: boolean, imageStorage: any) {
    this.logger.log('%%% WsRequestsMsgsComponent - calling createAgentsArrayFromParticipantsId');
    this.agents_array = [];
    this.cleaned_members_array = [];
    members_array.forEach(member_id => {
      // !== requester_id
      if (member_id && member_id !== 'system') {

        this.cleaned_members_array.push(member_id);
        this.logger.log('%%% WsRequestsMsgsComponent - CLEANED MEMBERS ARRAY ', this.cleaned_members_array);
        this.logger.log('%%% WsRequestsMsgsComponent - CLEANED MEMBERS isFirebaseUploadEngine ', isFirebaseUploadEngine);
        const memberIsBot = member_id.includes('bot_');

        if (memberIsBot === true) {

          const bot_id = member_id.slice(4);
          this.logger.log('[WS-SHARED][WS-REQUESTS-MSGS] - CREATE-AGENT-ARRAY-FROM-PARTICIPANTS-ID - THE PARTICIP', member_id, 'IS A BOT ', memberIsBot, ' - ID ', bot_id);

          const bot = this.botLocalDbService.getBotFromStorage(bot_id);
          if (bot) {

            this.agents_array.push({ '_id': 'bot_' + bot['_id'], 'firstname': bot['name'], 'isBot': true })

          } else {
            this.agents_array.push({ '_id': member_id, 'firstname': member_id, 'isBot': true })
          }

          // NON è UN BOT
        } else {
          this.logger.log('[WS-SHARED][WS-REQUESTS-MSGS] - CREATE-AGENT-ARRAY-FROM-PARTICIPANTS-ID - MEMBER ', member_id)

          // l'utente è salvato nello storage
          const storeduser = this.usersLocalDbService.getMemberFromStorage(member_id);

          if (storeduser) {
            // console.log('[WS-SHARED][WS-REQUESTS-MSGS] - STORED USER user', storeduser)
            this.logger.log('[WS-SHARED][WS-REQUESTS-MSGS] - STORED USER user id', storeduser['_id'])
            // console.log('[WS-SHARED][WS-REQUESTS-MSGS] - member_id ', member_id)
            if (member_id === storeduser['_id']) {

              let imgUrl = ''
              if (isFirebaseUploadEngine === true) {
                // ------------------------------------------------------------------------------
                // Usecase uploadEngine Firebase 
                // ------------------------------------------------------------------------------
                imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + imageStorage + "/o/profiles%2F" + member_id + "%2Fphoto.jpg?alt=media"

              } else {
                // ------------------------------------------------------------------------------
                // Usecase uploadEngine Native 
                // ------------------------------------------------------------------------------
                imgUrl = imageStorage + "images?path=uploads%2Fusers%2F" + member_id + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
              }

              this.checkImageExists(imgUrl, (existsImage) => {
                if (existsImage == true) {
                  storeduser['hasImage'] = true
                  this.logger.log('HERE Y2 USER storeduser  hasImage', storeduser, 'this.agents_array ', this.agents_array)
                  this.createAgentAvatar(storeduser)
                  this.logger.log('HERE Y2 USER index (1) storeduser id', storeduser['_id'])
                  this.logger.log('HERE Y2 USER index (1) member_id', member_id)
                  // const index = this.agents_array.findIndex(object => object.id === storeduser['_id']);
                  const index = this.agents_array.findIndex(object => object.id === member_id);
                  this.logger.log('HERE Y2 USER index (1)', index)
                  this.logger.log('HERE Y2 USER agents_array (1) ', this.agents_array)
                  
                    if (index === -1) {
                      this.agents_array.push({ '_id': storeduser['_id'], 'firstname': storeduser['firstname'], 'lastname': storeduser['lastname'], 'isBot': false, 'hasImage': storeduser['hasImage'], 'userfillColour': storeduser['fillColour'], 'userFullname': storeduser['fullname_initial'] })
                    }
                    this.removeDuplicateAgents(this.agents_array)
                   
                 
                }
                else {
                  storeduser['hasImage'] = false
                  this.logger.log('HERE Y2 USER storeduser  !hasImage', storeduser, 'this.agents_array ', this.agents_array)
                  this.createAgentAvatar(storeduser)
                  this.logger.log('HERE Y2 USER index (2) storeduser id', storeduser['_id'])
                  this.logger.log('HERE Y2 USER index (2) member_id', member_id)
                  // const index = this.agents_array.findIndex(object => object.id === storeduser['_id']);
                  const index = this.agents_array.findIndex(object => object.id === member_id);
                  this.logger.log('HERE Y2 USER index (2)', index)
                  if (index === -1) {
                    this.agents_array.push({ '_id': storeduser['_id'], 'firstname': storeduser['firstname'], 'lastname': storeduser['lastname'], 'isBot': false, 'hasImage': storeduser['hasImage'], 'userfillColour': storeduser['fillColour'], 'userFullname': storeduser['fullname_initial'] })
                  }
                  this.removeDuplicateAgents(this.agents_array)
                }
              });


            } else {
              //  console.log('[WS-SHARED][WS-REQUESTS-MSGS] - member_id =! from ', storeduser['_id'])
            }
          } else {
            this.logger.log('[WS-SHARED][WS-REQUESTS-MSGS] - there is not stored user with id ', member_id)

            this.usersService.getProjectUserById(member_id)
              .subscribe((projectuser) => {

                // console.log('[WS-SHARED][WS-REQUESTS-MSGS] - USER IS NOT IN STORAGE GET PROJECT-USER BY ID - RES', projectuser);
                const user: any = projectuser[0].id_user;


                let imgUrl = ''
                if (isFirebaseUploadEngine === true) {
                  // ------------------------------------------------------------------------------
                  // Usecase uploadEngine Firebase 
                  // ------------------------------------------------------------------------------
                  imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + imageStorage + "/o/profiles%2F" + member_id + "%2Fphoto.jpg?alt=media"

                } else {
                  // ------------------------------------------------------------------------------
                  // Usecase uploadEngine Native 
                  // ------------------------------------------------------------------------------
                  imgUrl = imageStorage + "images?path=uploads%2Fusers%2F" + member_id + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
                }

                this.checkImageExists(imgUrl, (existsImage) => {
                  if (existsImage == true) {
                    user.hasImage = true
                  }
                  else {
                    user.hasImage = false
                  }
                });

                user['is_bot'] = false
                // console.log('WS-SHARED][WS-REQUESTS-MSGS]',  user)

                // this.agents_array.push({ '_id': member_id, 'firstname': member_id, 'isBot': false })
                const index = this.agents_array.findIndex(object => object.id === member_id);
                if (index === -1) {
                this.agents_array.push({ '_id': user['_id'], 'firstname': user['firstname'], 'lastname': user['lastname'], 'isBot': false, 'hasImage': user['hasImage'], 'userfillColour': user['fillColour'], 'userFullname': user['fullname_initial'] })
                }
                this.removeDuplicateAgents(this.agents_array)
                this.usersLocalDbService.saveMembersInStorage(user['_id'], user, 'ws-shared (createAgentsArrayFromParticipantsId)');
                this.logger.log('HERE Y3 USER projectuser ', projectuser, 'this.agents_array ', this.agents_array)

              }, (error) => {
                this.logger.error('[WS-SHARED][WS-REQUESTS-MSGS] - USER IS NOT IN STORAGE - GET PROJECT-USER BY ID - ERROR ', error);
              }, () => {
                this.logger.log('[WS-SHARED][WS-REQUESTS-MSGS] - USER IS NOT IN STORAGE - GET PROJECT-USER BY ID * COMPLETE *');
                this.logger.log('[WS-SHARED][WS-REQUESTS-MSGS] this.agents_array ', this.agents_array)
              });
          }
        }
      }
    });

    // console.log('[WS-SHARED][WS-REQUESTS-MSGS] - CREATE-AGENT-ARRAY-FROM-PARTICIPANTS-ID - AGENT ARRAY ', this.agents_array)
  }




  // -----------------------------------------------------------------------------------------------------
  // @ Create the requester avatar - Richiamato da ws-request-msgs.components.ts
  // -----------------------------------------------------------------------------------------------------
  createRequesterAvatar(lead) {
    if (lead && lead.fullname) {
      this.requester_fullname_initial = avatarPlaceholder(lead.fullname);
      this.fillColour = getColorBck(lead.fullname)
    } else {

      this.requester_fullname_initial = 'N/A';
      this.fillColour = 'rgb(98, 100, 167)';
    }

  }

  doParticipatingAgentsArray(participants, first_text, imageStorage, isFirebaseUploadEngine) {
    this.logger.log('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - doParticipatingAgentsArray imageStorage ', imageStorage);
    this.logger.log('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - doParticipatingAgentsArray - first_text: ', first_text, ' participants: ', participants, 'isFirebaseUploadEngine: ', isFirebaseUploadEngine);

    const newpartarray = []
    participants.forEach(participantid => {

      const participantIsBot = participantid.includes('bot_');

      if (participantIsBot === true) {
        this.logger.log('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - THE PARTICIP IS A BOT?', participantIsBot, 'GET BOT FROM STORAGE');

        const bot_id = participantid.slice(4);

        const bot = this.botLocalDbService.getBotFromStorage(bot_id);
        if (bot) {
          this.logger.log('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - STORED BOT ', bot);

          bot['is_bot'] = true;
          newpartarray.push(bot)

        } else {
          this.logger.log('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - RUN GET BOT FROM SERVICE');

          this.faqKbService.getFaqKbById(bot_id).subscribe((bot: any) => {
            this.logger.log('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - GET BOT BY ID - RES', bot);


            bot['is_bot'] = true;
            newpartarray.push(bot)

            this.botLocalDbService.saveBotsInStorage(bot_id, bot);

          }, (error) => {

            this.logger.error('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - GET BOT BY ID - ERR', error);
          }, () => {
            this.logger.log('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - GET BOT BY ID * COMPLETE *');
          });

        }
      } else {
        this.logger.log('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - THE PARTICIP IS A BOT?', participantIsBot, 'GET USER FROM STORAGE');
        const user = this.usersLocalDbService.getMemberFromStorage(participantid);
        this.logger.log('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - USER GET FROM STORAGE ', user);
        if (user) {
          // check if user iamge exist  
          let imgUrl = ''
          if (isFirebaseUploadEngine) {
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Firebase 
            // ------------------------------------------------------------------------------
            imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + imageStorage + "/o/profiles%2F" + participantid + "%2Fphoto.jpg?alt=media"
          } else {
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Native 
            // ------------------------------------------------------------------------------
            imgUrl = imageStorage + "images?path=uploads%2Fusers%2F" + participantid + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
          }
          this.checkImageExists(imgUrl, (existsImage) => {
            if (existsImage == true) {
              user['hasImage'] = true
            }
            else {
              user['hasImage'] = false
            }
          });

          this.createAgentAvatar(user)
          user['is_bot'] = false
          newpartarray.push(user)

        } else {
          this.logger.log('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - USER IS NOT IN STORAGE - RUN GET FROM SERVICE participantid ', participantid);
          this.usersService.getProjectUserById(participantid)
            .subscribe((projectuser) => {
              this.logger.log('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - USER IS NOT IN STORAGE GET PROJECT-USER BY ID - RES', projectuser);
              const user: any = projectuser[0].id_user;
              this.logger.log('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - USER IS NOT IN STORAGE GET PROJECT-USER BY ID - RES > user ', user);

              let imgUrl = ''
              if (isFirebaseUploadEngine === true) {
                // ------------------------------------------------------------------------------
                // Usecase uploadEngine Firebase 
                // ------------------------------------------------------------------------------
                imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + imageStorage + "/o/profiles%2F" + participantid + "%2Fphoto.jpg?alt=media"

              } else {
                // ------------------------------------------------------------------------------
                // Usecase uploadEngine Native 
                // ------------------------------------------------------------------------------
                imgUrl = imageStorage + "images?path=uploads%2Fusers%2F" + participantid + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
              }

              this.checkImageExists(imgUrl, (existsImage) => {
                if (existsImage == true) {
                  user.hasImage = true
                }
                else {
                  user.hasImage = false
                }
              });

              user['is_bot'] = false
              this.createAgentAvatar(user)
              newpartarray.push(user)
              this.usersLocalDbService.saveMembersInStorage(user['_id'], user, 'ws-shared (doParticipatingAgentsArray)');

            }, (error) => {
              this.logger.error('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST][WS-SHARED] - USER IS NOT IN STORAGE - GET PROJECT-USER BY ID - ERROR ', error);
            }, () => {
              this.logger.log('[WS-SHARED][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST] - USER IS NOT IN STORAGE - GET PROJECT-USER BY ID * COMPLETE *');
            });
        }
      }
    });
    return newpartarray
  }

  createAgentAvatar(agent) {
    let fullname = '';
    if (agent && agent.firstname && agent.lastname) {
      fullname = agent.firstname + ' ' + agent.lastname
      agent['fullname_initial'] = avatarPlaceholder(fullname);
      agent['fillColour'] = getColorBck(fullname)
    } else if (agent && agent.firstname) {

      fullname = agent.firstname
      agent['fullname_initial'] = avatarPlaceholder(fullname);
      agent['fillColour'] = getColorBck(fullname)
    } else {
      agent['fullname_initial'] = 'N/A';
      agent['fillColour'] = 'rgb(98, 100, 167)';
    }
  }

  checkImageExists(imageUrl, callBack) {
    var imageData = new Image();
    imageData.onload = function () {
      callBack(true);
    };
    imageData.onerror = function () {
      callBack(false);
    };
    imageData.src = imageUrl;
  }


  async getProjectUserInProject(currentUserId,prjct_id): Promise<string>{
    return new Promise((resolve, reject)=> {
      this.usersService.getProjectUserByUserIdPassingProjectId(currentUserId, prjct_id).subscribe( (projectUser) => {
        resolve(projectUser[0]['role'])
        // if (projectUser[0]['role'] === 'agent') {
        //   resolve(true)
        // } else {
        //   resolve(false)
        // }
      },  (error)=> {
          this.logger.error('[ROLE-GUARD] getProjectUserRole --> ERROR:', error)
          resolve(error)
      })
    
    })
  }

  currentUserIdIsInParticipants(participants: any, currentUserID: string, request_id): boolean {
    this.logger.log('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][HISTORY & NORT-CONVS][WS-REQUESTS-LIST][WS-REQUESTS-MSGS] - currentUserIdIsInParticipants participants ', participants, ' currentUserID ', currentUserID)
    let currentUserIsJoined = false
    participants.forEach((participantID: string) => {
      if (participantID === currentUserID) {
        currentUserIsJoined = true;
        return
      }
    });
    return currentUserIsJoined;
  }

  // [
  //   { id: 'chat21', name: 'Chat' },
  //   { id: 'telegram', name: 'Telegram' },
  //   { id: 'messenger', name: 'Messenger' },
  //   { id: 'email', name: 'Email' },
  //   { id: 'form', name: 'Ticket' }
  // ]

  getConversationTypeInRequests(ws_requests) {
    this.conversationTypeInRequests = [];
    ws_requests.forEach(request => {
    // console.log('[WS-SHARED] getConversationTypeInRequests request ', request)

      let channelObjct = CHANNELS.find((el => el.id === request.channel.name ))
      if(channelObjct){
        const index = this.conversationTypeInRequests.findIndex((e) => e.id === request.channel.name);
        if (index === -1) {
          this.conversationTypeInRequests.push(channelObjct)
        }
      }

    });
    // console.log('[WS-SHARED] getConversationTypeInRequests array ', this.conversationTypeInRequests)
  }

  getParticipantsInRequests(ws_requests) {
    const participantsId = [];
    this.participantsInRequests = [];

    // this.humanAgents = [];
    // this.botAgents = [];
    this.botAgentsIdArray = [];
    this.humanAgentsIdArray = [];

    ws_requests.forEach(request => {

      request.participants.forEach(participant => {

        // WITH THE PURPOSE OF DISPLAYING IN THE "FILTER FOR AGENTS" ONLY THE AGENTS (WITHOUT DUPLICATES) THAT ARE PRESENT IN THE REQUESTS BELOW THE FILTER
        // I CREATE AN ARRAY OF IDS OF PARTICIPANTS:  participantsId
        // IF THE ID OF THE PARTICIPANT DOES NOT EXISTS IN THE "ARRAY participantsId" THE FOR CYCLE PROCEEDS BUILDING 
        // THE ARRAY participantsInRequests
       

        if (participantsId.indexOf(participant) === -1) {

          participantsId.push(participant);

          const participantIsBot = participant.includes('bot_')
          if (participantIsBot === true) {

            const bot_id = participant.slice(4);
            this.logger.log('[WS-SHARED][WS-REQUESTS-LIST] - getParticipantsInRequests -THE PARTICIP', participant, 'IS A BOT ', participantIsBot, ' - ID ', bot_id);

            const bot = this.botLocalDbService.getBotFromStorage(bot_id);
            // this.logger.log('% »»» WebSocketJs WF agentsArrayBuildFromRequests bot', bot);

            if (bot) {
              this.participantsInRequests.push({ '_id': participant, 'firstname': bot.name + " (bot)" });
              this.botAgentsIdArray.push(participant);

            } else {
              this.participantsInRequests.push({ '_id': participant, 'firstname': participant + " (bot)" });
              this.botAgentsIdArray.push(participant);
            }

          } else {

            const user = this.usersLocalDbService.getMemberFromStorage(participant);
            this.logger.log('% »»» WebSocketJs WF agentsArrayBuildFromRequests user', user);

            if (user) {
              this.participantsInRequests.push({ '_id': participant, 'firstname': user['firstname'], 'lastname': user['lastname'] })

              // this.humanAgents.push({ '_id': participant, 'firstname': user.firstname, 'lastname': user.lastname });

              this.humanAgentsIdArray.push(participant);
            } else {

              this.participantsInRequests.push({ '_id': participant, 'firstname': participant, });

              this.humanAgentsIdArray.push(participant);
              // this._getProjectUserByUserId(participant) 
            }
          }
        }
      });

      // request['test'] = this.participantsInRequests
    });

    this.logger.log('[WS-SHARED][WS-REQUESTS-LIST] getParticipantsInRequests participantsId ', participantsId);
    this.logger.log('[WS-SHARED][WS-REQUESTS-LIST] getParticipantsInRequests ', this.participantsInRequests);
  }

  _getProjectUserByUserId(member_id) {
    this.usersService.getProjectUserByUserId(member_id)
      .subscribe((projectUser: any) => {
        this.logger.log('[WS-SHARED][WS-REQUESTS-LIST][SERVED] - GET projectUser by USER-ID ', projectUser)
        if (projectUser) {
          this.logger.log('[WS-SHARED][WS-REQUESTS-LIST][SERVED] - GET projectUser id', projectUser);

          this.usersLocalDbService.saveMembersInStorage(projectUser.id_user._id, projectUser.id_user, 'ws-shared _getProjectUserByUserId');
        }
      }, (error) => {
        this.logger.error('[WS-SHARED][WS-REQUESTS-LIST][SERVED] projectUser by USER-ID - ERROR ', error);
      }, () => {
        this.logger.log('[WS-SHARED][WS-REQUESTS-LIST][SERVED] projectUser by USER-ID * COMPLETE *');
      });
  }




  // -----------------------------------------------------------------------------------------------------
  // @ departments in Requests & Count of depts in requests - called by ws-requests-list.component.ts
  // -----------------------------------------------------------------------------------------------------
  /**
   * Count of depts in requests !! no more get from request attributes but from dept
   * 
   * @param requests_array 
   */
  // DEPTS_LAZY: replace the existing one with this
  getDeptsAndCountOfDeptsInRequests(requests_array) {
    const depts_array = [];
    const deptsIDs = [];
    const deptsNames = [];

    requests_array.forEach((request, index) => {
      // this.logger.log('% WsRequestsList - DEPTS-COUNT request 1', request, '#', index);
      // if (request && request.attributes) {
      if (request && request.dept) {
        // this.logger.log('% WsRequestsList - DEPTS-COUNT request 2', request, '#', index);

        /**
         * CREATES AN ARRAY WITH ALL THE DEPTS RETURNED IN THE REQUESTS OBJCTS
         * (FROM THIS IS CREATED requestsDepts_uniqueArray)
         */

        // depts_array.push({ '_id': request.attributes.departmentId, 'deptName': request.attributes.departmentName }); 
        depts_array.push({ '_id': request.dept._id, 'deptName': request.dept.name });


        /**
         * CREATES AN ARRAY WITH * ONLY THE IDs * OF THE DEPTS RETURNED IN THE REQUESTS OBJCTS
         * THIS IS USED TO GET THE OCCURRENCE IN IT OF THE ID OF THE ARRAY this.requestsDepts_array
         */

        /**
         * USING DEPT ID  */
        // deptsIDs.push(request.attributes.departmentId)
        deptsIDs.push(request.dept._id);

        /**
         * USING DEPT NAME  */
        // deptsNames.push(request.attributes.departmentName)
      } else {
        // this.logger.log('REQUESTS-LIST COMP - REQUEST (else)', request, '#', index);

      }
    });
    // this.logger.log('REQUESTS-LIST COMP - DEPTS ARRAY NK', depts_array);
    // this.logger.log('REQUESTS-LIST COMP - DEPTS ID ARRAY NK', deptsIDs);
    // this.logger.log('REQUESTS-LIST COMP - DEPTS NAME ARRAY NK', deptsNames)


    // ---------------------------------------------------------------------
    //  REMOVE DUPLICATE from depts_array
    // ---------------------------------------------------------------------
    /**
     * USING DEPT ID  */
    this.depts_array_noduplicate = this.removeDuplicates(depts_array, '_id');

    /**
     * USING DEPT NAME  */
    //  this.depts_array_noduplicate = this.removeDuplicates(depts_array, 'deptName');

    // this.logger.log('% WsRequestsList - REQUESTSxDEPTS - DEPTS ARRAY [no duplicate] NK', this.depts_array_noduplicate)

    // GET OCCURRENCY OF THE DEPT ID IN THE ARRAY OF THE TOTAL DEPT ID
    this.depts_array_noduplicate.forEach(dept => {

      /**
       * USING DEPT ID  */
      this.getDeptIdOccurrence(deptsIDs, dept._id)

      /**
       * USING DEPT NAME  */
      // this.getDeptNameOccurrence(deptsNames, dept.deptName)
    });
  }


  removeDuplicates(originalArray, prop) {
    const newArray = [];
    const lookupObject = {};

    // tslint:disable-next-line:forin
    for (const i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    // tslint:disable-next-line:forin
    for (const i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }

  getDeptIdOccurrence(array_of_all_depts_ids, dept_id) {
    // this.logger.log('!!! ANALYTICS - ALL REQUESTS X DEPT - GET DEP OCCURRENCE FOR DEPTS ');
    const newUnicArray = []
    let count = 0;
    array_of_all_depts_ids.forEach((v) => (v === dept_id && count++));
    // this.logger.log('% WsRequestsList - REQUESTSxDEPTS - DEPT - #', count, ' REQUESTS ASSIGNED TO DEPT ', dept_id);
    let i
    for (i = 0; i < this.depts_array_noduplicate.length; ++i) {

      for (const dept of this.depts_array_noduplicate) {
        if (dept_id === dept._id) {
          dept.requestsCount = count
        }
      }
      // this.logger.log('% WsRequestsList - REQUESTSxDEPTS DEPTS ARRAY [no duplicate] NK * 2 * : ', this.depts_array_noduplicate);
    }
  }




  // ------------------------------------------------------------------------------------------------
  // MOVED FROM ws-requests-list.component.ts after the creation of the component  
  // WsRequestsUnservedComponent & WsRequestsServedComponent
  // ------------------------------------------------------------------------------------------------

  members_replace(member_id) {
    // this.logger.log('!!! NEW REQUESTS HISTORY  - SERVED BY ID ', member_id)
    // this.logger.log(' !!! NEW REQUESTS HISTORY underscore found in the participant id  ', member_id, member_id.includes('bot_'));

    const participantIsBot = member_id.includes('bot_')

    if (participantIsBot === true) {

      const bot_id = member_id.slice(4);
      // this.logger.log('!!! NEW REQUESTS HISTORY - THE PARTICIP', member_id, 'IS A BOT ', participantIsBot, ' - ID ', bot_id);

      const bot = this.botLocalDbService.getBotFromStorage(bot_id);
      if (bot) {
        // '- ' +
        return member_id = bot['name'] + ' (bot)';
      } else {
        // '- ' +
        return member_id
      }

    } else {

      const user = this.usersLocalDbService.getMemberFromStorage(member_id);
      this.logger.log('[WS-SHARED] members_replace user ', user)  
      if (user) {
        // this.logger.log('user ', user)
        if (user['lastname']) {
          const lastnameInizial = user['lastname'].charAt(0);
          // '- ' +
          return member_id = user['firstname'] + ' ' + lastnameInizial + '.'
        }
      } else {
        // '- ' +
        return member_id
      }
    }
  }


  getRequestText(text: string): string {
    if (text) {
      return text.length >= 30 ?
        text.slice(0, 30) + '...' :
        text;
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Train bot sidebar
  // -----------------------------------------------------------------------------------------------------

  openRightSideBar(message: string) {
    this.OPEN_RIGHT_SIDEBAR = true;
    this.logger.log('[WS-SHARED][FAQ-TEST-COMP] ', this.OPEN_RIGHT_SIDEBAR, ' MSG: ', message);
    this.selectedQuestion = message;


    // questo non funziona se è commented BUG RESOLVE
    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    this.logger.log('[WS-SHARED][FAQ-TEST-COMP] - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);

  }




  // JOIN TO CHAT GROUP
  onJoinHandled(id_request: string, currentUserID: string, postmessage?: string) {
    // this.getFirebaseToken(() => {
   
    this.logger.log('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - JOIN PRESSED');
    this.logger.log('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - JOIN PRESSED postmessage', postmessage);

    this.wsRequestsService.addParticipant(id_request, currentUserID)
      .subscribe((data: any) => {
      
        this.logger.log('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - addParticipant TO CHAT GROUP ', data);
      }, (err) => {
        this.logger.error('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - addParticipant TO CHAT GROUP - ERROR ', err);

      }, () => {
        this.logger.log('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - addParticipant TO CHAT GROUP * COMPLETE *');
        if (postmessage === undefined) {
          this.getTranslationsDisplayInAppNotification()

        } else {

          this.getTranslationsAndPostMessage()
        }
      });
  }
  getTranslationsDisplayInAppNotification() {
    this.translate.get('You_are_successfully_added_to_the_chat').subscribe((text: string) => {

      this.logger.log('[WS-SHARED] getTranslations : ', text)

      this.you_are_successfully_added_to_the_chat = text;
      this.notify.showWidgetStyleUpdateNotification(this.you_are_successfully_added_to_the_chat, 2, 'done');
    });
  }


  getTranslationsAndPostMessage() {
    this.translate.get('You_are_successfully_added_to_the_chat').subscribe((text: string) => {

      this.logger.log('[WS-SHARED] getTranslations : ', text)

      this.you_are_successfully_added_to_the_chat = text;
      const msg = { action: 'display_toast_join_complete', text: this.you_are_successfully_added_to_the_chat }
      window.parent.postMessage(msg, '*')
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // @ SEEMS NOT-USED 
  // -------------------------------------------------------------------------------------------------------------
  // joinDeptAndLeaveCurrentAgents(deptid_selected, requestid) {
  //   this.logger.log('REQUEST-MSGS - JOIN DEPT AND LEAVE CURRENT AGENTS - DEPT ID ', deptid_selected);
  //   this.wsRequestsService.joinDept(deptid_selected, requestid)
  //     .subscribe((res: any) => {
  //       this.logger.log('REQUEST-MSGS - JOIN DEPT - RES ', res);
  //     }, (error) => {
  //       this.logger.error('REQUEST-MSGS - JOIN DEPT - RES - ERROR ', error);
  //     }, () => {
  //       this.logger.log('REQUEST-MSGS - JOIN DEPT - RES * COMPLETE *');
  //     });
  // }

  // -------------------------------------------------------------------------------------------------------------
  // @ SEEMS NOT-USED 
  // -------------------------------------------------------------------------------------------------------------
  createFullParticipacipantsArray(request, participants: any) {
    if (participants.length > 0) {
      this.newParticipants = []
      participants.forEach(participantid => {
        const participantIsBot = participantid.includes('bot_')
        if (participantIsBot === true) {

          const bot_id = participantid.slice(4);

          const bot = this.botLocalDbService.getBotFromStorage(bot_id);
          if (bot) {
            this.newParticipants.push([{ '_id': participantid, 'name': bot.name, 'lastname': '', 'botType': bot.type }])
            request['test'] = this.newParticipants

          } else {
            this.getBotFromRemoteAndSaveInStorage(bot_id, participantid)
          }

        } else {
          const user = this.usersLocalDbService.getMemberFromStorage(participantid);
          if (user) {
            this.logger.log('!! Ws SHARED »»»»»»» createFullParticipacipantsArray participants - user get from storage ', user);

            let lastnameInizial = ''
            if (user['lastname']) {
              lastnameInizial = user['lastname'].charAt(0);
            }

            if (this.newParticipants.indexOf(participantid) === -1) {
              this.newParticipants.push({ '_id': participantid, 'name': user['firstname'], 'lastname': lastnameInizial, 'botType': '' })
              request['test'] = this.newParticipants
            }

          } else {
            this.logger.log('!! Ws SHARED »»»»»»» createFullParticipacipantsArray participants - user NOT IN STORAGE ');

            this.getProjectuserByIdAndSaveInStorage(request, participantid);

            this.usersService.getProjectUserById(participantid)
              .subscribe((projectuser) => {

                this.newParticipants.push({ projectuser })
                request['test'] = this.newParticipants
              })
          }
        }
      });
      this.logger.log('!! Ws SHARED »»»»»»» createFullParticipacipantsArray - newParticipants Array ', this.newParticipants);

    }
  }

  getProjectuserByIdAndSaveInStorage(request, userid) {
    // DONE -> WORKS NK-TO-TEST - da cambiare - vedi commento nel servizio
    //  this.usersService.getUsersById("5e3d47b485aa8a0017012485")

    this.usersService.getProjectUserById(userid)
      .subscribe((projectuser) => {
        this.logger.log('!! Ws SHARED »»»»»»» createFullParticipacipantsArray getProjectuserByIdAndSaveInStorage - RES', projectuser);


        if (projectuser) {

          this.user = projectuser[0].id_user;

          let lastnameInizial = ''
          if (this.user.lastname) {
            lastnameInizial = this.user.lastname.charAt(0);
          }


          const index = this.newParticipants.findIndex((e) => e._id === userid);

          if (index === -1) {

            this.newParticipants.push({ '_id': userid, 'name': this.user.firstname, 'lastname': lastnameInizial, 'botType': '' })
            request['test'] = this.newParticipants
            this.logger.log('!! Ws SHARED »»»»»»» createFullParticipacipantsArray   this.newParticipants  QUI SI', this.newParticipants);
          }
          // this.logger.log('!! Ws SHARED »»»»»»» createFullParticipacipantsArray   this.newParticipants  subito dopo', this.newParticipants);
          this.usersLocalDbService.saveMembersInStorage(userid, this.user, 'ws-shared getProjectuserByIdAndSaveInStorage');

          // const obj = { '_id': userid, 'name': this.user.firstname, 'lastname': lastnameInizial, 'botType': '' }
          // this.logger.log('!! Ws SHARED »»»»»»» createFullParticipacipantsArray getProjectuserByIdAndSaveInStorage obj ', obj)
          // newUser = { '_id': userid, 'name': this.user.firstname, 'lastname': lastnameInizial, 'botType': '' }
          // return obj
        }
      }, (error) => {
        this.logger.error('!! Ws SHARED »»»»»»» createFullParticipacipantsArray getProjectuserByIdAndSaveInStorage - ERROR ', error);
      }, () => {
        this.logger.log('!! Ws SHARED »»»»»»» createFullParticipacipantsArray getProjectuserByIdAndSaveInStorage * COMPLETE *');
      });

    // return newUser
  }

  getBotFromRemoteAndSaveInStorage(bot_id: string, participantid: string) {
    this.faqKbService.getFaqKbById(bot_id).subscribe((res: any) => {
      this.logger.log('!! Ws SHARED »»»»»»» createFullParticipacipantsArray getBotFromRemoteAndSaveInStorage - RES', res);

      this.newParticipants.push({ '_id': participantid, 'name': res.name, 'lastname': '', 'botType': res.type })

      this.botLocalDbService.saveBotsInStorage(bot_id, res);
    }, (error) => {

      this.logger.error('!! Ws SHARED »»»»»»» createFullParticipacipantsArray getBotFromRemoteAndSaveInStorage - ERROR ', error);
    }, () => {
      this.logger.log('!! Ws SHARED »»»»»»» createFullParticipacipantsArray getBotFromRemoteAndSaveInStorage * COMPLETE *');

    });

  }

  // -------------------------------------------------------------------------------------------------------------
  // @ NOT-USED Extracts the values from the "attributes" object of the request and assign them to local variables
  // -------------------------------------------------------------------------------------------------------------
  destructureAttributes(attributes: any) {
    if (attributes) {
      /**
       * attributes > userFullname
       */
      if (attributes.userFullname) {
        this.user_name = attributes.userFullname;
        this.logger.log('* USER NAME: ', this.user_name);
      } else {
        this.user_name = 'N/A'
      }

      /**
       * attributes > userEmail
       */
      if (attributes.userEmail) {
        this.user_email = attributes.userEmail;
        this.logger.log('* USER EMAIL: ', this.user_email);
      } else {
        this.user_email = 'N/A'
      }

      /**
       * attributes > departmentName
       */
      if (attributes.departmentName) {
        this.department_name = attributes.departmentName;
        this.logger.log('* DEPATMENT NAME: ', this.department_name);
      } else {
        this.department_name = 'Default'
      }

      /**
       * attributes > departmentId
       */
      if (attributes.departmentId) {
        this.department_id = attributes.departmentId;
        this.logger.log('* DEPATMENT ID: ', this.department_id);
      } else {
        this.department_id = 'N/A'
      }

      /**
       * attributes > sourcePage
       */
      if (attributes.sourcePage) {
        this.source_page = attributes.sourcePage;
        this.logger.log('* SOURCE PAGE: ', this.source_page);
      } else {
        this.source_page = 'N/A'
        this.logger.log('* SOURCE PAGE: ', this.source_page);
      }

    } else {
      this.user_name = 'N/A';
      this.user_email = 'N/A';
      this.department_name = 'N/A';
      this.department_id = 'N/A';
      this.source_page = 'N/A';
    }

  }

}
