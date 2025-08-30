export default {
  title: 'Components/Notification',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A notification/toast component for displaying messages to users with auto-dismiss functionality.',
      },
    },
  },
  argTypes: {
    message: {
      control: 'text',
      description: 'Notification message',
    },
    type: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description: 'Notification type',
    },
    duration: {
      control: { type: 'number', min: 1000, max: 10000, step: 1000 },
      description: 'Auto-dismiss duration in milliseconds',
    },
    dismissible: {
      control: 'boolean',
      description: 'Whether the notification can be manually dismissed',
    },
    position: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'],
      description: 'Position on screen',
    },
  },
};

const createNotification = ({ 
  message = 'Notification message', 
  type = 'info', 
  duration = 5000, 
  dismissible = true,
  position = 'top-right'
}) => {
  const container = document.createElement('div');
  container.className = 'p-4';
  
  const typeClasses = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-danger',
  };
  
  const typeIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };
  
  const positionStyles = {
    'top-right': 'position: fixed; top: 20px; right: 20px; z-index: 1050;',
    'top-left': 'position: fixed; top: 20px; left: 20px; z-index: 1050;',
    'bottom-right': 'position: fixed; bottom: 20px; right: 20px; z-index: 1050;',
    'bottom-left': 'position: fixed; bottom: 20px; left: 20px; z-index: 1050;',
    'top-center': 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1050;',
    'bottom-center': 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1050;',
  };
  
  const notificationId = `notification-${Math.random().toString(36).substr(2, 9)}`;
  
  container.innerHTML = `
    <button class="btn btn-primary mb-3" id="trigger-${notificationId}">
      Show ${type} Notification
    </button>
    
    <div class="notification-container" id="${notificationId}" style="${positionStyles[position]} display: none;">
      <div class="alert ${typeClasses[type]} alert-dismissible fade show" role="alert" style="min-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div class="d-flex align-items-start">
          <span class="me-2" style="font-size: 1.2em;">${typeIcons[type]}</span>
          <div class="flex-grow-1">
            <strong>${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            <div>${message}</div>
          </div>
          ${dismissible ? `
            <button type="button" class="btn-close" aria-label="Close"></button>
          ` : ''}
        </div>
      </div>
    </div>
    
    <div class="mt-3 p-3 border rounded">
      <h6>Preview Area</h6>
      <p class="text-muted">Click the button above to show the notification. It will appear in the ${position.replace('-', ' ')} of the screen.</p>
    </div>
  `;
  
  // Add notification trigger functionality
  setTimeout(() => {
    const trigger = container.querySelector(`#trigger-${notificationId}`);
    const notification = container.querySelector(`#${notificationId}`);
    const closeBtn = notification?.querySelector('.btn-close');
    
    if (trigger && notification) {
      trigger.addEventListener('click', () => {
        // Show notification
        notification.style.display = 'block';
        
        // Animate in
        setTimeout(() => {
          notification.querySelector('.alert').classList.add('show');
        }, 10);
        
        // Auto dismiss
        if (duration > 0) {
          setTimeout(() => {
            if (notification.style.display !== 'none') {
              hideNotification();
            }
          }, duration);
        }
      });
      
      const hideNotification = () => {
        const alert = notification.querySelector('.alert');
        alert.classList.remove('show');
        setTimeout(() => {
          notification.style.display = 'none';
        }, 150);
      };
      
      if (closeBtn && dismissible) {
        closeBtn.addEventListener('click', hideNotification);
      }
    }
  }, 100);
  
  return container;
};

export const InfoNotification = {
  args: {
    message: 'This is an informational message.',
    type: 'info',
    duration: 5000,
    dismissible: true,
    position: 'top-right',
  },
  render: createNotification,
};

export const SuccessNotification = {
  args: {
    message: 'Your changes have been saved successfully!',
    type: 'success',
    duration: 5000,
    dismissible: true,
    position: 'top-right',
  },
  render: createNotification,
};

export const WarningNotification = {
  args: {
    message: 'Please review your input before submitting.',
    type: 'warning',
    duration: 5000,
    dismissible: true,
    position: 'top-right',
  },
  render: createNotification,
};

