import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpStatsService } from 'app/services/http-stats.service';

interface StatRecord {  // <-- aggiungi questa
  endpoint: string;
  method: string;
  count: number;
  avgTime: number;
}

@Component({
  selector: 'appdashboard-http-stats-dashboard',
  templateUrl: './http-stats-dashboard.component.html',
  styleUrls: ['./http-stats-dashboard.component.scss']
})
export class HttpStatsDashboardComponent implements OnInit {
  displayedColumns: string[] = ['method', 'endpoint', 'count', 'avgTime'];
  dataSource = new MatTableDataSource<StatRecord>([]);
  filterValue = '';
  isMinimized = false; // nuovo: stato minimizzato

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private httpStats: HttpStatsService) { }

  ngOnInit(): void {
    setInterval(() => this.refreshData(), 2000);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

refreshData() {
  const stats = this.httpStats.getStats();
  const data: StatRecord[] = Object.entries(stats).map(([key, info]: any) => {
    // Separa metodo ed endpoint (es: "GET /api/users" → method="GET", endpoint="/api/users")
    const [method, ...endpointParts] = key.split(' ');
    const endpoint = endpointParts.join(' ');
    
    return {
      method,           // <-- Ora method è disponibile
      endpoint,         // <-- Endpoint senza il metodo
      count: info.count,
      avgTime: info.avgTime
    };
  });

  this.dataSource.data = data;
  this.applyFilter();
}

  applyFilter() {
    this.dataSource.filter = this.filterValue.trim().toLowerCase();
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }

  // Calcola il totale delle richieste
  getTotalRequests(): number {
    return this.dataSource.data.reduce((total, row) => total + row.count, 0);
  }

  // Reset delle statistiche
  resetStats() {
    this.httpStats.resetStats();
    this.refreshData(); // Aggiorna la tabella
  }

  getTotalAvgTime(): number {
    if (this.dataSource.data.length === 0) return 0;

    const totalCount = this.getTotalRequests();
    const totalTime = this.dataSource.data.reduce((total, row) => total + (row.avgTime * row.count), 0);

    return totalTime / totalCount;
  }

}


