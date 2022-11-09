import { async, ComponentFixture, getTestBed, TestBed, inject } from '@angular/core/testing';

import { MockBackend, MockConnection } from '@angular/http/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import {
//   it,
//   inject,
//   injectAsync,
//   beforeEachProviders
// } from 'angular2/testing';
import { SatisfactionComponent } from './satisfaction.component';

import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core'; // suppress the error msg "Can't bind to 'ngModel' + 'clearable' since it isn't a known property of 'ng-select'.""
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Error: StaticInjectorError(DynamicTestModule)[AnalyticsService -> HttpClient]:
import { AuthService } from '../../../core/auth.service';
import { NotifyService } from '../../../core/notify.service';  // Error: StaticInjectorError(DynamicTestModule)[AuthService -> NotifyService]:
import { LocalDbService } from '../../../services/users-local-db.service'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> LocalDbService]: 
import { WebSocketJs } from "../../../services/websocket/websocket-js"; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> WebSocketJs]: 
import { RouterTestingModule } from '@angular/router/testing'; // Error: StaticInjectorError(DynamicTestModule)[AuthService -> Router]: 
import { LoggerService } from '../../../services/logger/logger.service';
import { AppConfigService } from '../../../services/app-config.service';
import { DepartmentService } from '../../../services/department.service';
import { UsersService } from '../../../services/users.service';
import { FaqKbService } from '../../../services/faq-kb.service';
import { BotLocalDbService } from '../../../services/bot-local-db.service';
import { Observable } from 'rxjs/Observable';

import { Department } from '../../../models/department-model';
import { AnalyticsService } from 'app/analytics/analytics-service/analytics.service';
let service;

