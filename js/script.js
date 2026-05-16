/*===================================
  EURO TRANSPORT UAE - JAVASCRIPT
  Form Validation, Security & Interactivity
===================================*/

// ===== CONFIGURATION =====
const CONFIG = {
  rateLimit: {
    maxSubmissions: 3,
    timeWindow: 3600000, // 1 hour
  },
  validation: {
    nameMinLength: 2,
    nameMaxLength: 50,
    phoneRegex: /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

// ===== SECURITY & SANITIZATION =====
class SecurityUtil {
  // Sanitize input to prevent XSS
  static sanitizeInput(input) {
    const textarea = document.createElement('textarea');
    textarea.textContent = input;
    return textarea.innerHTML;
  }

  // Validate email format
  static isValidEmail(email) {
    return CONFIG.validation.emailRegex.test(email.trim());
  }

  // Validate phone number
  static isValidPhone(phone) {
    return CONFIG.validation.phoneRegex.test(phone.trim());
  }

  // Validate name
  static isValidName(name) {
    const trimmed = name.trim();
    return (
      trimmed.length >= CONFIG.validation.nameMinLength &&
      trimmed.length <= CONFIG.validation.nameMaxLength &&
      /^[a-zA-Z\s'-]+$/.test(trimmed)
    );
  }

  // Check rate limiting
  static checkRateLimit(storageKey = 'formSubmissions') {
    const now = Date.now();
    let submissions = JSON.parse(localStorage.getItem(storageKey) || '[]');

    // Filter out old submissions
    submissions = submissions.filter(
      (timestamp) => now - timestamp < CONFIG.rateLimit.timeWindow
    );

    if (submissions.length >= CONFIG.rateLimit.maxSubmissions) {
      return false;
    }

    submissions.push(now);
    localStorage.setItem(storageKey, JSON.stringify(submissions));
    return true;
  }

  // CSRF token generation (pseudo)
  static generateCSRFToken() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
  }
}

// ===== FORM VALIDATION =====
class FormValidator {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    if (!this.form) return;
    this.fields = this.form.querySelectorAll('[name]');
    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.form.addEventListener('input', (e) => this.handleInput(e));
  }

  handleInput(event) {
    const field = event.target;
    if (field.value.trim() !== '') {
      this.clearError(field);
    }
  }

  validateField(field) {
    const value = field.value.trim();
    const name = field.name;

    // Remove existing error
    this.clearError(field);

    // Empty check
    if (!value) {
      this.setError(field, 'This field is required');
      return false;
    }

    // Field-specific validation
    switch (name) {
      case 'name':
        if (!SecurityUtil.isValidName(value)) {
          this.setError(
            field,
            'Name must be 2-50 characters and contain only letters, spaces, and hyphens'
          );
          return false;
        }
        break;

      case 'email':
        if (!SecurityUtil.isValidEmail(value)) {
          this.setError(field, 'Please enter a valid email address');
          return false;
        }
        break;

      case 'phone':
        if (!SecurityUtil.isValidPhone(value)) {
          this.setError(field, 'Please enter a valid phone number');
          return false;
        }
        break;

      case 'message':
        if (value.length < 10) {
          this.setError(field, 'Message must be at least 10 characters');
          return false;
        }
        if (value.length > 5000) {
          this.setError(field, 'Message cannot exceed 5000 characters');
          return false;
        }
        break;

      case 'service':
        if (!value) {
          this.setError(field, 'Please select a service');
          return false;
        }
        break;
    }

    return true;
  }

  validateForm() {
    let isValid = true;
    this.fields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    return isValid;
  }

  setError(field, message) {
    const group = field.closest('.form-group');
    if (!group) return;

    group.classList.add('error');
    let errorElement = group.querySelector('.form-error');

    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'form-error';
      group.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  clearError(field) {
    const group = field.closest('.form-group');
    if (!group) return;

    group.classList.remove('error');
    const errorElement = group.querySelector('.form-error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    // Check rate limiting
    if (!SecurityUtil.checkRateLimit()) {
      this.showMessage(
        'form-success',
        'Too many submissions. Please try again later.',
        'error'
      );
      return;
    }

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    // Collect form data
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    // Sanitize inputs
    Object.keys(data).forEach((key) => {
      data[key] = SecurityUtil.sanitizeInput(data[key]);
    });

    // Add CSRF token (pseudo)
    data.csrf_token = SecurityUtil.generateCSRFToken();

    // Disable submit button
    const submitBtn = this.form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      // Simulate form submission (in production, send to backend)
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(data),
      // });

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success message
      this.showMessage('form-success', 'Message sent successfully! We will contact you soon.', 'success');

      // Reset form
      this.form.reset();

      // Clear errors
      this.fields.forEach((field) => this.clearError(field));
    } catch (error) {
      console.error('Form submission error:', error);
      this.showMessage(
        'form-success',
        'An error occurred. Please try again later.',
        'error'
      );
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  showMessage(elementClass, message, type = 'success') {
    let messageElement = document.querySelector(`.${elementClass}`);

    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.className = elementClass;
      this.form.insertBefore(messageElement, this.form.firstChild);
    }

    messageElement.textContent = message;
    messageElement.style.display = 'block';

    // Color coding
    if (type === 'error') {
      messageElement.style.backgroundColor = '#f8d7da';
      messageElement.style.color = '#721c24';
      messageElement.style.borderColor = '#f5c6cb';
    } else {
      messageElement.style.backgroundColor = '#d4edda';
      messageElement.style.color = '#155724';
      messageElement.style.borderColor = '#c3e6cb';
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
  }
}

// ===== NAVIGATION =====
class Navigation {
  constructor() {
    this.hamburger = document.querySelector('.hamburger');
    this.navMenu = document.querySelector('.nav-menu');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.navCta = document.querySelector('.nav-cta');
    this.init();
  }

  init() {
    if (this.hamburger) {
      this.hamburger.addEventListener('click', () => this.toggleMenu());
    }

    this.navLinks.forEach((link) => {
      link.addEventListener('click', () => this.handleNavClick(link));
    });

    // Close menu on link click
    this.navLinks.forEach((link) => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Handle CTA button click
    if (this.navCta) {
      this.navCta.addEventListener('click', (e) => {
        const href = this.navCta.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          this.closeMenu();
          this.smoothScroll(href);
        } else {
          this.closeMenu();
        }
      });
    }

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar-container')) {
        this.closeMenu();
      }
    });

    // Highlight active section on scroll
    window.addEventListener('scroll', () => this.updateActiveLink());
  }

  toggleMenu() {
    this.hamburger.classList.toggle('active');
    this.navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open', this.navMenu.classList.contains('active'));
  }

  closeMenu() {
    this.hamburger.classList.remove('active');
    this.navMenu.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  handleNavClick(link) {
    // Remove active class from all links
    this.navLinks.forEach((l) => l.classList.remove('active'));

    // Add active class to clicked link
    link.classList.add('active');

    // Get href and scroll
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      this.smoothScroll(href);
    }
  }

  smoothScroll(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  updateActiveLink() {
    let activeId = '';
    const sections = document.querySelectorAll('section[id]');

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (window.scrollY >= sectionTop - 200) {
        activeId = section.getAttribute('id');
      }
    });

    this.navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${activeId}`) {
        link.classList.add('active');
      }
    });
  }
}

// ===== SCROLL TO TOP BUTTON =====
class ScrollToTop {
  constructor() {
    this.button = document.querySelector('.scroll-to-top');
    if (!this.button) return;
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.toggleButton());
    this.button.addEventListener('click', () => this.scrollToTop());
  }

  toggleButton() {
    if (window.scrollY > 300) {
      this.button.classList.add('show');
    } else {
      this.button.classList.remove('show');
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}

// ===== PAGE ANIMATIONS =====
class PageAnimations {
  constructor() {
    this.observedElements = [];
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );
    this.init();
  }

  init() {
    // Observe cards, features, and other elements
    document
      .querySelectorAll(
        '.service-card, .testimonial-card, .feature-item, .fleet-card, .why-card, .process-step'
      )
      .forEach((el, i) => {
        el.style.animationDelay = `${(i % 4) * 0.08}s`;
        this.observer.observe(el);
      });
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.65s ease forwards';
        this.observer.unobserve(entry.target);
      }
    });
  }
}

// ===== INITIALIZATION =====
// ===== FAQ ACCORDION =====
class FaqAccordion {
  constructor() {
    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach((el) => el.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }
}

// ===== NAVBAR SCROLL STATE =====
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();

  // Initialize navigation
  new Navigation();

  // Initialize scroll to top
  new ScrollToTop();

  // Initialize page animations
  new PageAnimations();

  // FAQ on contact page
  if (document.querySelector('.faq-item')) {
    new FaqAccordion();
  }

  // Initialize form validator if form exists
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    new FormValidator('#contact-form');
  }

  // Add smooth scroll behavior for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});

// ===== UTILITY: DEBOUNCE =====
function debounce(func, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => func.apply(this, args), delay);
  };
}

// ===== PERFORMANCE OPTIMIZATION =====
// Lazy load images
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SecurityUtil, FormValidator, Navigation, ScrollToTop, PageAnimations };
}
