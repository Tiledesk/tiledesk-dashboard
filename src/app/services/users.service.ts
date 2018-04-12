import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

import { User } from '../models/user-model';
import { ProjectUser } from '../models/project-user';

import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { AuthService } from '../core/auth.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { environment } from '../../environments/environment';

interface NewUser {
  displayName: string;
  email: string;
  time: number;
}

@Injectable()
export class UsersService {

  http: Http;
  BASE_URL = environment.mongoDbConfig.BASE_URL;
  MONGODB_BASE_URL: any;
  INVITE_USER_URL: any;
  PROJECT_USER_DTLS_URL: any;
  TOKEN: string
  user: any;

  orderBy_field: any;
  orderBy_direction: any;

  usersCollection: AngularFirestoreCollection<User>;
  userDocument: AngularFirestoreDocument<Node>;

  searchUserCollection: AngularFirestoreCollection<User>;

  project: any;

  constructor(
    http: Http,
    private afs: AngularFirestore,
    private auth: AuthService
  ) {
    // this.usersCollection = this.afs.collection('users', (ref) => ref.orderBy('time', 'desc').limit(5));
    // this.searchUserCollection = this.afs.collection('users', (ref) => ref.where('displayName', '>=', 'B'));

    this.http = http;
    // SUBSCRIBE TO USER BS
    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkUser()
    });

    this.getCurrentProject();
  }


  getCurrentProject() {
    console.log('USER SERVICE - SUBSCRIBE TO CURRENT PROJ ')
    // tslint:disable-next-line:no-debugger
    // debugger
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // tslint:disable-next-line:no-debugger
      // debugger
      if (this.project) {
        console.log('-- -- >>>> 00 -> USERS SERVICE project ID from AUTH service subscription  ', this.project._id)
        this.MONGODB_BASE_URL = this.BASE_URL + this.project._id + '/project_users/'
        this.INVITE_USER_URL = this.BASE_URL + this.project._id + '/project_users/invite'
        this.PROJECT_USER_DTLS_URL = this.BASE_URL + this.project._id + '/member/'
        // '/project_users/'
      }
    });
  }

  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token
      // this.getToken();
    } else {
      console.log('No user is signed in');
    }
  }

  /**
   * return an observable of ALL FIRESTORE 'users' * WITH * ID
   */
  getSnapshot(orderBy_field: any, orderBy_direction: any): Observable<User[]> {
    // ['added', 'modified', 'removed']

    this.orderBy_field = orderBy_field;
    this.orderBy_direction = orderBy_direction;

    this.usersCollection = this.afs.collection('users', (ref) => ref.orderBy(this.orderBy_field, this.orderBy_direction));
    console.log('Hello User Service!');
    console.log('COLLECTION ORDERED BY FIELD', this.orderBy_field);
    console.log('COLLECTION ORDERED BY DIRECTION', this.orderBy_direction);
    return this.usersCollection.snapshotChanges().map((actions) => {
      return actions.map((a) => {
        const data = a.payload.doc.data() as User;
        return { id: a.payload.doc.id, displayName: data.displayName, email: data.email, time: data.time };
      });
    });
  }

  searchUsers(searchParams: any) {
    this.searchUserCollection = this.afs.collection('users',
      (ref) => ref.where('displayName', '>=', `${searchParams}`));
    return this.searchUserCollection.snapshotChanges().map((actions) => {
      return actions.map((a) => {
        const data = a.payload.doc.data() as User;
        return { id: a.payload.doc.id, displayName: data.displayName, email: data.email, time: data.time };
      });
    });
  }


  // this.afs.collection('users');
  // getDataFilter(): Observable<User[]> {
  //   this.searchUserCollection = this.afs.collection('users', (ref) => ref.where('displayName', '>=', 'Kopolla' ));
  //   return this.searchUserCollection.valueChanges();
  // }

  getUser(id: string) {
    return this.afs.doc<User>(`users/${id}`);
  }

  deleteUser(id: string) {
    return this.getUser(id).delete();
  }
  /**
   * return an observable of ALL FIRESTORE CHAT-F21 'users' * WITHOUT * ID
   */
  getData(): Observable<User[]> {
    return this.usersCollection.valueChanges();
  }


  // displayName: string
  create(displayName: string, email: string) {
    const user = {
      displayName: `${displayName}`,
      email: `${email}`,
      time: new Date().getTime(),
    };
    return this.usersCollection.add(user);
    // return this.usersCollection.doc('PXmRJVrtzFAHsxjs7voD5R').set(user);
  }


  /// ================================== PROJECT-USER FROM MONGO DB ================================== ///
  /**
   * NOTE: the PROJECT-USER returned has nested the user's object
   */
  public getProjectUsersByProjectId(): Observable<ProjectUser[]> {
    const url = this.MONGODB_BASE_URL;

    console.log('PROJECT USERS URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  public inviteUser(email: string, role: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'email': email, 'role': role, 'id_project': this.project._id };

    console.log('POST INVITE USER - REQUEST BODY ', body);

    const url = this.INVITE_USER_URL;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

 }
