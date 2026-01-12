import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { AutomationsService } from 'app/services/automations.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { NavigationService } from 'app/services/navigation.service';
import { RoleService } from 'app/services/role.service';
import { RolesService } from 'app/services/roles.service';
import { PERMISSIONS } from 'app/utils/permissions.constants';
import * as moment from 'moment';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';


@Component({
  selector: 'appdashboard-automations',
  templateUrl: './automations.component.html',
  styleUrls: ['./automations.component.scss']
})
export class AutomationsComponent implements OnInit {

  public IS_OPEN_SETTINGS_SIDEBAR: boolean;
  public isChromeVerGreaterThan100: boolean;

  showSpinner: boolean = true;
  showAutomationsList: boolean = true;
  showAutomationDetail: boolean = false;

  myControl = new FormControl('');
  channels: string[] = ['WhatsApp'];
  filteredChannels: Observable<string[]>;
  project: any;

  channel: string;
  selected_automation_id: any;
  selected_template_name: string;
  selected_automation_created_at: string;
  transactions = [];
  logs = [];

  read_count: any;
  delivered_count: any;
  sent_count: any;
  accepted_count: any;
  rejected_count: any;
  failed_count: any;

  browserLang: string;
  currentLang: string;
  private unsubscribe$: Subject<any> = new Subject<any>();

  hasDefaultRole: boolean;
  ROLE: string;
  PERMISSIONS: any;
  PERMISSION_TO_CREATE: boolean;

