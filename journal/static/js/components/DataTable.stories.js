export default {
  title: 'Components/DataTable',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A responsive data table component with sorting, pagination, and search capabilities.',
      },
    },
  },
  argTypes: {
    data: {
      control: 'object',
      description: 'Array of data objects to display',
    },
    columns: {
      control: 'object',
      description: 'Column definitions with key, label, sortable, and type properties',
    },
    pageSize: {
      control: { type: 'number', min: 5, max: 50, step: 5 },
      description: 'Number of items per page',
    },
    searchable: {
      control: 'boolean',
      description: 'Enable search functionality',
    },
  },
};

const createDataTable = ({ data, columns, pageSize = 10, searchable = true }) => {
  const container = document.createElement('div');
  container.className = 'p-4';
  
  container.innerHTML = `
    <div class="data-table-container" x-data="dataTable()">
      ${searchable ? `
        <div class="mb-4">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Search..." 
            x-model="searchTerm"
            @input="search()"
          />
        </div>
      ` : ''}
      
      <table class="table table-striped">
        <thead>
          <tr>
            ${columns.map(col => `
              <th ${col.sortable ? 'class="cursor-pointer" @click="sort(\'' + col.key + '\')"' : ''}>
                ${col.label}
                ${col.sortable ? '<span class="sort-indicator">⇅</span>' : ''}
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.slice(0, pageSize).map(row => `
            <tr>
              ${columns.map(col => `<td>${row[col.key] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="pagination mt-3">
        <button class="btn btn-sm btn-secondary" @click="previousPage()" :disabled="currentPage === 1">
          Previous
        </button>
        <span class="mx-3">Page <span x-text="currentPage"></span> of <span x-text="totalPages"></span></span>
        <button class="btn btn-sm btn-secondary" @click="nextPage()" :disabled="currentPage === totalPages">
          Next
        </button>
      </div>
    </div>
  `;
  
  return container;
};

export const Default = {
  args: {
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active' },
      { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active' },
    ],
    columns: [
      { key: 'id', label: 'ID', sortable: true, type: 'number' },
      { key: 'name', label: 'Name', sortable: true, type: 'string' },
      { key: 'email', label: 'Email', sortable: false, type: 'string' },
      { key: 'role', label: 'Role', sortable: true, type: 'string' },
      { key: 'status', label: 'Status', sortable: true, type: 'string' },
    ],
    pageSize: 10,
    searchable: true,
  },
  render: createDataTable,
};

export const LargeDataset = {
  args: {
    data: Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      department: ['Sales', 'Marketing', 'Engineering', 'HR'][Math.floor(Math.random() * 4)],
      joinDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
      salary: Math.floor(40000 + Math.random() * 80000),
    })),
    columns: [
      { key: 'id', label: 'ID', sortable: true, type: 'number' },
      { key: 'name', label: 'Name', sortable: true, type: 'string' },
      { key: 'email', label: 'Email', sortable: false, type: 'string' },
      { key: 'department', label: 'Department', sortable: true, type: 'string' },
      { key: 'joinDate', label: 'Join Date', sortable: true, type: 'date' },
      { key: 'salary', label: 'Salary', sortable: true, type: 'number' },
    ],
    pageSize: 20,
    searchable: true,
  },
  render: createDataTable,
};

export const NoSearch = {
  args: {
    data: [
      { id: 1, product: 'Laptop', price: 999, stock: 15 },
      { id: 2, product: 'Mouse', price: 29, stock: 50 },
      { id: 3, product: 'Keyboard', price: 79, stock: 30 },
    ],
    columns: [
      { key: 'id', label: 'ID', sortable: false, type: 'number' },
      { key: 'product', label: 'Product', sortable: true, type: 'string' },
      { key: 'price', label: 'Price ($)', sortable: true, type: 'number' },
      { key: 'stock', label: 'Stock', sortable: true, type: 'number' },
    ],
    pageSize: 5,
    searchable: false,
  },
  render: createDataTable,
};

export const EmptyState = {
  args: {
    data: [],
    columns: [
      { key: 'id', label: 'ID', sortable: true, type: 'number' },
      { key: 'name', label: 'Name', sortable: true, type: 'string' },
    ],
    pageSize: 10,
    searchable: true,
  },
  render: ({ columns, searchable }) => {
    const container = document.createElement('div');
    container.className = 'p-4';
    container.innerHTML = `
      <div class="data-table-container">
        ${searchable ? '<div class="mb-4"><input type="text" class="form-control" placeholder="Search..." disabled /></div>' : ''}
        <table class="table table-striped">
          <thead>
            <tr>${columns.map(col => `<th>${col.label}</th>`).join('')}</tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="${columns.length}" class="text-center text-muted py-4">
                No data available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    return container;
  },
};