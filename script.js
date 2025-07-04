// ===== UTILITY FUNCTIONS =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Debounce function for performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ===== DOM ELEMENTS =====
const navbar = $('#navbar');
const navToggle = $('#nav-toggle');
const navMenu = $('#nav-menu');
const navLinks = $$('.nav-link');
const scrollTopBtn = $('#scroll-top');
const typingText = $('#typing-text');
const contactForm = $('#contact-form');

// ===== NAVIGATION FUNCTIONALITY =====
class Navigation {
    constructor() {
        this.init();
    }

    init() {
        this.handleScroll();
        this.handleMobileMenu();
        this.handleActiveLinks();
        this.handleSmoothScrolling();
    }

    handleScroll() {
        const scrollHandler = debounce(() => {
            const scrollY = window.scrollY;
            
            // Navbar scroll effect
            if (scrollY > 100) {
                navbar.classList.add('scrolled');
                scrollTopBtn.classList.add('visible');
            } else {
                navbar.classList.remove('scrolled');
                scrollTopBtn.classList.remove('visible');
            }

            // Update active navigation link
            this.updateActiveLink();
        }, 10);

        window.addEventListener('scroll', scrollHandler);
    }

    handleMobileMenu() {
        navToggle.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            
            // Update icon
            icon.classList.toggle('fa-bars', !isActive);
            icon.classList.toggle('fa-times', isActive);
            
            // Update ARIA attributes
            navToggle.setAttribute('aria-expanded', isActive);
        });

        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    updateActiveLink() {
        let current = '';
        const sections = $$('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    handleActiveLinks() {
        window.addEventListener('scroll', debounce(() => {
            this.updateActiveLink();
        }, 10));
    }

    handleSmoothScrolling() {
        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = $(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// ===== SCROLL TO TOP FUNCTIONALITY =====
class ScrollToTop {
    constructor() {
        this.init();
    }

    init() {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Keyboard support
        scrollTopBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// ===== TYPING ANIMATION =====
class TypingAnimation {
    constructor(element, texts) {
        this.element = element;
        this.texts = texts;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.init();
    }

    init() {
        setTimeout(() => this.type(), 1000);
    }

    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let typeSpeed = this.isDeleting ? 50 : 100;

        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
class AnimationObserver {
    constructor() {
        this.init();
    }

    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all animation elements
        $$('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            this.observer.observe(el);
        });

        this.setupSpecialObservers();
    }

    setupSpecialObservers() {
        const aboutSection = $('#about');
        const skillsSection = $('#skills');

        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounters();
                    aboutObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSkillBars();
                    skillsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        if (aboutSection) aboutObserver.observe(aboutSection);
        if (skillsSection) skillsObserver.observe(skillsSection);
    }

    animateCounters() {
        const counters = $$('.stat-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const increment = target / 100;
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        });
    }

    animateSkillBars() {
        const skillBars = $$('.skill-progress');
        
        skillBars.forEach((bar, index) => {
            const width = bar.getAttribute('data-width');
            setTimeout(() => {
                bar.style.width = width + '%';
            }, index * 100);
        });
    }
}

// ===== CONTACT FORM FUNCTIONALITY =====
class ContactForm {
    constructor() {
        this.form = contactForm;
        this.submitBtn = $('#submit-btn');
        this.submitText = $('#submit-text');
        this.submitLoading = $('#submit-loading');
        this.formSuccess = $('#form-success');
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupRealTimeValidation();
    }

    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        this.showLoading();
        
        // Simulate form submission (replace with actual form handling)
        setTimeout(() => {
            this.hideLoading();
            this.showSuccess();
            this.form.reset();
            
            setTimeout(() => {
                this.hideSuccess();
            }, 5000);
        }, 2000);
    }

    validateForm() {
        let isValid = true;
        const fields = ['name', 'email', 'subject', 'message'];
        
        fields.forEach(field => {
            const input = $(`#${field}`);
            const error = $(`#${field}-error`);
            
            if (!input.value.trim()) {
                this.showError(error, 'This field is required');
                isValid = false;
            } else if (field === 'email' && !this.isValidEmail(input.value)) {
                this.showError(error, 'Please enter a valid email address');
                isValid = false;
            } else {
                this.clearError(error);
            }
        });
        
        return isValid;
    }

    setupRealTimeValidation() {
        ['name', 'email', 'subject', 'message'].forEach(field => {
            const input = $(`#${field}`);
            const error = $(`#${field}-error`);
            
            input.addEventListener('blur', () => {
                if (!input.value.trim()) {
                    this.showError(error, 'This field is required');
                } else if (field === 'email' && !this.isValidEmail(input.value)) {
                    this.showError(error, 'Please enter a valid email address');
                } else {
                    this.clearError(error);
                }
            });
            
            input.addEventListener('input', () => {
                if (error.textContent && input.value.trim()) {
                    this.clearError(error);
                }
            });
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearError(errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }

    showLoading() {
        this.submitText.style.display = 'none';
        this.submitLoading.style.display = 'flex';
        this.submitBtn.disabled = true;
    }

    hideLoading() {
        this.submitText.style.display = 'flex';
        this.submitLoading.style.display = 'none';
        this.submitBtn.disabled = false;
    }

    showSuccess() {
        this.formSuccess.style.display = 'block';
        this.formSuccess.focus();
    }

    hideSuccess() {
        this.formSuccess.style.display = 'none';
    }
}

// ===== ENHANCED INTERACTIONS =====
class EnhancedInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupCardHoverEffects();
        this.setupSkillItemInteractions();
        this.setupKeyboardNavigation();
    }

    setupCardHoverEffects() {
        $$('.card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupSkillItemInteractions() {
        $$('.skill-item').forEach(skillItem => {
            const progressBar = skillItem.querySelector('.skill-progress');
            const percentage = skillItem.querySelector('.skill-percentage');
            
            skillItem.addEventListener('mouseenter', () => {
                if (progressBar) {
                    progressBar.style.transform = 'scaleY(1.1)';
                    progressBar.style.boxShadow = '0 4px 20px rgba(37, 99, 235, 0.3)';
                }
                if (percentage) {
                    percentage.style.transform = 'scale(1.05)';
                    percentage.style.color = 'var(--color-purple)';
                }
                skillItem.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
            });
            
            skillItem.addEventListener('mouseleave', () => {
                if (progressBar) {
                    progressBar.style.transform = 'scaleY(1)';
                    progressBar.style.boxShadow = 'none';
                }
                if (percentage) {
                    percentage.style.transform = 'scale(1)';
                    percentage.style.color = 'var(--color-accent)';
                }
                skillItem.style.background = 'var(--color-white)';
            });
        });
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation for interactive elements
        $$('button, a, input, textarea').forEach(element => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
                        // Let the default behavior handle it, but ensure it's accessible
                        element.style.outline = '2px solid var(--color-accent)';
                        setTimeout(() => {
                            element.style.outline = '';
                        }, 200);
                    }
                }
            });
        });
    }
}

