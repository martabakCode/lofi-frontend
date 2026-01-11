import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  pieData: any;
  pieOptions: any;
  barData: any;
  barOptions: any;
  today = new Date();

  ngOnInit() {
    this.initCharts();
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';

    this.pieData = {
      labels: ['Pending', 'Marketing Review', 'Manager Approved', 'Disbursed', 'Rejected'],
      datasets: [
        {
          data: [15, 24, 12, 45, 8],
          backgroundColor: [
            documentStyle.getPropertyValue('--primary-500') || '#FF8500',
            documentStyle.getPropertyValue('--accent-400') || '#3FD8D4',
            documentStyle.getPropertyValue('--primary-300') || '#ffb16f',
            documentStyle.getPropertyValue('--accent-600') || '#0d9488',
            documentStyle.getPropertyValue('--red-500') || '#ef4444'
          ]
        }
      ]
    };

    this.pieOptions = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            color: textColor
          }
        }
      }
    };

    this.barData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Disbursed Amount',
          backgroundColor: documentStyle.getPropertyValue('--primary-500') || '#6366f1',
          data: [650000, 590000, 800000, 810000, 560000, 550000, 400000]
        }
      ]
    };

    this.barOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d',
            font: {
              weight: 500
            }
          },
          grid: {
            display: false,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d'
          },
          grid: {
            color: documentStyle.getPropertyValue('--surface-border') || '#dfe7ef',
            drawBorder: false
          }
        }
      }
    };
  }
}
