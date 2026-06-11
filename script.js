// ========== WAIT FOR DOM TO LOAD ==========
document.addEventListener('DOMContentLoaded', function() {
  initFaqAccordion();
  initDatePicker();
  initQuoteForm();
  initMobileMenu();
  initSmoothScrolling();
  initActiveNavHighlight();
});

// ========== FAQ ACCORDION TOGGLE ==========
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionDiv = item.querySelector('.faq-question');
    const icon = questionDiv.querySelector('i');

    questionDiv.addEventListener('click', () => {
      // Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          const otherIcon = otherItem.querySelector('.faq-question i');
          if (otherIcon) {
            otherIcon.classList.remove('fa-chevron-up');
            otherIcon.classList.add('fa-chevron-down');
          }
        }
      });

      // Toggle current item
      item.classList.toggle('active');

      if (icon) {
        if (item.classList.contains('active')) {
          icon.classList.remove('fa-chevron-down');
          icon.classList.add('fa-chevron-up');
        } else {
          icon.classList.remove('fa-chevron-up');
          icon.classList.add('fa-chevron-down');
        }
      }
    });
  });
}

// ========== CALENDAR DATE PICKER INITIALIZATION ==========
function initDatePicker() {
  const dateInput = document.getElementById('serviceDate');

  if (dateInput) {
    flatpickr(dateInput, {
      dateFormat: "Y-m-d",
      altFormat: "F j, Y",
      altInput: true,
      minDate: "today",
      maxDate: new Date().fp_incr(90),
      disableMobile: false,
      placeholder: "Select a date",
      onChange: function(selectedDates, dateStr, instance) {
        console.log("Selected date: " + dateStr);
        // Add a subtle animation
        if (dateStr) {
          dateInput.style.transform = 'scale(1.02)';
          setTimeout(() => {
            dateInput.style.transform = '';
          }, 200);
        }
      },
      onReady: function(selectedDates, dateStr, instance) {
        instance.calendarContainer.classList.add('custom-calendar');
      }
    });
  }
}

// ========== WHATSAPP CONFIGURATION ==========
// CHANGE THIS TO YOUR ACTUAL WHATSAPP NUMBER (South Africa format: 27 followed by 9 digits)
const OWNER_WHATSAPP = "27796499879"; // Replace with your business WhatsApp number

function formatPhoneNumber(phone) {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Remove leading '0' if present (for SA numbers)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '27' + cleaned.substring(1);
  }

  // Remove leading '27' if already there but no '+'
  if (cleaned.startsWith('27') && cleaned.length === 11) {
    cleaned = cleaned;
  }

  // Ensure it starts with '27' for South Africa
  if (!cleaned.startsWith('27') && cleaned.length === 9) {
    cleaned = '27' + cleaned;
  }

  return cleaned;
}

function sendWhatsAppMessage(phoneNumber, message) {
  const formattedNumber = formatPhoneNumber(phoneNumber);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;

  // Open WhatsApp in a new tab/window
  window.open(whatsappUrl, '_blank');

  return true;
}

function sendCustomerConfirmation(customerData) {
  const formattedDate = customerData.date || 'To be confirmed';

  const message = `* SparkClean - Quote Request Confirmation*

Hi ${customerData.name}!

Thank you for choosing SparkClean. We've received your quote request and will respond within 5 hours.

* Your Request Details:*
┌─────────────────────┐
│  Service: ${customerData.service}
│  Date: ${formattedDate}
│  Email: ${customerData.email || 'Not provided'}
└─────────────────────┘

* Next Steps:*
1️⃣ Our agent will review your request
2️⃣ We'll send you a custom quote via WhatsApp
3️⃣ Confirm your booking and enjoy a spotless space!

*Need immediate assistance?*
Reply to this message or call us.

Thank you for trusting SparkClean!

_This is an automated message. Our team will respond shortly._`;

  return sendWhatsAppMessage(customerData.phone, message);
}

function sendOwnerNotification(customerData) {
  const formattedDate = customerData.date || 'Not specified';

  const message = `* NEW CLEANING QUOTE REQUEST*

*━━━━━━━━━━━━━━━━━*
*👤 CUSTOMER DETAILS*
*━━━━━━━━━━━━━━━━━*

Name: ${customerData.name}
Email: ${customerData.email || 'Not provided'}
Phone: ${customerData.phone}

*━━━━━━━━━━━━━━━━━*
*SERVICE DETAILS*
*━━━━━━━━━━━━━━━━━*

Service: ${customerData.service}
Preferred Date: ${formattedDate}

*━━━━━━━━━━━━━━━━━*
* ACTION REQUIRED*
*━━━━━━━━━━━━━━━━━*

Contact customer within 5 hours to provide quote.

*SparkClean Booking System*`;

  return sendWhatsAppMessage(OWNER_WHATSAPP, message);
}

