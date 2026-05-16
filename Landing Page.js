// Landing Page - Interactive JavaScript
(function() {
    'use strict';

    // DOM Elements
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const newsletterForm = document.querySelector('.newsletter-form');
    const statItems = document.getElementById('statItems');
    const statUsers = document.getElementById('statUsers');
    const statMatches = document.getElementById('statMatches');

    // Show Toast Notification
    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #1e293b;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            transform: translateY(150%);
            transition: transform 0.3s ease;
            z-index: 2000;
            font-weight: 500;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
        }, 100);
        setTimeout(() => {
            toast.style.transform = 'translateY(150%)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Navbar Scroll Effect
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    }

    // Scroll to Top
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Animate Stats Counter
    function animateStats() {
        const targets = [
            { element: statItems, target: 10000, suffix: 'K+', divisor: 1000 },
            { element: statUsers, target: 25000, suffix: 'K+', divisor: 1000 },
            { element: statMatches, target: 78, suffix: '%', divisor: 1 }
        ];
        
        targets.forEach(target => {
            if (!target.element) return;
            let current = 0;
            const increment = target.target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target.target) {
                    const displayValue = target.target / target.divisor;
                    target.element.innerText = displayValue + target.suffix;
                    clearInterval(timer);
                } else {
                    const displayValue = Math.floor(current / target.divisor);
                    target.element.innerText = displayValue + target.suffix;
                }
            }, 30);
        });
    }

    // Intersection Observer for Animations
    function initIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.feature-card, .testimonial-card, .step').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }

    // Newsletter Subscription
    function initNewsletter() {
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = newsletterForm.querySelector('input');
                const email = input.value.trim();
                if (email && email.includes('@')) {
                    showToast('✓ Subscribed successfully! Check your inbox.', false);
                    input.value = '';
                } else {
                    showToast('Please enter a valid email address', true);
                }
            });
        }
    }

    // Floating Cards Animation Enhancement
    function addHoverEffect() {
        const cards = document.querySelectorAll('.floating-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.05)';
                card.style.transition = 'all 0.3s ease';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // Mobile Menu
    function initMobileMenu() {
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (closeMenuBtn) {
            closeMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        }
        
        // Close mobile menu when clicking a link
        const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // Smooth Scroll for Anchor Links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Parallax Effect on Hero
    function initParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const heroVisual = document.querySelector('.hero-visual');
            if (heroVisual && scrolled < 600) {
                heroVisual.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
        });
    }

    // Random Testimonial Rotation (Optional)
    function initTestimonialHover() {
        const testimonials = document.querySelectorAll('.testimonial-card');
        testimonials.forEach(testimonial => {
            testimonial.addEventListener('mouseenter', () => {
                testimonial.style.backgroundColor = '#ffffff';
            });
        });
    }

    // Dynamic Year in Footer
    function updateFooterYear() {
        const footerBottom = document.querySelector('.footer-bottom p');
        if (footerBottom) {
            const year = new Date().getFullYear();
            footerBottom.innerHTML = `&copy; ${year} Lost & Found. All rights reserved.`;
        }
    }

    // Preloader (Optional)
    function initPreloader() {
        const preloader = document.createElement('div');
        preloader.className = 'preloader';
        preloader.innerHTML = '<div class="loader"></div>';
        preloader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.5s ease;
        `;
        document.body.appendChild(preloader);
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.remove();
                }, 500);
            }, 500);
        });
    }

    // Welcome Message
    function showWelcome() {
        setTimeout(() => {
            showToast('👋 Welcome to Lost & Found! Help reunite lost items with their owners.', false);
        }, 1500);
    }

    // Initialize All
    function init() {
        window.addEventListener('scroll', handleScroll);
        if (scrollTopBtn) scrollTopBtn.addEventListener('click', scrollToTop);
        animateStats();
        initIntersectionObserver();
        initNewsletter();
        addHoverEffect();
        initMobileMenu();
        initSmoothScroll();
        initParallax();
        initTestimonialHover();
        updateFooterYear();
        showWelcome();
        // initPreloader(); // Uncomment if needed
    }
    
    init();
})();