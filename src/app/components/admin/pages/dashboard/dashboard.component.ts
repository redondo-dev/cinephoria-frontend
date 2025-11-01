// src/app/admin/pages/dashboard/dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AdminService,
  DashboardResponse,
  ReservationStats,
} from '../../services/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  stats: ReservationStats[] = [];
  periodInfo: { from: string; to: string } | null = null;
  loading = true;
  error: string | null = null;
  maxReservations = 0;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getReservationsStats(7).subscribe({
      next: (res: DashboardResponse) => {
        this.stats = res.stats || [];
        // Info période
        this.periodInfo = {
          from: res.from,
          to: res.to,
        };
        this.maxReservations = this.stats.length
          ? Math.max(...this.stats.map((s) => s.totalReservations))
          : 1;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }
  getBarWidth(value: number): number {
    return (value / this.maxReservations) * 100;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  }

  truncate(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}
