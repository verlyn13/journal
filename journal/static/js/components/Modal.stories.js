export default {
  title: 'Components/Modal',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'An accessible modal dialog component with multiple sizes and animations.',
      },
    },
  },
  argTypes: {
    id: {
      control: 'text',
      description: 'Unique identifier for the modal',
    },
    title: {
      control: 'text',
      description: 'Modal title',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large', 'full'],
      description: 'Modal size',
    },
    closable: {
      control: 'boolean',
      description: 'Whether the modal can be closed',
    },
    content: {
      control: 'text',
      description: 'Modal body content',
    },
    footer: {
      control: 'text',
      description: 'Modal footer content',
    },
  },
};

const createModal = ({ 
  id = 'modal-1', 
  title = 'Modal Title', 
  size = 'medium', 
  closable = true,
  content = 'Modal content goes here.',
  footer = ''
}) => {
  const container = document.createElement('div');
  container.className = 'p-4';
  
  const sizeClasses = {
    small: 'modal-sm',
    medium: '',
    large: 'modal-lg',
    full: 'modal-xl',
  };
  
  container.innerHTML = `
    <button 
      type="button" 
      class="btn btn-primary" 
      data-bs-toggle="modal" 
      data-bs-target="#${id}"
    >
      Open Modal
    </button>
    
    <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}-label" aria-hidden="true">
      <div class="modal-dialog ${sizeClasses[size]}">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${id}-label">${title}</h5>
            ${closable ? `
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            ` : ''}
          </div>
          <div class="modal-body">
            ${content}
          </div>
          ${footer ? `
            <div class="modal-footer">
              ${footer}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
  
  // Add modal trigger functionality for Storybook
  setTimeout(() => {
    const button = container.querySelector('button');
    const modal = container.querySelector('.modal');
    
    if (button && modal) {
      button.addEventListener('click', () => {
        modal.classList.add('show');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
        
        // Close functionality
        const closeModal = () => {
          modal.classList.remove('show');
          modal.style.display = 'none';
          document.body.classList.remove('modal-open');
          backdrop.remove();
        };
        
        // Close button
        const closeBtn = modal.querySelector('.btn-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', closeModal);
        }
        
        // Close on backdrop click
        if (closable) {
          backdrop.addEventListener('click', closeModal);
        }
        
        // Close on ESC key
        if (closable) {
          const escHandler = (e) => {
            if (e.key === 'Escape') {
              closeModal();
              document.removeEventListener('keydown', escHandler);
            }
          };
          document.addEventListener('keydown', escHandler);
        }
      });
    }
  }, 100);
  
  return container;
};

export const Default = {
  args: {
    id: 'default-modal',
    title: 'Default Modal',
    size: 'medium',
    closable: true,
    content: 'This is a default modal with medium size.',
    footer: '<button class="btn btn-secondary" data-bs-dismiss="modal">Close</button><button class="btn btn-primary">Save changes</button>',
  },
  render: createModal,
};

export const Small = {
  args: {
    id: 'small-modal',
    title: 'Small Modal',
    size: 'small',
    closable: true,
    content: 'This is a small modal dialog.',
    footer: '<button class="btn btn-primary">OK</button>',
  },
  render: createModal,
};

export const Large = {
  args: {
    id: 'large-modal',
    title: 'Large Modal',
    size: 'large',
    closable: true,
    content: `
      <p>This is a large modal with more content.</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <ul>
        <li>Feature 1</li>
        <li>Feature 2</li>
        <li>Feature 3</li>
      </ul>
    `,
    footer: '<button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary">Confirm</button>',
  },
  render: createModal,
};

export const FullScreen = {
  args: {
    id: 'full-modal',
    title: 'Full Screen Modal',
    size: 'full',
    closable: true,
    content: `
      <h3>Full Screen Content</h3>
      <p>This modal takes up the full screen width.</p>
      <div class="row">
        <div class="col-md-6">
          <h4>Column 1</h4>
          <p>Content for the first column.</p>
        </div>
        <div class="col-md-6">
          <h4>Column 2</h4>
          <p>Content for the second column.</p>
        </div>
      </div>
    `,
    footer: '<button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>',
  },
  render: createModal,
};

export const NonClosable = {
  args: {
    id: 'non-closable-modal',
    title: 'Important Action Required',
    size: 'medium',
    closable: false,
    content: `
      <div class="alert alert-warning">
        <strong>Warning!</strong> This action cannot be undone.
      </div>
      <p>You must make a choice to proceed.</p>
    `,
    footer: '<button class="btn btn-danger">Delete</button><button class="btn btn-secondary">Cancel</button>',
  },
  render: createModal,
};

export const FormModal = {
  args: {
    id: 'form-modal',
    title: 'Edit Profile',
    size: 'medium',
    closable: true,
    content: `
      <form>
        <div class="mb-3">
          <label for="modal-name" class="form-label">Name</label>
          <input type="text" class="form-control" id="modal-name" placeholder="Enter your name">
        </div>
        <div class="mb-3">
          <label for="modal-email" class="form-label">Email</label>
          <input type="email" class="form-control" id="modal-email" placeholder="Enter your email">
        </div>
        <div class="mb-3">
          <label for="modal-bio" class="form-label">Bio</label>
          <textarea class="form-control" id="modal-bio" rows="3" placeholder="Tell us about yourself"></textarea>
        </div>
      </form>
    `,
    footer: '<button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary">Save Profile</button>',
  },
  render: createModal,
};

export const ConfirmationModal = {
  args: {
    id: 'confirm-modal',
    title: 'Confirm Deletion',
    size: 'small',
    closable: true,
    content: `
      <p class="mb-0">Are you sure you want to delete this item?</p>
      <p class="text-muted small">This action cannot be undone.</p>
    `,
    footer: '<button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-danger">Delete</button>',
  },
  render: createModal,
};

export const ScrollableContent = {
  args: {
    id: 'scrollable-modal',
    title: 'Terms and Conditions',
    size: 'large',
    closable: true,
    content: `
      <div style="max-height: 400px; overflow-y: auto;">
        <h4>1. Introduction</h4>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        
        <h4>2. Terms of Service</h4>
        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        
        <h4>3. Privacy Policy</h4>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        
        <h4>4. User Responsibilities</h4>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        
        <h4>5. Limitations</h4>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
        
        <h4>6. Contact Information</h4>
        <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.</p>
      </div>
    `,
    footer: '<button class="btn btn-secondary" data-bs-dismiss="modal">Decline</button><button class="btn btn-primary">Accept</button>',
  },
  render: createModal,
};