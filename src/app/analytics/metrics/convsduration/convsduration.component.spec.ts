import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';
import { ConvsDurationComponent } from './convsduration.component';

import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core'; // suppress the error msg Can't bind to 'ngModel' + 'clearable' .... since it isn't a known property of 'ng-select'.
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Error: StaticInjectorError(DynamicTestModule)[AnalyticsService -> HttpClient]:

import { HttpClientTestingModule, HttpTestingController, RequestMatch, TestRequest } from '@angular/common/http/testing';

import { AppConfigService } from '../../../services/app-config.service'; // ERRORStaticInjectorError(DynamicTestModule)[AnalyticsService -> AppConfigService]:

import { AuthService } from '../../../core/auth.service';
import { NotifyService } from '../../../core/notify.service';  // Error: StaticInjectorError(DynamicTestModule)[AuthService -> NotifyService]:
import { LocalDbService } from '../../../services/users-local-db.service'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> LocalDbService]: 
import { WebSocketJs } from "../../../services/websocket/websocket-js"; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> WebSocketJs]: 
import { RouterTestingModule } from '@angular/router/testing'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> Router]: 
import { LoggerService } from '../../../services/logger/logger.service';

import { FaqKbService } from '../../../services/faq-kb.service';
import { DepartmentService } from '../../../services/department.service';

import { UsersService } from '../../../services/users.service';
import { BotLocalDbService } from '../../../services/bot-local-db.service'; // Error: StaticInjectorError(DynamicTestModule)[UsersService -> BotLocalDbService]
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AnalyticsService } from 'app/analytics/analytics-service/analytics.service';

describe('DurataconvComponent', () => {
  let component: ConvsDurationComponent;
  let fixture: ComponentFixture<ConvsDurationComponent>;

  let httpMock: HttpTestingController;
  // let injector: TestBed;
  let analyticsService: AnalyticsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConvsDurationComponent],
      // schemas: [NO_ERRORS_SCHEMA],
      imports: [
        TranslateModule.forRoot(),
        HttpClientModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        NgSelectModule,
      ],
      providers: [
        AnalyticsService,
        HttpClient,
        AuthService,
        NotifyService,
        LocalDbService,
        WebSocketJs,
        LoggerService,
        AppConfigService,
        FaqKbService,
        UsersService,
        DepartmentService,
        BotLocalDbService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvsDurationComponent);
    component = fixture.componentInstance;

    // httpMock = fixture.debugElement.injector.get<HttpTestingController>(HttpTestingController as Type<HttpTestingController>);

    // httpMock = TestBed.get(HttpTestingController);

    // injector = getTestBed();
    // httpMock = injector.get(HttpTestingController); // <-- here
    analyticsService = TestBed.get(AnalyticsService);
    httpMock = TestBed.get(HttpTestingController);

    fixture.detectChanges();


  });



//   it('#MedianConversationLength should return MedianConversationLength', (done) => {
//     const dummyMedianConversationLength = [{ "_id": "60ffe291f725db00347661ef", "duration_avg": 555938.8333333334 }]

//     // analyticsService.getDurationConversationTimeDataCLOCK().subscribe((res: any) => {
//     //   // expect(res).toEqual(dummyMedianConversationLength);
//     //   done();
//     // })
//     // const baseUrl ="https://tiledesk-server-pre.herokuapp.com/" 

//     // const baseUrl = "http://localhost:3000/"
//     // const medianConversationLengthReq = httpMock.expectOne(baseUrl + "60ffe291f725db00347661ef/analytics/requests/duration/");

//     let formatedURL = encodeURI(
//       'https://tiledesk-server-pre.herokuapp.com/60ffe291f725db00347661ef/analytics/requests/duration');

//       analyticsService.getDurationConversationTimeDataCLOCK().subscribe((retuenType: any) => {
//         expect(retuenType).not.toBe(null);
//         expect(JSON.stringify(retuenType)).toEqual(JSON.stringify(dummyMedianConversationLength));
//       });

//       const req = httpMock.expectOne(request => {
//         console.log("DURATA CONV COMPO SPEC url: ", request.url);
//         return true;
//     });
//       const testRequest: TestRequest = httpMock.expectOne((req) => true);
// expect(testRequest.request.url).toEqual('https://tiledesk-server-pre.herokuapp.com/60ffe291f725db00347661ef/analytics/requests/duration');
// expect(testRequest.request.method).toEqual('GET');
//     // const medianConversationLengthReq = httpMock.expectOne(req => req.method === 'GET' && req.url ===  formatedURL);

//     // const medianConversationLengthReq = httpMock.expectOne(formatedURL);