  fake_transaction = [
    {
        "_id": "6581d02d50e58135455e48b7",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2023-12-19T17:17:33.422Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "prodotto_inscadenza_in_offerta",
        "updatedAt": "2024-06-05T13:22:50.535Z"
    },
    {
        "_id": "6581d28250e581354564df88",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-2",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2023-12-19T17:27:30.340Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "prodotto_cucina_offerta",
        "updatedAt": "2024-06-07T08:06:40.753Z"
    },
    {
        "_id": "662787efbea7b8ae6f823243",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-3",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-04-23T10:05:35.052Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "reminder_for_dinner_at_restauran",
        "updatedAt": "2024-09-09T10:48:57.706Z"
    },
    {
        "_id": "6627981cbea7b8ae6fd68abe",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-0001",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-04-23T11:14:36.746Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "hello_world",
        "updatedAt": "2024-04-23T14:23:51.756Z"
    },
    {
        "_id": "662f96e2bea7b8ae6ff2eaeb",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-4",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-04-29T12:47:30.855Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "hello_world",
        "updatedAt": "2024-04-29T13:48:16.924Z"
    },
    {
        "_id": "6639d47eabda808002576dce",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-5",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-05-07T07:13:02.417Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "ordine_in_giacenza",
        "updatedAt": "2024-05-07T07:23:21.157Z"
    },
    {
        "_id": "6639de22abda80800278ca2c",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-11",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-05-07T07:54:10.127Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "ordine_in_giacenza",
        "updatedAt": "2024-05-07T08:20:51.569Z"
    },
    {
        "_id": "6657165dee8fd16a1c4a04b6",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-123",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-05-29T11:49:49.654Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "hello_world",
        "updatedAt": "2024-05-30T15:56:05.644Z"
    },
    {
        "_id": "666064cdee8fd16a1ced8add",
        "transaction_id": "automation-request-{64425d26aaa97d0013819905}-1",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-06-05T13:14:53.638Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "prodotto_inscadenza_in_offerta",
        "updatedAt": "2024-06-05T13:14:56.893Z"
    },
    {
        "_id": "666832d20d6bac990e70ffb6",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-90",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-06-11T11:19:46.750Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "hello_world",
        "updatedAt": "2025-11-26T15:04:08.128Z"
    },
    {
        "_id": "668bec83e2f37c124b73671c",
        "transaction_id": "49b36428-be18-44e1-982b-75c857629210",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-07-08T13:41:23.858Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "summer_promo",
        "updatedAt": "2024-07-08T13:41:24.297Z"
    },
    {
        "_id": "668becade2f37c124b74a5a9",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-75c857629210",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-07-08T13:42:05.555Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "summer_promo",
        "updatedAt": "2024-09-06T13:58:23.139Z"
    },
    {
        "_id": "66db0b1c5bd94e11d8b6e8ce",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-75c857629212",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-09-06T14:01:00.326Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2024-10-21T15:43:32.397Z"
    },
    {
        "_id": "66defc345bd94e11d88cf3b5",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-75c8576292129",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-09-09T13:46:28.046Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2024-10-03T21:12:42.362Z"
    },
    {
        "_id": "67167e156d844c997dd0c19b",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-12",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-10-21T16:15:17.662Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2024-10-21T16:15:17.878Z"
    },
    {
        "_id": "671756506d844c997de902f5",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-13",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-10-22T07:37:52.018Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2024-10-22T07:37:52.519Z"
    },
    {
        "_id": "6760349997538daedfcd522c",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-91",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2024-12-16T14:09:29.071Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "hello_world",
        "updatedAt": "2024-12-16T14:09:29.510Z"
    },
    {
        "_id": "6880b1da7740ace065c733ba",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-6880b1d6e9c6a4001320125f-9wn81xd7h87wcwuyjpv964tmrhxeg5cp",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2025-07-23T09:56:42.254Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-07-23T09:56:43.256Z"
    },
    {
        "_id": "6880bda97740ace065fe8e1c",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-6880bda6d2feb000137d80f0-9wn81xd7h87wcwuyjpv964tmrhxeg5cp",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2025-07-23T10:47:05.738Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-07-23T10:47:06.527Z"
    },
    {
        "_id": "6880c5307740ace06520523d",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-6880c52acb3526001429995b-9wn81xd7h87wcwuyjpv964tmrhxeg5cp",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2025-07-23T11:19:11.994Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-07-23T11:19:12.774Z"
    },
    {
        "_id": "688214317740ace065ce466e",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1753355313186",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2025-07-24T11:08:33.817Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "programmazione_consegna",
        "updatedAt": "2025-07-24T11:08:34.680Z"
    },
    {
        "_id": "688215087740ace065d1e97d",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1753355528238",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2025-07-24T11:12:08.949Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "programmazione_consegna",
        "updatedAt": "2025-07-24T11:12:10.041Z"
    },
    {
        "_id": "688218c77740ace065e27bcc",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1753356487147",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2025-07-24T11:28:07.917Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "programmazione_consegna",
        "updatedAt": "2025-07-24T11:28:10.190Z"
    },
    {
        "_id": "68821a877740ace065eaa7a9",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1753356934521",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2025-07-24T11:35:35.476Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "programmazione_consegna",
        "updatedAt": "2025-07-24T11:35:37.409Z"
    },
    {
        "_id": "688231157740ace065578be3",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1753362709258",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2025-07-24T13:11:49.881Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "programmazione_consegna",
        "updatedAt": "2025-07-24T13:11:51.732Z"
    },
    {
        "_id": "6889c3f80eb5ae73b1eb423e",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1753859063452",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2025-07-30T07:04:24.462Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "programmazione_consegna",
        "updatedAt": "2025-07-30T07:04:26.702Z"
    },
    {
        "_id": "6889e0e50eb5ae73b170c529",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1753866468945",
        "__v": 0,
        "channel": "whatsapp",
        "createdAt": "2025-07-30T09:07:49.728Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "programmazione_consegna",
        "updatedAt": "2025-07-30T09:07:52.030Z"
    },
    {
        "_id": "68ac7bf8d087ea2f1359c7fb",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756133405557",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-25T15:06:32.377Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-25T15:06:35.894Z"
    },
    {
        "_id": "68ac7c3cd087ea2f135b28ed",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756134460172",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-25T15:07:40.713Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-25T15:07:42.139Z"
    },
    {
        "_id": "68ac7c96d087ea2f135d223b",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756134549833",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-25T15:09:10.370Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-25T15:09:11.565Z"
    },
    {
        "_id": "68ac82c2d087ea2f137f0b1a",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756136129905",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-25T15:35:30.515Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-25T15:35:32.995Z"
    },
    {
        "_id": "68ac8914d087ea2f13a13b9c",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756137747823",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-25T16:02:28.526Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-25T16:02:31.393Z"
    },
    {
        "_id": "68ac8db5d087ea2f13ba34b2",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756138933264",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-25T16:22:13.979Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-25T16:22:17.899Z"
    },
    {
        "_id": "68ad8481cb9fe1b74a1bdcef",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756202112432",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-26T09:55:12.993Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-26T09:55:14.810Z"
    },
    {
        "_id": "68ad8634cb9fe1b74a243692",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756202547658",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-26T10:02:28.187Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-26T10:02:28.861Z"
    },
    {
        "_id": "68ad8747cb9fe1b74a29a783",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756202823238",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-26T10:07:03.758Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-26T10:07:04.215Z"
    },
    {
        "_id": "68ad876dcb9fe1b74a2a6b2b",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756202861131",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-26T10:07:41.692Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-26T10:07:42.120Z"
    },
    {
        "_id": "68ad96dbcb9fe1b74a74702c",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756206811200",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-26T11:13:31.752Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-26T11:13:32.008Z"
    },
    {
        "_id": "68adb9eecb9fe1b74a246bf7",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756215790211",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-26T13:43:10.669Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "pending",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-26T13:43:10.663Z"
    },
    {
        "_id": "68aece88b481ecde362c9be6",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756286600091",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-27T09:23:20.861Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-27T09:23:22.458Z"
    },
    {
        "_id": "68af0ccbb481ecde3659e78c",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756302538070",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-27T13:48:59.950Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-27T13:49:01.534Z"
    },
    {
        "_id": "68af0f95b481ecde36687181",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756303252667",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-27T14:00:53.312Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-27T14:00:54.743Z"
    },
    {
        "_id": "68af0fe7b481ecde366a1e2f",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756303334894",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-27T14:02:15.468Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-27T14:02:16.860Z"
    },
    {
        "_id": "68af11ceb481ecde3673f393",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756303822304",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-27T14:10:22.957Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-27T14:10:24.349Z"
    },
    {
        "_id": "68af148bb481ecde36824585",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756304522601",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-27T14:22:03.254Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-27T14:22:04.683Z"
    },
    {
        "_id": "68af1727b481ecde368fe951",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756305190923",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-27T14:33:11.454Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-27T14:33:12.929Z"
    },
    {
        "_id": "68af1a21b481ecde369fd941",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756305952497",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-27T14:45:53.117Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-27T14:45:54.531Z"
    },
    {
        "_id": "68b0945cc1e65ccf68a7a09e",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756402779870",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-08-28T17:39:40.475Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-08-28T17:39:42.075Z"
    },
    {
        "_id": "68b6ee45c1e65ccf689ba0c8",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1756819012907",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-09-02T13:16:53.546Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "programmazione_consegna",
        "updatedAt": "2025-09-02T13:16:54.495Z"
    },
    {
        "_id": "68c7cb0e292cabbadc8cb680",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1757924110021",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-09-15T08:15:10.510Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-09-15T08:15:11.017Z"
    },
    {
        "_id": "68c7cb95292cabbadc8f30eb",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1757924244838",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-09-15T08:17:25.275Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "programmazione_consegna",
        "updatedAt": "2025-09-15T08:17:25.947Z"
    },
    {
        "_id": "690a03a15f5c861fe0ac10cc",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1762263968536",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-04T13:46:09.028Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-04T13:46:10.364Z"
    },
    {
        "_id": "690b27e0e5e51b29aab877f0",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1762338784159",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-05T10:33:04.716Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-05T10:33:06.133Z"
    },
    {
        "_id": "690b2b07e5e51b29aaca52d7",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1762339590895",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-05T10:46:31.409Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-05T10:46:32.817Z"
    },
    {
        "_id": "690b2b6ce5e51b29aaccc213",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1762339692303",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-05T10:48:12.771Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-05T10:48:13.241Z"
    },
    {
        "_id": "690b2ef4e5e51b29aae05a6d",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1762340595679",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-05T11:03:16.229Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "test_img",
        "updatedAt": "2025-11-05T11:03:16.558Z"
    },
    {
        "_id": "690b7732e5e51b29aa891e3f",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1762359090081",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-05T16:11:30.571Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-05T16:11:31.828Z"
    },
    {
        "_id": "691426c6e07466d503c18459",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1762928325848",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-12T06:18:46.495Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-12T06:18:47.735Z"
    },
    {
        "_id": "691448f0e07466d5037a446c",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1762937071114",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-12T08:44:32.029Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-12T08:44:32.686Z"
    },
    {
        "_id": "69144f0be07466d5039e1876",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1762938635541",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-12T09:10:35.971Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-12T09:10:36.576Z"
    },
    {
        "_id": "69149028e07466d5032eb825",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1762955303546",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-12T13:48:24.245Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-12T13:48:24.529Z"
    },
    {
        "_id": "6914aebae07466d503f96275",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1762963129481",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-12T15:58:50.043Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-12T15:58:50.360Z"
    },
    {
        "_id": "6914b0abe07466d50305a9d2",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1762963626571",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-12T16:07:07.135Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-11-12T16:07:07.696Z"
    },
    {
        "_id": "6927099a3fb5e45993b5e36f",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764166041387",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-26T14:07:22.036Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-26T14:07:22.795Z"
    },
    {
        "_id": "6927128d3fb5e45993eaa572",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764168333408",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-26T14:45:33.890Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-26T14:45:35.372Z"
    },
    {
        "_id": "692712cb3fb5e45993ec13ae",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764168395336",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-26T14:46:35.845Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "studio_dentistico",
        "updatedAt": "2025-11-26T14:46:36.336Z"
    },
    {
        "_id": "6927201a3fb5e459933ad585",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764171802168",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-26T15:43:22.941Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-26T15:43:23.888Z"
    },
    {
        "_id": "692723783fb5e459934eb62d",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764172663479",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-26T15:57:44.312Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-26T15:57:45.152Z"
    },
    {
        "_id": "692724fe3fb5e4599357cbe6",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764173052475",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-26T16:04:14.182Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "fattura",
        "updatedAt": "2025-11-26T16:04:14.587Z"
    },
    {
        "_id": "69272bb43fb5e459937f1081",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764174771428",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-26T16:32:52.341Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "fattura",
        "updatedAt": "2025-11-26T16:32:52.897Z"
    },
    {
        "_id": "69273d6f3fb5e45993e0f750",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764179311193",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-26T17:48:31.663Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-26T17:48:32.535Z"
    },
    {
        "_id": "69273fe03fb5e45993edce8a",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764179936020",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-26T17:58:56.591Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-26T17:58:57.260Z"
    },
    {
        "_id": "692741293fb5e45993f48d7d",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764180264464",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-26T18:04:25.101Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-26T18:04:25.739Z"
    },
    {
        "_id": "692862333fb5e459934a32c8",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764254258658",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-27T14:37:39.306Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-27T14:37:40.594Z"
    },
    {
        "_id": "6928762a3fb5e45993b92af3",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764259369271",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-11-27T16:02:50.158Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-11-27T16:02:51.313Z"
    },
    {
        "_id": "692d72d13fb5e4599346c7d0",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764586193050",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-01T10:49:53.571Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-12-01T10:49:54.474Z"
    },
    {
        "_id": "692da8923fb5e459937a38c5",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764599954184",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-01T14:39:14.710Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-12-01T14:39:15.559Z"
    },
    {
        "_id": "692da9663fb5e459937f3046",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764600166144",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-01T14:42:46.619Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "fattura",
        "updatedAt": "2025-12-01T14:42:47.110Z"
    },
    {
        "_id": "692dad343fb5e459939611b9",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764601139464",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-01T14:59:00.365Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-12-01T14:59:00.883Z"
    },
    {
        "_id": "692dc9583fb5e459933270e1",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764608344367",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-01T16:59:04.962Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "fattura",
        "updatedAt": "2025-12-01T16:59:05.348Z"
    },
    {
        "_id": "692dca833fb5e4599339465f",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764608643057",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-01T17:04:03.741Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "fattura",
        "updatedAt": "2025-12-01T17:04:04.098Z"
    },
    {
        "_id": "692dcb043fb5e459933c3ed8",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764608771780",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-01T17:06:12.309Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "fattura",
        "updatedAt": "2025-12-01T17:06:12.655Z"
    },
    {
        "_id": "692dcb273fb5e459933d0d73",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764608806908",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-01T17:06:47.502Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "fattura",
        "updatedAt": "2025-12-01T17:06:47.818Z"
    },
    {
        "_id": "692dcde83fb5e459934d731e",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764609511639",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-01T17:18:32.380Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "fattura",
        "updatedAt": "2025-12-01T17:18:32.759Z"
    },
    {
        "_id": "692dce283fb5e459934ed6f4",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1764609575883",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-01T17:19:36.482Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "fattura",
        "updatedAt": "2025-12-01T17:19:36.966Z"
    },
    {
        "_id": "693af7d3164607cdfcb124f0",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1765472210946",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-11T16:56:51.450Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "fattura",
        "updatedAt": "2025-12-11T16:56:52.056Z"
    },
    {
        "_id": "693af850164607cdfcb3ed52",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1765472336203",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-11T16:58:56.662Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-12-11T16:58:56.929Z"
    },
    {
        "_id": "693c3d150f75b26987942bd7",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1765555477523",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-12T16:04:37.933Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-12-12T16:04:39.319Z"
    },
    {
        "_id": "693c3d950f75b2698796b74b",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1765555605589",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-12T16:06:46.001Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-12-12T16:06:47.901Z"
    },
    {
        "_id": "69538ce13d7b9c7ee9c10e87",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1767083232150",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-30T08:27:13.108Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "tracking_consegna",
        "updatedAt": "2025-12-30T08:27:14.435Z"
    },
    {
        "_id": "69538d573d7b9c7ee9c32871",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1767083351069",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-30T08:29:11.590Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "preventivo_tilby",
        "updatedAt": "2025-12-30T08:29:12.346Z"
    },
    {
        "_id": "6953de763d7b9c7ee92a6da3",
        "transaction_id": "automation-request-64425d26aaa97d0013819905-1767104117900",
        "__v": 0,
        "broadcast": true,
        "channel": "whatsapp",
        "createdAt": "2025-12-30T14:15:18.355Z",
        "id_project": "64425d26aaa97d0013819905",
        "status": "completed",
        "template_name": "programmazione_consegna",
        "updatedAt": "2025-12-30T14:15:19.473Z"
    }
]
  private backSub?: Subscription;

