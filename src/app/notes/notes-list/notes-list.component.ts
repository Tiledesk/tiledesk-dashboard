import { Component, OnInit } from '@angular/core';

import { NoteService } from '../note.service';

import { Note } from '../note-model';

import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
})
export class NotesListComponent implements OnInit {

  notes: Observable<Note[]>;
  content: string;

  constructor(
    private noteService: NoteService,
  ) { }

  ngOnInit() {
    // this.notes = this.noteService.getData()
    this.notes = this.noteService.getSnapshot();
    console.log('THIS NOTES (note-list.component) ', this.notes);

    // this.noteService.getData().subscribe((data) => {
    //   console.log('USER-LIST.COMP: SUBSCRIPTION TO getData ', data);

    // });
  }

  createNote() {
    this.noteService.create(this.content);
    this.content = '';
  }

}