describe('SatisfactionComponent', () => {
  let component: SatisfactionComponent;
  let fixture: ComponentFixture<SatisfactionComponent>;

  // let departmentService;
  // let spy;
 

  // let injector: TestBed;
  // let service: DepartmentService;
  // let httpMock: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SatisfactionComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        TranslateModule.forRoot(),
        HttpClientModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        AnalyticsService,
        HttpClient,
        AuthService,
        NotifyService,
        LocalDbService,
        WebSocketJs,
        AppConfigService,
        LoggerService,
        DepartmentService,
        UsersService,
        FaqKbService,
        BotLocalDbService,
        {
          provide: Http, useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          },
          deps: [MockBackend],
        },
        MockBackend
      ],
    })
      .compileComponents();
    // injector = getTestBed();
    // service = injector.get(DepartmentService);
    // httpMock = injector.get(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SatisfactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();


    // departmentService = fixture.debugElement.injector.get(DepartmentService);
    // let observable: Observable<Response> = Observable.create(observer => {
    //   let responseOptions = new ResponseOptions({
    //     body: '[{ "routing": "assigned", "default": true, "status": 1, "_id": "60ffe291f725db00347661f1", "name": "Default Department", "id_project": "60ffe291f725db00347661ef", "createdBy": "608ad02d3a4dc000344ade17", "tags": [], "createdAt": "2021-07-27T10:40:17.823Z", "updatedAt": "2021-07-27T10:40:17.823Z", "__v": 0, "hasBot": false, "id": "60ffe291f725db00347661f1" }]'
    //   });

    //   observer.next(new Response(responseOptions));
    // });

    // spy = spyOn(departmentService, 'getDeptsByProjectId')
    //   .and.returnValue(observable);
  });



  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // https://stackoverflow.com/questions/39599084/test-angular-2-0-0-component-with-http-request
  // it('should return a department', async(() => {
  //   fixture.detectChanges();
  //   setTimeout(() => {
  //     expect(component.departments).toEqual([
  //       { "routing": "assigned", "default": true, "status": 1, "_id": "60ffe291f725db00347661f1", "name": "Default Department", "id_project": "60ffe291f725db00347661ef", "createdBy": "608ad02d3a4dc000344ade17", "tags": [], "createdAt": "2021-07-27T10:40:17.823Z", "updatedAt": "2021-07-27T10:40:17.823Z", "__v": 0, "hasBot": false, "id": "60ffe291f725db00347661f1" }
  //     ]);
  //   }, 100);
  // }));

  // it('should unsubscribe when destroyed', () => {
  //   let fixture = TestBed.createComponent(SatisfactionComponent);
  //   fixture.detectChanges();
  //   fixture.destroy();
  //   spyOn(
  //     (component as any).subscription,
  //     'unsubscribe'
  //   ).and.callThrough()
  //   component.ngOnDestroy();
  //   expect(spy).toHaveBeenCalled();
  // });


  // beforeEach(inject([Http, AuthService, AppConfigService, LoggerService], (http: Http, auth: AuthService, appConfigService: AppConfigService, logger: LoggerService) => {
  //   service = new DepartmentService(http, auth, appConfigService, logger); 
  // }));

  // it('should get Departments', async(() => {

  //   const mockResponse = {
  //     data: [
  //       { "routing": "assigned", "default": true, "status": 1, "_id": "60ffe291f725db00347661f1", "name": "Default Department", "id_project": "60ffe291f725db00347661ef", "createdBy": "608ad02d3a4dc000344ade17", "tags": [], "createdAt": "2021-07-27T10:40:17.823Z", "updatedAt": "2021-07-27T10:40:17.823Z", "__v": 0, "hasBot": false, "id": "60ffe291f725db00347661f1" },
  //     ]
  //   };

  //   TestBed.get(MockBackend).connections.subscribe(connection => {
  //     // connection.mockRespond(new Response(new ResponseOptions({body: Promise.resolve(true)}))); // https://stackoverflow.com/questions/43476109/i-want-to-do-a-basic-angular-2-unit-test-for-a-http-get-request
  //     connection.mockRespond(new Response(new ResponseOptions({body: JSON.stringify(mockResponse)})));
  //   });


  //   service.getDeptsByProjectId().subscribe((depts) => {
  //     expect(depts.length).toBe(1);
  //     expect(depts[0].name).toEqual('Default Department');
  //   });

  //   // mockBackend.connections.subscribe((connection: MockConnection) => {
  //   //   connection.mockRespond(new Response(
  //   //     new ResponseOptions({
  //   //       body: JSON.stringify(mockResponse)
  //   //     }
  //   //     )));
  //   // });


  //   // client.getDeptsByProjectId().subscribe((depts) => {
  //   //   expect(depts.length).toBe(1);
  //   //   expect(depts[0].name).toEqual('Default Department');
  //   // });


  // }));




  // afterEach(() => {
  //   httpMock.verify();
  // });

  // describe('#getDepartments', () => {
  //   it('should return an Observable<Depatartments[]>', () => {
  //     const dummyDepatment = [
  //       { "routing": "assigned", "default": true, "status": 1, "_id": "60ffe291f725db00347661f1", "name": "Default Department", "id_project": "60ffe291f725db00347661ef", "createdBy": "608ad02d3a4dc000344ade17", "tags": [], "createdAt": "2021-07-27T10:40:17.823Z", "updatedAt": "2021-07-27T10:40:17.823Z", "__v": 0, "hasBot": false, "id": "60ffe291f725db00347661f1" },
  //       { "routing": "assigned", "default": false, "status": 1, "_id": "610183e5a9317a0034c81834", "name": "D1 - MOD", "id_project": "60ffe291f725db00347661ef", "createdBy": "608ad02d3a4dc000344ade17", "tags": [], "createdAt": "2021-07-28T16:20:53.690Z", "updatedAt": "2021-07-30T10:38:57.756Z", "__v": 0, "id_bot": null, "id_group": null, "hasBot": false, "id": "610183e5a9317a0034c81834" }
  //     ];

  //     service.getDeptsByProjectId().subscribe((depts: any) => {
  //       expect(depts.length).toBe(2);
  //       expect(depts).toEqual(dummyDepatment);
  //     });


  //     const req = httpMock.expectOne({ url: 'http://localhost:3000/undefined/departments/allstatus', method: 'GET' });
  //     expect(req.request.method).toBe("GET");
  //     req.flush(dummyDepatment);
  //     httpMock.verify();
  //   });
  // });


  //   describe('getDepts()', () => {

  //     it('should return an Observable<Array<Depts>',
  //         inject([DepartmentService, XHRBackend], (departmentService, mockBackend) => {

  //         const mockResponse = {
  //           data: [
  //             { "routing": "assigned", "default": true, "status": 1, "_id": "60ffe291f725db00347661f1", "name": "Default Department", "id_project": "60ffe291f725db00347661ef", "createdBy": "608ad02d3a4dc000344ade17", "tags": [], "createdAt": "2021-07-27T10:40:17.823Z", "updatedAt": "2021-07-27T10:40:17.823Z", "__v": 0, "hasBot": false, "id": "60ffe291f725db00347661f1" },
  //           ]
  //         };

  //         mockBackend.connections.subscribe((connection) => {
  //           connection.mockRespond(new Response(new ResponseOptions({
  //             body: JSON.stringify(mockResponse)
  //           })));
  //         });

  //         departmentService.getDeptsByProjectId().subscribe((depts) => {
  //           expect(depts.length).toBe(1);
  //           expect(depts[0].name).toEqual('Default Department');
  //         });

  //     }));
  //   });
  // });

  // describe('DepartmentsService (with mocks)', () => {
  //   // let injector: TestBed;
  //   // let service: DepartmentService;
  //   // let httpMock: HttpTestingController;
  //   let httpClient: HttpClient;
  //   let httpMock: HttpTestingController;
  //   let departmentService: DepartmentService;

  //   beforeEach(() => {
  //     TestBed.configureTestingModule({
  //       // Import the HttpClient mocking services
  //       imports: [HttpClientTestingModule],
  //       // Provide the service-under-test
  //       providers: [DepartmentService]
  //     });

  //     // Inject the http, test controller, and service-under-test
  //     // as they will be referenced by each test.
  //     // let injector: TestBed;
  //     // httpClient = injector.get(HttpClient);
  //     // httpMock = injector.get(HttpTestingController);
  //     // departmentService = injector.get(DepartmentService);
  //     let injector: TestBed;
  //     injector = getTestBed();
  //     departmentService = injector.get(DepartmentService);
  //     httpMock = injector.get(HttpTestingController);
  //   });

  // afterEach(() => {
  //   // After every test, assert that there are no more pending requests.
  //   httpMock.verify();
  // });

  //   /// Departments method tests begin ///
  //   describe('#getDepartments', () => {
  //     let expectedDepartments: Department[];

  //     beforeEach(() => {
  //       let injector: TestBed;
  //       departmentService = injector.get(DepartmentService);
  //       expectedDepartments = [
  //         { "routing": "assigned", "default": true, "status": 1, "_id": "60ffe291f725db00347661f1", "name": "Default Department", "id_project": "60ffe291f725db00347661ef", "createdBy": "608ad02d3a4dc000344ade17", "tags": [], "createdAt": "2021-07-27T10:40:17.823Z", "updatedAt": "2021-07-27T10:40:17.823Z", "__v": 0, "hasBot": false, "id": "60ffe291f725db00347661f1" },
  //         { "routing": "assigned", "default": false, "status": 1, "_id": "610183e5a9317a0034c81834", "name": "D1 - MOD", "id_project": "60ffe291f725db00347661ef", "createdBy": "608ad02d3a4dc000344ade17", "tags": [], "createdAt": "2021-07-28T16:20:53.690Z", "updatedAt": "2021-07-30T10:38:57.756Z", "__v": 0, "id_bot": null, "id_group": null, "hasBot": false, "id": "610183e5a9317a0034c81834" }
  //       ] as Department[];
  //     });

  //     it('should return expected departments (called once)', () => {
  //       departmentService.getDeptsByProjectId().subscribe(
  //         departments => expect(departments).toEqual(expectedDepartments, 'should return expected heroes'),
  //         fail
  //       );

  //       // HeroService should have made one request to GET heroes from expected URL
  //       const req = httpMock.expectOne("https://tiledesk-server-pre.herokuapp.com/60ffe291f725db00347661ef/departments/allstatus");
  //       expect(req.request.method).toEqual('GET');

  //       // Respond with the mock heroes
  //       req.flush(expectedDepartments);
  //     });

  //     it('should be OK returning no heroes', () => {
  //       departmentService.getDeptsByProjectId().subscribe(
  //         departments => expect(departments.length).toEqual(0, 'should have empty heroes array'),
  //         fail
  //       );

  //       const req = httpMock.expectOne("https://tiledesk-server-pre.herokuapp.com/60ffe291f725db00347661ef/departments/allstatus");
  //       req.flush([]); // Respond with no heroes
  //     });

  //     it('should turn 404 into a user-friendly error', () => {
  //       const msg = 'Deliberate 404';
  //       departmentService.getDeptsByProjectId().subscribe(
  //         departments => fail('expected to fail'),
  //         error => expect(error.message).toContain(msg)
  //       );

  //       const req = httpMock.expectOne("https://tiledesk-server-pre.herokuapp.com/60ffe291f725db00347661ef/departments/allstatus");

  //       // respond with a 404 and the error message in the body
  //       req.flush(msg, { status: 404, statusText: 'Not Found' });
  //     });


  //   });

});