  constructor(
    private auth: AuthService,
    private logger: LoggerService,
    private automationsService: AutomationsService,
    private router: Router,
    private roleService: RoleService,
    public translate: TranslateService,
    public route: ActivatedRoute,
    private rolesService: RolesService,
    public notify: NotifyService,
    private navSvc: NavigationService
  ) { 
   
  }

  ngOnInit(): void {
    // this.auth.checkRoleForCurrentProject();
    this.roleService.checkRoleForCurrentProject('automations')
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
    this.showSpinner = true;
    this.initializeFilters();
    this.getTransactions();
    this.getCurrentProject();
    this.setMomentLocale();
    this.listenToProjectUser()
    this.listenToGoBack()
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();   
    this.unsubscribe$.complete();
    this.backSub?.unsubscribe();
  }

  listenToGoBack() {
    this.backSub = this.navSvc.onBack().subscribe(() => {
      this.backToAutomations();
    });
  }

  listenToProjectUser() {
    this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);

    this.rolesService.getUpdateRequestPermission()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(status => {
        this.ROLE = status.role;
        this.PERMISSIONS = status.matchedPermissions;
        console.log('[AUTOMATION] - this.ROLE:', this.ROLE);
        console.log('[AUTOMATION] - this.PERMISSIONS', this.PERMISSIONS);
        this.hasDefaultRole = ['owner', 'admin', 'agent'].includes(status.role);
        console.log('[AUTOMATION] - hasDefaultRole', this.hasDefaultRole);

        // PERMISSION_TO_CREATE
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_CREATE = true;
          console.log('[AUTOMATION] - Project user is owner or admin (1)', 'PERMISSION_TO_CREATE:', this.PERMISSION_TO_CREATE);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_CREATE = false;
          console.log('[AUTOMATION] - Project user is agent (2)', 'PERMISSION_TO_CREATE:', this.PERMISSION_TO_CREATE);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_CREATE = status.matchedPermissions.includes(PERMISSIONS.AUTOMATIONSLOG_CREATE);
          console.log('[AUTOMATION] - Custom role (3)', status.role, 'PERMISSION_TO_CREATE:', this.PERMISSION_TO_CREATE);
        }

      }
    );
  
  }

   getQueryParams() {
    this.route.queryParamMap
      .subscribe(params => {
        this.logger.log('[AUTOMATION COMP.]  queryParams', params['params']);
        
        if (params['params']['id']) {
          this.showAutomationsList = false;
          this.showAutomationDetail = true;
        } else {
          this.showAutomationsList =  true;
          this.showAutomationDetail = false;
        }
      })
    }
  


  setMomentLocale() {
      this.browserLang = this.translate.getBrowserLang();
      // this.logger.log('[REQUEST-DTLS-X-PANEL] - setMomentLocale browserLang', this.browserLang)
  
      let stored_preferred_lang = undefined
      if (this.auth.user_bs && this.auth.user_bs.value) {
        stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
      }
      // const stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
      let dshbrd_lang = ''
      if (this.browserLang && !stored_preferred_lang) {
        dshbrd_lang = this.browserLang
      } else if (this.browserLang && stored_preferred_lang) {
        dshbrd_lang = stored_preferred_lang
      }
      this.currentLang = dshbrd_lang
      moment.locale(dshbrd_lang)

    }

  initializeFilters() {
    this.filteredChannels = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    )
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.channels.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
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
      this.logger.log('[AUTOMATION COMP.] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      this.logger.log('[AUTOMATION] project',  this.project ) 
      // if ((this.project.profile_name === 'Sandbox' || this.project.profile_name === 'free') && this.project.trial_expired === true) {
      //   this.plan_expired = true;
      // }
    });
  }
  // UTILS FUNCTION - End
  // --------------------

  onChannelSelect(channel) {
    this.channel = channel;
    this.getTransactions();
  }

  getTransactions() {
    this.automationsService.getTransactions('whatsapp').subscribe((transactions: []) => {
      this.logger.log("[AUTOMATION COMP.] Transactions: ", transactions);
      this.transactions = transactions;
      // this.transactions = this.fake_transaction;
      this.transactions.sort(function compare(a, b) {
        if (a.createdAt > b.createdAt) {
          return -1;
        }
        if (a.createdAt < b.createdAt) {
          return 1;
        }
        return 0
      });
      this.showSpinner = false;

    }, (error) => {
      this.logger.error("get transactions error: ", error)
    })
  }

  onAutomationSelect(automation_id: string, createdAt: string, template_name:any) {
    this.selected_template_name = template_name;
    this.selected_automation_created_at = createdAt;
    this.logger.log("[AUTOMATION COMP.] onAutomationSelect createdAt: ", this.selected_automation_created_at, 'template_name ',  this.selected_template_name);
    this.selected_automation_id = automation_id;
    this.showSpinner = true;
    this.getLogs(this.selected_automation_id);
  }

  getLogs(automation_id: string) {
    this.automationsService.getTransactionLogs(automation_id).subscribe((logs: []) => {
      this.logger.log("[AUTOMATION COMP.] Logs: ", logs);
      this.logs = logs;
      // this.logs = [
      //   {
      //     "json_message": {
      //         "messaging_product": "whatsapp",
      //         "to": "393278879006",
      //         "type": "template",
      //         "template": {
      //             "name": "programmazione_consegna",
      //             "language": {
      //                 "code": "it"
      //             }
      //         }
      //     },
      //     "id_project": "64425d26aaa97d0013819905",
      //     "transaction_id": "automation-request-64425d26aaa97d0013819905-1767104117900",
      //     "message_id": "wamid.HBgMMzkzMjc4ODc5MDA2FQIAERgSMTg2RUQ3N0ZDN0ZDRDE5NDY5AA==",
      //     "status": "failed",
      //     "status_code": -2,
      //     "error": "Business eligibility payment issue",
      //     "timestamp": "2025-12-30T14:15:19.472Z"
      //   }
      // ]
      this.showAutomationsList = false;
      this.showAutomationDetail = true;
      this.counter();
      this.changeRoute(automation_id)
      this.showSpinner = false;
    }, (error) => {
      this.logger.error("[AUTOMATION COMP.] Get logs error: ", error);
    })
  }

  counter() {
    this.read_count = this.logs.filter(l => l.status_code === 3).length
    this.delivered_count = this.logs.filter(l => l.status_code === 2).length
    this.sent_count = this.logs.filter(l => l.status_code === 1).length
    this.accepted_count = this.logs.filter(l => l.status_code === 0).length
    this.rejected_count = this.logs.filter(l => l.status_code === -1).length
    this.failed_count = this.logs.filter(l => l.status_code === -2).length
  }

  changeRoute(key?) {
    if (key) {
      this.router.navigate(['project/' + this.project._id + '/automations/'], { queryParams: { id: key } });
    } else {
      this.router.navigate(['project/' + this.project._id + '/automations/']);
    }
  }

  backToAutomations() {
    this.changeRoute();
    this.showAutomationsList = true;
    this.showAutomationDetail = false;
  }

  _reload(target) {
    this.showSpinner = true;
    if (target === 'logs') {
      this.getLogs(this.selected_automation_id);
      this.showAutomationsList = false;
      this.showAutomationDetail = true;
    }
    if (target === 'automations') {
      this.getTransactions();
      this.showAutomationsList = true;
      this.showAutomationDetail = false;
    }
  }

  reload(target) {
 
  this.showSpinner = true;

  if (target === 'logs') {
    this.getLogs(this.selected_automation_id);

    // Mantieni i query params attuali (es. id)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve'
    });

    this.showAutomationsList = false;
    this.showAutomationDetail = true;
  }

  if (target === 'automations') {
    this.getTransactions();

    // In questo caso puoi rimuovere l'id
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });

    this.showAutomationsList = true;
    this.showAutomationDetail = false;
  }
}


  goToNewBroadcast() {
    if (!this.PERMISSION_TO_CREATE) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    }
    this.router.navigate(['project/' + this.project._id + '/new-broadcast']);
  }

  trackByTransactionId(_index: number, automation: any) { 
    return automation._id; 
  }
}