//     // // const medianConversationLengthReq = httpMock.expectOne(() => true);
//     // // expect(medianConversationLengthReq.request.method).toBe('GET');
//     // medianConversationLengthReq.flush(dummyMedianConversationLength);
//     // // medianConversationLengthReq.flush({});
//     // httpMock.verify();


//     // analyticsService.getDurationConversationTimeDataCLOCK().subscribe()
//     // const req = httpMock.expectOne({method: 'GET'});
//     // req.flush('Get');



//   })

  // afterEach(() => {
  //   httpMock.verify();
  // });

  // https://tiledesk-server-pre.herokuapp.com/60ffe291f725db00347661ef/analytics/requests/duration/day?lastdays=7&department_id=&participant=
  // [{"_id":{"day":10,"month":8,"year":2021},"duration_avg":149746.33333333334},{"_id":{"day":6,"month":8,"year":2021},"duration_avg":null}]
  // ,{"_id":{"day":6,"month":8,"year":2021},"duration_avg":null}




  it('should create', () => {
    // const dummyUsers = [{"_id":{"day":10,"month":8,"year":2021},"duration_avg":149746.33333333334},{"_id":{"day":6,"month":8,"year":2021},"duration_avg":null}];
    expect(component).toBeTruthy();
  });




  // describe('#MedianConversationLength', () => {
  //   it('should return MedianConversationLength', () => {
  //     const dummyMedianConversationLength = [{ "_id": "60ffe291f725db00347661ef", "duration_avg": 555938.8333333334 }]

  //     analyticsService.getDurationConversationTimeDataCLOCK().subscribe((medianConversationLength: any) => {
  //       expect(medianConversationLength.length).toBe(0);
  //       expect(medianConversationLength).toEqual(dummyMedianConversationLength);
  //     });

  //     const req = httpMock.expectOne("https://tiledesk-server-pre.herokuapp.com/60ffe291f725db00347661ef/analytics/requests/duration");
  //     expect(req.request.method).toBe("GET");
  //     req.flush(dummyMedianConversationLength);
  //   });
  // });


  // it('test durationConversationTimeCHART http call', (done) => {
  //   const dummyUsers =  [{"_id":{"day":10,"month":8,"year":2021},"duration_avg":149746.33333333334}];

  //   component.durationConversationTimeCHART(7, null, null);
  //   // const req = httpMock.expectOne('https://tiledesk-server-pre.herokuapp.com/60ffe291f725db00347661ef/analytics/requests/duration/day?lastdays=7');
  //   const req = httpMock.match('https://tiledesk-server-pre.herokuapp.com/60ffe291f725db00347661ef/analytics/requests/duration/day?lastdays=7');

  //   // backend.match()
  //   // const req = httpMock.expectNone('https://tiledesk-server-pre.herokuapp.com/60ffe291f725db00347661ef/analytics/requests/duration/day?lastdays=7');
  //   // req.flush(dummyUsers);

  //   // expect(req.request.method).toBe('GET');
  //   expect(component.durationConversationTime).toEqual(dummyUsers);
  //   done();
  // });

  // afterEach(() => {
  //   httpMock.verify();

  // });
  // afterEach(() => {
  //   httpMock.verify();

  // });

  // it('test your http call', (done) => {
  //   const lastdays = '7';
  //   const depID = '';
  //   const participantId = '';
  //   const dummyUsers = [{ "_id": { "day": 10, "month": 8, "year": 2021 }, "duration_avg": 149746.33333333334 }];

  //   // component.durationConversationTimeCHART(7, '', '');
  //   service.getDurationConversationTimeDataCHART(lastdays, depID, participantId).subscribe((resp: any) => {
  //     expect(resp).toBe(dummyUsers);
  //     expect(resp).toBeDefined();
  //     expect(resp.length).toBe(0);
  //     done();
  //   }, fail);

  //   // const req = httpMock.expectOne(`https://tiledesk-server-pre.herokuapp.com/60ffe291f725db00347661ef/analytics/requests/duration/day?lastdays=${lastdays}&department_id=${depID}&participant=${participantId}`);

  //   const requestMatch: RequestMatch = { url: `https://tiledesk-server-pre.herokuapp.com/60ffe291f725db00347661ef/analytics/requests/duration/day` };
  //   const testRequest: TestRequest = httpMock.expectOne(requestMatch);
  //   expect(testRequest.request.method).toBe('GET');
  //   expect(testRequest.request.params.get('lastdays')).toBe('7');
  //   expect(testRequest.request.params.get('depID')).toBe('');
  //   expect(testRequest.request.params.get('participantId')).toBe('');

  //   testRequest.flush({ suggestions: [] });
  // });


});
