import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,

    ],
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.css'],
    animations: [
        trigger('fadeInUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class LandingComponent implements OnInit {
    items: any[] | undefined;

    features = [
        {
            icon: 'pi pi-shield',
            title: 'Secure & Reliable',
            description: 'Bank-grade security standards ensuring your data is always protected.'
        },
        {
            icon: 'pi pi-bolt',
            title: 'Lightning Fast',
            description: 'Optimized performance for seamless loan processing and management.'
        },
        {
            icon: 'pi pi-chart-line',
            title: 'Real-time Analytics',
            description: 'Comprehensive dashboard with real-time insights and reporting.'
        },
        {
            icon: 'pi pi-users',
            title: 'User Management',
            description: 'Advanced role-based access control for your entire organization.'
        },
        {
            icon: 'pi pi-mobile',
            title: 'Mobile First',
            description: 'Fully responsive design that works perfectly on any device.'
        },
        {
            icon: 'pi pi-cloud',
            title: 'Cloud Native',
            description: 'Built for the cloud with scalability and reliability in mind.'
        }
    ];

    testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Finance Director',
            comment: 'This platform has transformed how we handle loan processing. The efficiency gains are remarkable.',
            image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png'
        },
        {
            name: 'Michael Chen',
            role: 'Operations Manager',
            comment: 'The user interface is incredibly intuitive. Our team was up and running in minutes.',
            image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png'
        },
        {
            name: 'Emily Davis',
            role: 'Small Business Owner',
            comment: 'Fast, reliable, and secure. Exactly what I needed for my business financing.',
            image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png'
        }
    ];

    pricingPlans = [
        {
            name: 'Starter',
            price: '$29',
            period: 'per month',
            features: ['Up to 100 Loans', 'Basic Analytics', 'Email Support', '1 Admin User'],
            recommended: false
        },
        {
            name: 'Professional',
            price: '$99',
            period: 'per month',
            features: ['Unlimited Loans', 'Advanced Analytics', 'Priority Support', '5 Admin Users', 'API Access'],
            recommended: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: 'contact us',
            features: ['Unlimited Everything', 'Custom Integration', 'Dedicated Account Manager', 'SLA Guarantee'],
            recommended: false
        }
    ];

    responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 3,
            numScroll: 3
        },
        {
            breakpoint: '768px',
            numVisible: 2,
            numScroll: 2
        },
        {
            breakpoint: '560px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    constructor(private router: Router) { }

    ngOnInit() {
        this.items = [
            {
                label: 'Home',
                icon: 'pi pi-home',
                command: () => this.scrollToSection('home')
            },
            {
                label: 'Features',
                icon: 'pi pi-star',
                command: () => this.scrollToSection('features')
            },
            {
                label: 'Pricing',
                icon: 'pi pi-tag',
                command: () => this.scrollToSection('pricing')
            },
            {
                label: 'Testimonials',
                icon: 'pi pi-users',
                command: () => this.scrollToSection('testimonials')
            }
        ];
    }

    scrollToSection(sectionId: string) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    navigateToLogin() {
        this.router.navigate(['/auth/login']);
    }
}