// ===== PERFORMANCE OPTIMIZATIONS =====
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.setupReducedMotion();
        this.setupLazyLoading();
    }

    setupReducedMotion() {
        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            $$('*').forEach(element => {
                element.style.animationDuration = '0.01ms';
                element.style.animationIterationCount = '1';
                element.style.transitionDuration = '0.01ms';
            });
        }
    }

    setupLazyLoading() {
        // Lazy load non-critical animations
        const lazyElements = $$('.timeline-item, .skill-item');
        
        if ('IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('loaded');
                        lazyObserver.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '50px' });

            lazyElements.forEach(element => {
                lazyObserver.observe(element);
            });
        }
    }
}

// ===== INITIALIZATION =====
class App {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        // Initialize all components
        new Navigation();
        new ScrollToTop();
        new AnimationObserver();
        new ContactForm();
        new EnhancedInteractions();
        new PerformanceOptimizer();

        // Initialize typing animation
        if (typingText) {
            const texts = [
                'Senior Information Analyst & Data Analytics Expert',
                'UN Certified Professional',
                'PMP Certified Project Manager',
                'AI & Technology Integration Specialist',
                'Strategic Planning Expert'
            ];
            new TypingAnimation(typingText, texts);
        }

        // Add loaded class to body for CSS transitions
        document.body.classList.add('loaded');
    }
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// ===== START APPLICATION =====
new App();

