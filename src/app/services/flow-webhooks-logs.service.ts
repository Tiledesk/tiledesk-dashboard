import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

interface LogRow {
  text: string;
  level: string;
  nlevel: number;
  _id: string;
  timestamp: string;
}

interface LogEntry {
  _id: string;
  request_id: string;
  __v: number;
  createdAt: string;
  id_project: string;
  rows: LogRow;
  shortExp: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class FlowWebhooksLogsService {
  getLogs(): Observable<LogEntry[]> {
    // Mock data
    return of([
      {
        _id: '1',
        request_id: 'req-1',
        __v: 0,
        createdAt: '2025-05-08T09:28:06.009Z',
        id_project: 'project-1',
        rows: {
          text: '[Capture User Reply] Action completed',
          level: 'info',
          nlevel: 2,
          _id: 'row-1',
          timestamp: '2025-05-08T09:28:06.587Z'
        },
        shortExp: '2025-05-08T09:28:06.586Z',
        updatedAt: '2025-05-08T09:28:06.586Z'
      },
      {
        _id: '2',
        request_id: 'req-2',
        __v: 0,
        createdAt: '2025-05-08T09:29:06.009Z',
        id_project: 'project-1',
        rows: {
          text: 'Warning: something might be wrong in the flow execution. Please check the configuration.',
          level: 'warn',
          nlevel: 1,
          _id: 'row-2',
          timestamp: '2025-05-08T09:29:06.587Z'
        },
        shortExp: '2025-05-08T09:29:06.586Z',
        updatedAt: '2025-05-08T09:29:06.586Z'
      },
      {
        _id: '3',
        request_id: 'req-3',
        __v: 0,
        createdAt: '2025-05-08T09:30:06.009Z',
        id_project: 'project-1',
        rows: {
          text: 'Error: failed to execute webhook due to missing parameters in the payload.',
          level: 'error',
          nlevel: 3,
          _id: 'row-3',
          timestamp: '2025-05-08T09:30:06.587Z'
        },
        shortExp: '2025-05-08T09:30:06.586Z',
        updatedAt: '2025-05-08T09:30:06.586Z'
      }
    ]);
  }
} 