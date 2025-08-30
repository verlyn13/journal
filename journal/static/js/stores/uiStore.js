/**
 * Global UI Store for Alpine.js
 * Manages application-wide UI state including theme, sidebar, notifications
 */
export default {
  // State
  theme: 'light',
  sidebarOpen: true,
  notifications: [],
  modals: {},
  loading: false,
  searchQuery: '',
  
  // Initialization
  init() {
    // Restore from localStorage
    this.theme = localStorage.getItem('theme') || 'light';
    this.sidebarOpen = localStorage.getItem('sidebarOpen') !== 'false';
    
    // Apply theme immediately
    document.documentElement.dataset.theme = this.theme;
    
    // Watch for theme changes
    this.$watch('theme', val => {
      localStorage.setItem('theme', val);
      document.documentElement.dataset.theme = val;
      this.dispatchThemeChange(val);
    });
    
    // Watch for sidebar changes
    this.$watch('sidebarOpen', val => {
      localStorage.setItem('sidebarOpen', val);
      this.dispatchSidebarChange(val);
    });
    
    // Listen for notifications from HTMX
    document.addEventListener('htmx:afterRequest', (event) => {
      const notification = event.detail.xhr.getResponseHeader('X-Notification');
      if (notification) {
        const data = JSON.parse(notification);
        this.notify(data.message, data.type);
      }
    });
  },
  
  // Theme management
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  },
  
  setTheme(theme) {
    if (['light', 'dark', 'auto'].includes(theme)) {
      this.theme = theme;
    }
  },
  
  // Sidebar management
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  },
  
  setSidebar(open) {
    this.sidebarOpen = Boolean(open);
  },
  
  // Notification management
  notify(message, type = 'info', duration = 5000) {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      timestamp: new Date().toISOString()
    };
    
    this.notifications.push(notification);
    
    // Auto-dismiss if duration is set
    if (duration > 0) {
      setTimeout(() => {
        this.dismissNotification(id);
      }, duration);
    }
    
    // Dispatch custom event
    this.dispatchNotification(notification);
    
    return id;
  },
  
  dismissNotification(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  },
  
  clearNotifications() {
    this.notifications = [];
  },
  
  // Modal management
  openModal(id, data = {}) {
    this.modals[id] = {
      open: true,
      data,
      timestamp: Date.now()
    };
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Dispatch event
    this.dispatchModalOpen(id, data);
  },
  
  closeModal(id) {
    if (this.modals[id]) {
      this.modals[id].open = false;
      
      // Restore body scroll if no other modals
      const hasOpenModals = Object.values(this.modals).some(m => m.open);
      if (!hasOpenModals) {
        document.body.style.overflow = '';
      }
      
      // Dispatch event
      this.dispatchModalClose(id);
      
      // Clean up after animation
      setTimeout(() => {
        delete this.modals[id];
      }, 300);
    }
  },
  
  isModalOpen(id) {
    return this.modals[id]?.open || false;
  },
  
  // Loading state management
  setLoading(loading) {
    this.loading = Boolean(loading);
  },
  
  // Search management
  setSearchQuery(query) {
    this.searchQuery = query;
    this.dispatchSearch(query);
  },
  
  clearSearch() {
    this.searchQuery = '';
    this.dispatchSearch('');
  },
  
  // Event dispatchers
  dispatchThemeChange(theme) {
    window.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme }
    }));
  },
  
  dispatchSidebarChange(open) {
    window.dispatchEvent(new CustomEvent('sidebar-toggled', {
      detail: { open }
    }));
  },
  
  dispatchNotification(notification) {
    window.dispatchEvent(new CustomEvent('notification', {
      detail: notification
    }));
  },
  
  dispatchModalOpen(id, data) {
    window.dispatchEvent(new CustomEvent('modal-opened', {
      detail: { id, data }
    }));
  },
  
  dispatchModalClose(id) {
    window.dispatchEvent(new CustomEvent('modal-closed', {
      detail: { id }
    }));
  },
  
  dispatchSearch(query) {
    window.dispatchEvent(new CustomEvent('search', {
      detail: { query }
    }));
  },
  
  // Utility methods
  formatRelativeTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  }
};