export const ErrorNotification = {
  args: {
    message: 'An error occurred while processing your request.',
    type: 'error',
    duration: 5000,
    dismissible: true,
    position: 'top-right',
  },
  render: createNotification,
};

export const NonDismissible = {
  args: {
    message: 'This notification cannot be dismissed manually.',
    type: 'info',
    duration: 3000,
    dismissible: false,
    position: 'top-center',
  },
  render: createNotification,
};

export const PersistentNotification = {
  args: {
    message: 'This notification will not auto-dismiss. Close it manually.',
    type: 'warning',
    duration: 0,
    dismissible: true,
    position: 'bottom-right',
  },
  render: createNotification,
};

export const BottomLeft = {
  args: {
    message: 'Notification in bottom-left corner.',
    type: 'info',
    duration: 5000,
    dismissible: true,
    position: 'bottom-left',
  },
  render: createNotification,
};

export const TopCenter = {
  args: {
    message: 'Centered notification at the top.',
    type: 'success',
    duration: 5000,
    dismissible: true,
    position: 'top-center',
  },
  render: createNotification,
};

export const LongMessage = {
  args: {
    message: 'This is a longer notification message that contains more detailed information about what happened and what the user should do next.',
    type: 'info',
    duration: 8000,
    dismissible: true,
    position: 'top-right',
  },
  render: createNotification,
};

export const MultipleNotifications = {
  render: () => {
    const container = document.createElement('div');
    container.className = 'p-4';
    
    const notifications = [
      { type: 'success', message: 'File uploaded successfully!' },
      { type: 'info', message: 'Processing your request...' },
      { type: 'warning', message: 'Low disk space warning' },
      { type: 'error', message: 'Failed to save changes' },
    ];
    
    container.innerHTML = `
      <h5>Click buttons to show multiple notifications</h5>
      <div class="btn-group mb-3" role="group">
        ${notifications.map((n, i) => `
          <button class="btn btn-outline-primary" id="trigger-multi-${i}">
            Show ${n.type}
          </button>
        `).join('')}
      </div>
      
      <div id="notification-stack" style="position: fixed; top: 20px; right: 20px; z-index: 1050;">
        ${notifications.map((n, i) => {
          const typeClasses = {
            info: 'alert-info',
            success: 'alert-success',
            warning: 'alert-warning',
            error: 'alert-danger',
          };
          
          const typeIcons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
          };
          
          return `
            <div class="alert ${typeClasses[n.type]} alert-dismissible fade" 
                 id="notification-multi-${i}" 
                 role="alert" 
                 style="min-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 10px; display: none;">
              <div class="d-flex align-items-start">
                <span class="me-2" style="font-size: 1.2em;">${typeIcons[n.type]}</span>
                <div class="flex-grow-1">
                  <strong>${n.type.charAt(0).toUpperCase() + n.type.slice(1)}</strong>
                  <div>${n.message}</div>
                </div>
                <button type="button" class="btn-close" aria-label="Close"></button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <div class="p-3 border rounded">
        <h6>Preview Area</h6>
        <p class="text-muted">Click the buttons to show multiple notifications stacked.</p>
      </div>
    `;
    
    // Add functionality
    setTimeout(() => {
      notifications.forEach((n, i) => {
        const trigger = container.querySelector(`#trigger-multi-${i}`);
        const notification = container.querySelector(`#notification-multi-${i}`);
        const closeBtn = notification?.querySelector('.btn-close');
        
        if (trigger && notification) {
          trigger.addEventListener('click', () => {
            notification.style.display = 'block';
            setTimeout(() => {
              notification.classList.add('show');
            }, 10);
            
            // Auto dismiss after 5 seconds
            setTimeout(() => {
              notification.classList.remove('show');
              setTimeout(() => {
                notification.style.display = 'none';
              }, 150);
            }, 5000);
          });
          
          if (closeBtn) {
            closeBtn.addEventListener('click', () => {
              notification.classList.remove('show');
              setTimeout(() => {
                notification.style.display = 'none';
              }, 150);
            });
          }
        }
      });
    }, 100);
    
    return container;
  },
};