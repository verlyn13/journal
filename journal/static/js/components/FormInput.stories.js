export default {
  title: 'Components/FormInput',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A versatile form input component with built-in validation and accessibility features.',
      },
    },
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'Input name attribute',
    },
    label: {
      control: 'text',
      description: 'Label text for the input',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'date', 'datetime-local'],
      description: 'Input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    value: {
      control: 'text',
      description: 'Initial value',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    helpText: {
      control: 'text',
      description: 'Help text to display below the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
};

const createFormInput = ({ 
  name, 
  label, 
  type = 'text', 
  placeholder = '', 
  required = false, 
  value = '',
  error = '',
  helpText = '',
  disabled = false
}) => {
  const container = document.createElement('div');
  container.className = 'p-4';
  
  const inputId = `input-${name}-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : '';
  const helpId = helpText ? `${inputId}-help` : '';
  
  container.innerHTML = `
    <div class="form-group">
      <label for="${inputId}" class="form-label">
        ${label}
        ${required ? '<span class="text-danger">*</span>' : ''}
      </label>
      <input
        type="${type}"
        id="${inputId}"
        name="${name}"
        class="form-control ${error ? 'is-invalid' : ''}"
        placeholder="${placeholder}"
        value="${value}"
        ${required ? 'required' : ''}
        ${disabled ? 'disabled' : ''}
        ${error ? `aria-invalid="true" aria-describedby="${errorId}"` : ''}
        ${helpText && !error ? `aria-describedby="${helpId}"` : ''}
      />
      ${error ? `<div id="${errorId}" class="invalid-feedback">${error}</div>` : ''}
      ${helpText && !error ? `<small id="${helpId}" class="form-text text-muted">${helpText}</small>` : ''}
    </div>
  `;
  
  return container;
};

export const Default = {
  args: {
    name: 'username',
    label: 'Username',
    type: 'text',
    placeholder: 'Enter your username',
    required: false,
  },
  render: createFormInput,
};

export const Required = {
  args: {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'you@example.com',
    required: true,
    helpText: 'We\'ll never share your email with anyone else.',
  },
  render: createFormInput,
};

export const WithError = {
  args: {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    required: true,
    value: '123',
    error: 'Password must be at least 8 characters long',
  },
  render: createFormInput,
};

export const Disabled = {
  args: {
    name: 'readonly',
    label: 'Read-only Field',
    type: 'text',
    value: 'This field is disabled',
    disabled: true,
  },
  render: createFormInput,
};

export const NumberInput = {
  args: {
    name: 'age',
    label: 'Age',
    type: 'number',
    placeholder: 'Enter your age',
    required: true,
    helpText: 'Must be 18 or older',
  },
  render: createFormInput,
};

export const DateInput = {
  args: {
    name: 'birthdate',
    label: 'Date of Birth',
    type: 'date',
    required: true,
  },
  render: createFormInput,
};

export const TelephoneInput = {
  args: {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: '(555) 123-4567',
    helpText: 'Include area code',
  },
  render: createFormInput,
};

export const URLInput = {
  args: {
    name: 'website',
    label: 'Website',
    type: 'url',
    placeholder: 'https://example.com',
    helpText: 'Must include protocol (http:// or https://)',
  },
  render: createFormInput,
};

export const FormExample = {
  render: () => {
    const container = document.createElement('div');
    container.className = 'p-4';
    container.innerHTML = `
      <form class="max-w-md">
        <h3 class="mb-4">User Registration Form</h3>
        ${createFormInput({
          name: 'firstName',
          label: 'First Name',
          type: 'text',
          placeholder: 'John',
          required: true,
        }).innerHTML}
        ${createFormInput({
          name: 'lastName',
          label: 'Last Name',
          type: 'text',
          placeholder: 'Doe',
          required: true,
        }).innerHTML}
        ${createFormInput({
          name: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'john.doe@example.com',
          required: true,
          helpText: 'We\'ll use this to send you a confirmation',
        }).innerHTML}
        ${createFormInput({
          name: 'password',
          label: 'Password',
          type: 'password',
          placeholder: 'Enter a secure password',
          required: true,
          helpText: 'At least 8 characters with numbers and symbols',
        }).innerHTML}
        ${createFormInput({
          name: 'birthdate',
          label: 'Date of Birth',
          type: 'date',
          required: false,
        }).innerHTML}
        <button type="submit" class="btn btn-primary mt-3">Register</button>
      </form>
    `;
    return container;
  },
};