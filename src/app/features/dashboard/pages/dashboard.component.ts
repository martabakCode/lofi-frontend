import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { MenuItem } from 'primeng/api'; // Removed
// Replacing with any or local type
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Chart Data
  monthlySalesData: any;
  monthlySalesOptions: any;

  targetData: any;
  targetOptions: any;

  statisticsData: any;
  statisticsOptions: any;

  // UI State
  timeRangeItems: any[] | undefined;
  activeTimeRange: any | undefined;
  dateRange: Date[] | undefined;

  menuItems: any[] = [
    { label: 'View Details', icon: 'pi pi-eye' },
    { label: 'Export', icon: 'pi pi-download' }
  ];

  ngOnInit() {
    this.initCharts();
    this.initTimeRanges();
  }

  initTimeRanges() {
    this.timeRangeItems = [
      { label: 'Monthly', icon: 'pi pi-calendar' },
      { label: 'Quarterly', icon: 'pi pi-calendar-plus' },
      { label: 'Annually', icon: 'pi pi-calendar-times' }
    ];
    this.activeTimeRange = this.timeRangeItems[0];
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    // 1. Monthly Sales (Bar Chart)
    this.monthlySalesData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Sales',
          backgroundColor: '#3B82F6', // blue-500
          borderRadius: 4,
          data: [150, 380, 190, 290, 180, 190, 280, 90, 210, 390, 280, 100],
          barThickness: 20
        }
      ]
    };

    this.monthlySalesOptions = {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        x: {
          ticks: { color: textColorSecondary },
          grid: { display: false, drawBorder: false }
        }
      }
    };

    // 2. Monthly Target (Doughnut/Semi-circle)
    this.targetData = {
      labels: ['Completed', 'Remaining'],
      datasets: [
        {
          data: [75.55, 24.45],
          backgroundColor: ['#3B82F6', '#EFF6FF'], // blue-500, blue-50
          hoverBackgroundColor: ['#2563EB', '#DBEAFE'],
          borderWidth: 0,
          cutout: '85%',
          circumference: 180,
          rotation: 270
        }
      ]
    };

    this.targetOptions = {
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      aspectRatio: 1.5
    };

    // 3. Statistics (Area Chart)
    this.statisticsData = {
      labels: ['Jan 01', 'Jan 03', 'Jan 06', 'Jan 09', 'Jan 12', 'Jan 15', 'Jan 18', 'Jan 21', 'Jan 24', 'Jan 27', 'Jan 30'],
      datasets: [
        {
          label: 'Revenue',
          data: [150, 190, 220, 180, 250, 280, 260, 320, 350, 280, 380],
          fill: true,
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)'); // blue-500 with opacity
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            return gradient;
          },
          borderColor: '#3B82F6',
          tension: 0.4,
          pointRadius: 0
        },
        {
          label: 'Expenses',
          data: [120, 150, 180, 140, 200, 220, 200, 250, 280, 220, 300],
          fill: true,
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(168, 85, 247, 0.2)'); // purple-500 with opacity
            gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
            return gradient;
          },
          borderColor: '#A855F7',
          tension: 0.4,
          pointRadius: 0
        }
      ]
    };

    this.statisticsOptions = {
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { usePointStyle: true, boxWidth: 8 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          display: false
        },
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 6 }
        }
      },
      elements: {
        point: { radius: 0 }
      }
    };
  }
}
