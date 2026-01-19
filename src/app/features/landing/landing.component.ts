import { Component, OnInit, PLATFORM_ID, Inject, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ProductFacade } from '../products/facades/product.facade';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
    private isBrowser: boolean;
    isMenuOpen = false;
    isLoaded = true; // Set to true immediately for "langsung muncul"
    isDarkMode = false;

    // Problems & Solutions
    problems = [
        { text: 'Proses manual yang lambat dan tidak efisien' },
        { text: 'Kurangnya transparansi status pengajuan' },
        { text: 'Risiko kesalahan input data yang tinggi' },
        { text: 'Kesulitan dalam melacak riwayat persetujuan' }
    ];

    solutions = [
        { text: 'Digitalisasi alur kerja yang terstruktur' },
        { text: 'Pelacakan real-time untuk setiap tahap' },
        { text: 'Validasi otomatis untuk akurasi data' },
        { text: 'Audit trail lengkap dan sistematis' }
    ];

    // How It Works Steps
    steps = [
        { title: 'Pengajuan', description: 'Isi formulir pengajuan secara digital dengan mudah.' },
        { title: 'Verifikasi', description: 'Sistem dan tim melakukan pengecekan data.' },
        { title: 'Persetujuan', description: 'Review bertahap sesuai dengan struktur organisasi.' },
        { title: 'Pencairan', description: 'Dana diproses dan dikirim ke rekening tujuan.' }
    ];

    // Features
    features = [
        { title: 'Smart Validation', description: 'Memastikan data yang masuk sesuai dengan kriteria yang ditentukan.' },
        { title: 'Workflow Engine', description: 'Alur persetujuan yang fleksibel dan dapat disesuaikan.' },
        { title: 'Real-time Analytics', description: 'Pantau performa proses bisnis Anda secara langsung.' },
        { title: 'Secure Integration', description: 'Keamanan data tingkat tinggi dengan enkripsi standar industri.' }
    ];

    // Benefits
    benefits = [
        { title: 'Efisiensi Waktu', description: 'Mengurangi waktu proses hingga 70% dibandingkan metode konvensional.' },
        { title: 'Transparansi Penuh', description: 'Semua pihak memiliki visibilitas terhadap status proses.' },
        { title: 'Keamanan Data', description: 'Data tersimpan aman dengan sistem backup berkala.' },
        { title: 'Skalabilitas Tinggi', description: 'Sistem yang siap tumbuh bersama perkembangan bisnis Anda.' }
    ];

    heroWords = "Sistem Digital yang Menyederhanakan Proses Anda".split(' ');

    // Simulation State
    productFacade = inject(ProductFacade);
    products = this.productFacade.products;

    simSelectedProductId = '';
    simAmount: number | null = null;
    simTenor: number | null = null;

    constructor(
        private router: Router,
        private meta: Meta,
        private title: Title,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.title.setTitle('LoFi - Productivity, Focus, Calm Workflow System');
        this.meta.updateTag({ name: 'description', content: 'Experience a calm, and highly focused loan approval workflow. LoFi simplifies digital processes with ease and music-like harmony.' });

        // Load products for calculator
        this.productFacade.loadProducts();

        if (this.isBrowser) {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                this.isDarkMode = true;
                document.documentElement.classList.add('dark');
            }
        }
    }

    get selectedProduct() {
        return this.products().find(p => p.id === this.simSelectedProductId);
    }

    get simulationResult() {
        const p = this.selectedProduct;
        const amount = this.simAmount;
        const tenor = this.simTenor;

        if (!p || !amount || !tenor) return null;

        // Validation limits
        // Note: Backend might provide huge nums, keep JS safe.
        // Assuming rate is per annum percentage (standard).
        // Calculation: Simple Interest (Flat)
        // Interest = Principal * Rate% * (Tenor/12)
        const rate = p.interestRate || 0;
        const totalInterest = amount * (rate / 100) * (tenor / 12);
        const totalPayment = amount + totalInterest;
        const monthlyInstallment = totalPayment / tenor;

        return {
            monthlyInstallment,
            totalPayment
        };
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        if (this.isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }

    scrollToSection(sectionId: string) {
        if (this.isBrowser) {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    onProductChange() {
        const p = this.selectedProduct;
        if (p) {
            // Set defaults to minimum values when product changes
            this.simAmount = p.minAmount;
            this.simTenor = p.minTenor;
        }
    }
}
