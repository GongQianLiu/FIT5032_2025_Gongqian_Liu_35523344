// Accessibility utilities for WCAG 2.1 AA compliance
// Implements BR E.3: Accessibility requirements

export default {
  // Keyboard navigation support
  keyboardNavigation: {
    // Handle keyboard navigation for lists and grids
    handleKeyNavigation(event, items, currentIndex, onSelect) {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          onSelect(nextIndex);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          onSelect(prevIndex);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect(currentIndex);
          break;
        case 'Home':
          event.preventDefault();
          onSelect(0);
          break;
        case 'End':
          event.preventDefault();
          onSelect(items.length - 1);
          break;
      }
    },

    // Focus management
    focusFirstElement(container) {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    },

    // Trap focus within modal
    trapFocus(modalElement) {
      const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      modalElement.addEventListener('keydown', handleTabKey);
      
      // Return cleanup function
      return () => {
        modalElement.removeEventListener('keydown', handleTabKey);
      };
    }
  },

  // Screen reader support
  screenReader: {
    // Announce changes to screen readers
    announce(message, priority = 'polite') {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', priority);
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      
      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    },

    // Create screen reader only text
    srOnly(text) {
      return `<span class="sr-only">${text}</span>`;
    },

    // Generate descriptive text for icons
    getIconDescription(iconName, context = '') {
      const descriptions = {
        'home': 'Go to home page',
        'search': 'Search',
        'close': 'Close',
        'menu': 'Open menu',
        'edit': 'Edit',
        'delete': 'Delete',
        'save': 'Save',
        'cancel': 'Cancel',
        'add': 'Add new item',
        'remove': 'Remove item',
        'download': 'Download',
        'upload': 'Upload',
        'print': 'Print',
        'email': 'Send email',
        'phone': 'Call phone number',
        'location': 'View location',
        'calendar': 'View calendar',
        'user': 'User profile',
        'settings': 'Settings',
        'help': 'Help'
      };
      
      const baseDescription = descriptions[iconName] || iconName;
      return context ? `${baseDescription} ${context}` : baseDescription;
    }
  },

  // Color contrast utilities
  colorContrast: {
    // Calculate relative luminance
    getRelativeLuminance(r, g, b) {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    },

    // Calculate contrast ratio
    getContrastRatio(l1, l2) {
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    },

    // Check if contrast meets AA standards
    meetsAAContrast(contrastRatio, isLargeText = false) {
      return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
    }
  },

  // Form accessibility
  formAccessibility: {
    // Generate proper labels and descriptions
    generateLabel(id, text, required = false) {
      return `<label for="${id}" class="form-label">
        ${text}${required ? ' <span class="text-danger" aria-label="required">*</span>' : ''}
      </label>`;
    },

    // Generate error messages
    generateErrorMessage(id, message) {
      return `<div id="${id}-error" class="invalid-feedback" role="alert" aria-live="polite">
        ${message}
      </div>`;
    },

    // Generate help text
    generateHelpText(id, text) {
      return `<div id="${id}-help" class="form-text">
        ${text}
      </div>`;
    },

    // Validate form accessibility
    validateFormAccessibility(form) {
      const issues = [];
      
      // Check for labels
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (!input.labels || input.labels.length === 0) {
          if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
            issues.push(`Input ${input.name || input.id} missing label`);
          }
        }
      });

      // Check for error handling
      const requiredInputs = form.querySelectorAll('[required]');
      requiredInputs.forEach(input => {
        const errorElement = document.getElementById(`${input.id}-error`);
        if (!errorElement) {
          issues.push(`Required input ${input.id} missing error message`);
        }
      });

      return issues;
    }
  },

  // Image accessibility
  imageAccessibility: {
    // Generate alt text for different image types
    generateAltText(imageType, context = '') {
      const altTexts = {
        'logo': 'Company logo',
        'avatar': 'User profile picture',
        'icon': 'Icon',
        'chart': 'Data visualization chart',
        'photo': 'Photograph',
        'illustration': 'Illustration',
        'decorative': '' // Empty alt for decorative images
      };
      
      const baseAlt = altTexts[imageType] || 'Image';
      return context ? `${baseAlt} - ${context}` : baseAlt;
    },

    // Check if image has proper alt text
    validateImageAccessibility(images) {
      const issues = [];
      
      images.forEach(img => {
        if (!img.alt && !img.getAttribute('aria-label')) {
          issues.push(`Image ${img.src} missing alt text`);
        }
      });
      
      return issues;
    }
  },

  // Skip links
  skipLinks: {
    // Generate skip link
    generateSkipLink(targetId, text = 'Skip to main content') {
      return `<a href="#${targetId}" class="skip-link">
        ${text}
      </a>`;
    },

    // Add skip links to page
    addSkipLinks() {
      const skipLinks = [
        { target: 'main-content', text: 'Skip to main content' },
        { target: 'navigation', text: 'Skip to navigation' },
        { target: 'search', text: 'Skip to search' }
      ];

      const skipContainer = document.createElement('div');
      skipContainer.className = 'skip-links-container';
      
      skipLinks.forEach(link => {
        const skipLink = document.createElement('a');
        skipLink.href = `#${link.target}`;
        skipLink.className = 'skip-link';
        skipLink.textContent = link.text;
        skipContainer.appendChild(skipLink);
      });

      document.body.insertBefore(skipContainer, document.body.firstChild);
    }
  },

  // ARIA utilities
  aria: {
    // Set ARIA attributes
    setAttributes(element, attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    },

    // Generate ARIA labels
    generateAriaLabel(text, context = '') {
      return context ? `${text} ${context}` : text;
    },

    // Handle ARIA expanded state
    toggleExpanded(element, isExpanded) {
      element.setAttribute('aria-expanded', isExpanded.toString());
    },

    // Handle ARIA selected state
    setSelected(element, isSelected) {
      element.setAttribute('aria-selected', isSelected.toString());
    },

    // Handle ARIA checked state
    setChecked(element, isChecked) {
      element.setAttribute('aria-checked', isChecked.toString());
    }
  },

  // Focus indicators
  focusIndicators: {
    // Add visible focus indicators
    addFocusIndicators() {
      const style = document.createElement('style');
      style.textContent = `
        *:focus {
          outline: 2px solid #007bff !important;
          outline-offset: 2px !important;
        }
        
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #007bff;
          color: white;
          padding: 8px;
          text-decoration: none;
          border-radius: 4px;
          z-index: 1000;
        }
        
        .skip-link:focus {
          top: 6px;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `;
      document.head.appendChild(style);
    }
  }
};