// describe('DepartmentService', () => {


//   beforeEach(() => TestBed.configureTestingModule({
//     imports: [
//       HttpModule,
//     ],
//     providers: [
//       { provide: XHRBackend, useClass: MockBackend },
//       DepartmentService,
//       AuthService
//     ]
//   }));

//   // it('should set and get secret key', inject([DepartmentService], (client) => {
//   //   client.setApiKey('test');
//   //   expect(client.getApiKey()).toEqual('test');
//   // }));

//   it('should get Departments', inject([XHRBackend, DepartmentService], (mockBackend, client) => {

//     const mockResponse = {
//       data: [
//         { "routing": "assigned", "default": true, "status": 1, "_id": "60ffe291f725db00347661f1", "name": "Default Department", "id_project": "60ffe291f725db00347661ef", "createdBy": "608ad02d3a4dc000344ade17", "tags": [], "createdAt": "2021-07-27T10:40:17.823Z", "updatedAt": "2021-07-27T10:40:17.823Z", "__v": 0, "hasBot": false, "id": "60ffe291f725db00347661f1" },
//       ]
//     };

//     mockBackend.connections.subscribe((connection: MockConnection) => {
//       connection.mockRespond(new Response(
//         new ResponseOptions({
//           body: JSON.stringify(mockResponse)
//         }
//         )));
//     });


//     client.getDeptsByProjectId().subscribe((depts) => {
//       expect(depts.length).toBe(1);
//       expect(depts[0].name).toEqual('Default Department');
//     });


//   }));

// });




