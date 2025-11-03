// src/app/admin/pages/dashboard/dashboard.component.ts
import {
  Component,
  OnInit,
  inject,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
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
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private adminService = inject(AdminService);
  @ViewChild('reservationsChart')
  reservationsChart!: ElementRef<HTMLCanvasElement>;

  stats: ReservationStats[] = [];
  periodInfo: { from: string; to: string } | null = null;
  loading = true;
  error: string | null = null;
  chart: Chart | null = null;
  private viewInitialized = false;

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    // Si les données sont déjà chargées, on affiche le graphique
    if (this.stats.length > 0) {
      this.renderChart();
    }
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getReservationsStats(7).subscribe({
      next: (res: DashboardResponse) => {
        console.log('Données reçues:', res);
        this.stats = res.stats || [];
        this.periodInfo = { from: res.from, to: res.to };
        this.loading = false;

        // On attend que la vue soit initialisée
        if (this.viewInitialized) {
          this.renderChart();
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = 'Erreur lors du chargement des statistiques.';
        this.loading = false;
      },
    });
  }

  private renderChart(): void {
    console.log('renderChart appelé'); // DEBUG
    console.log('Stats disponibles:', this.stats); // DEBUG

    if (!this.reservationsChart?.nativeElement) {
      console.warn('Canvas non disponible');
      return;
    }

    if (!this.stats.length) {
      console.warn('Aucune donnée à afficher');
      return;
    }

    // Utiliser les noms de films comme labels
    const labels = this.stats.map((s) => s.film);
    const data = this.stats.map((s) => s.totalReservations);

    console.log(' Labels:', labels); // DEBUG
    console.log(' Data:', data); //  DEBUG

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.reservationsChart.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Nombre de réservations',
            data,
            backgroundColor: '#e50914',
            borderRadius: 8,
            hoverBackgroundColor: '#b00610',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: '#fff' },
          },
          tooltip: {
            backgroundColor: '#181818',
            titleColor: '#fff',
            bodyColor: '#fff',
          },
        },
        scales: {
          x: {
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255,255,255,0.1)' }, // AJOUT pour visibilité
          },
          y: {
            ticks: { color: '#ccc' },
            grid: { color: 'rgba(255,255,255,0.1)' }, // ✅ AJOUT
            beginAtZero: true, // IMPORTANT
          },
        },
      },
    });

    console.log('Graphique créé avec succès');
  }
}