// ========== QUOTE FORM HANDLER ==========
function initQuoteForm() {
  const quoteForm = document.getElementById('quoteForm');
  const submitBtn = document.getElementById('submitBtn');
  const msgDiv = document.getElementById('quoteMessage');

  if (!quoteForm) return;

  quoteForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get form values
    const nameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const serviceSelect = document.getElementById('serviceType');
    const dateInput = document.getElementById('serviceDate');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    let phone = phoneInput ? phoneInput.value.trim() : '';
    const service = serviceSelect ? serviceSelect.value : '';
    let selectedDate = '';

    if (dateInput && dateInput._flatpickr) {
      selectedDate = dateInput._flatpickr.input.value;
    } else if (dateInput) {
      selectedDate = dateInput.value;
    }

    // Validation
    if (!name) {
      showMessage('❌ Please enter your full name', 'error', msgDiv);
      nameInput.focus();
      return;
    }

    if (!phone) {
      showMessage('❌ Please enter your phone number for WhatsApp confirmation', 'error', msgDiv);
      phoneInput.focus();
      return;
    }

    // Clean phone number for validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      showMessage('❌ Please enter a valid phone number (minimum 9 digits)', 'error', msgDiv);
      phoneInput.focus();
      return;
    }

    // Email validation (if provided)
    if (email && !isValidEmail(email)) {
      showMessage('❌ Please enter a valid email address', 'error', msgDiv);
      emailInput.focus();
      return;
    }

    // Show loading state
    showLoading(true, submitBtn);

    // Customer data object
    const customerData = {
      name: name,
      email: email,
      phone: phone,
      service: service,
      date: selectedDate
    };

    try {
      // Send WhatsApp confirmation to customer
      sendCustomerConfirmation(customerData);

      // Small delay to ensure first WhatsApp opens
      await new Promise(resolve => setTimeout(resolve, 800));

      // Send WhatsApp notification to owner
      sendOwnerNotification(customerData);

      // Build success message
      let successMsg = `✓ <strong>Quote Request Sent Successfully!</strong><br><br>`;
      successMsg += `Thank you ${name}! A WhatsApp confirmation has been sent to your phone.<br><br>`;
      successMsg += `<strong> Request Summary:</strong><br>`;
      successMsg += `• Service: ${service}<br>`;
      successMsg += `• Preferred Date: ${selectedDate || 'Not specified'}<br><br>`;
      successMsg += `<strong> What's Next?</strong><br>`;
      successMsg += `We'll contact you via WhatsApp within 5 hours with your custom quote.`;

      showMessage(successMsg, 'success', msgDiv);

      // Reset the form
      quoteForm.reset();

      // Reset the date picker
      if (dateInput && dateInput._flatpickr) {
        dateInput._flatpickr.clear();
      }

      // Scroll to message
      if (msgDiv) {
        msgDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

    } catch (error) {
      console.error('Error:', error);
      showMessage('⚠️ Something went wrong. Please try again or contact us directly via WhatsApp.', 'error', msgDiv);
    } finally {
      showLoading(false, submitBtn);
    }
  });
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Show message helper
function showMessage(message, type, msgDiv) {
  if (!msgDiv) return;

  msgDiv.innerHTML = message;
  msgDiv.className = 'quote-message';

  if (type === 'success') {
    msgDiv.classList.add('success-message');
  } else if (type === 'error') {
    msgDiv.classList.add('error-message');
  } else {
    msgDiv.classList.add('info-message');
  }

  // Auto clear after 10 seconds for success messages
  if (type === 'success') {
    setTimeout(() => {
      if (msgDiv) {
        msgDiv.innerHTML = '';
        msgDiv.className = 'quote-message';
      }
    }, 10000);
  }
}

// Loading state helper
function showLoading(isLoading, submitBtn) {
  if (!submitBtn) return;

  if (isLoading) {
    submitBtn.classList.add('btn-loading');
    submitBtn.innerHTML = '<i class="fas fa-spinner"></i> Sending Request...';
    submitBtn.disabled = true;
  } else {
    submitBtn.classList.remove('btn-loading');
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Request Quote →';
    submitBtn.disabled = false;
  }
}

// ========== SMOOTH SCROLLING FOR ANCHOR LINKS ==========
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');

      if (targetId === "#" || targetId === "") return;

      const targetElem = document.querySelector(targetId);

      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Close mobile menu if open
        const mobileNav = document.getElementById('mobileNav');
        const mobileToggle = document.getElementById('mobileMenuToggle');
        if (mobileNav && mobileNav.classList.contains('active')) {
          mobileNav.classList.remove('active');
          if (mobileToggle) {
            const icon = mobileToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          }
        }
      }
    });
  });
}

// ========== MOBILE MENU TOGGLE ==========
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function() {
      mobileNav.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (mobileNav.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden';
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        document.body.style.overflow = '';
      }
    });

    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileNav.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        document.body.style.overflow = '';
      });
    });
  }
}

// ========== ACTIVE NAVIGATION HIGHLIGHT ==========
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a, .mobile-nav a');

  function updateActiveNavLink() {
    if (!navLinks.length) return;

    let current = '';
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href.substring(1) === current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink);
  window.addEventListener('load', updateActiveNavLink);
}

// ========== ADD SCROLL REVEAL ANIMATIONS ==========
window.addEventListener('scroll', function() {
  const elements = document.querySelectorAll('.service-card, .step, .price-card, .why-item');

  elements.forEach(element => {
    const elementPosition = element.getBoundingClientRect().top;
    const screenPosition = window.innerHeight - 100;

    if (elementPosition < screenPosition) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  });
});

// Set initial styles for scroll reveal
document.addEventListener('DOMContentLoaded', function() {
  const elements = document.querySelectorAll('.service-card, .step, .price-card, .why-item');
  elements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'all 0.6s ease';
  });
});
