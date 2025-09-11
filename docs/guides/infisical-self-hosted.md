# Infisical Self-Host Options

This document provides a complete overview of the options, settings, and configurations available when running **Infisical** in a self-hosted environment. It consolidates all available UI actions across secrets, integrations, access control, audit logs, and settings.

---

## 1. Secrets

### Create Secrets
- **Key \*** → `Type your secret name`
- **Value** → Default: `EMPTY` (with key icon for input)
- **Tags** → Dropdown: `Select tags to assign to secret...`
- **Environments** → Dropdown: `Select environments to create secret in...`
- **Buttons**:
  - **Create Secret**
  - **Cancel**

---

## 2. Secret Syncs
- **Button**: `+ Add Sync`
- **Search bar**: `Search secret syncs...`
- **Table Columns**:
  - Name
  - Source
  - Destination
  - Status
- **Status message**: `This project has no syncs configured`

---

## 3. Integrations

### Native Integrations
- **Button**: `+ Add Integration`
- **Search bar**: `Search integrations...`
- **Table Columns**:
  - Integration
  - Source Path
  - Source Environment
  - Destination
  - Status
- **Status message**: `This project has no integrations configured`

---

### Framework Integrations
Available framework setup instructions:
- Django
- Express
- Fiber
- Flask
- Gatsby
- Laravel
- NestJS
- Next.js
- Nuxt
- Rails
- React
- Remix
- SvelteKit
- Vite
- Vue
- CLI
- SDKs

---

### Infrastructure Integrations
Available infrastructure integration options:
- Amazon ECS
- Ansible
- Docker
- Docker Compose
- Infisical Agent
- Jenkins
- Kubernetes
- Terraform

---

## 4. Change Management

### Change Requests
- **Tabs**: Change Requests | Access Requests | Policies
- **Search bar**: `Search change requests by author, environment or policy path...`
- **Filters**:
  - Environments
  - Author
- **Options**:
  - `0 Open`
  - `0 Closed`
- **Status message**: `No Open Change Requests`

---

### Access Requests
- **Button**: `+ Request Access`
- **Search bar**: `Search approval requests by requesting user or environment...`
- **Filters**:
  - Environments
  - Requested By
- **Options**:
  - `0 Pending`
  - `0 Closed`
- **Status message**: `No Pending Access Requests`

---

### Policies
- **Button**: `+ Create Policy`
- **Search bar**: `Search policies by name, type, environment or secret path...`
- **Table Columns**:
  - Name
  - Environment
  - Secret Path
  - Type
- **Status message**: `No Policies Found`

---

## 5. Access Control

### Tabs
- Users
- Groups
- Machine Identities
- Service Tokens
- Project Roles

---

### Users
- **Button**: `+ Add Member`
- **Search bar**: `Search members...`
- **Table Columns**:
  - Name
  - Email
  - Role
- **Example**:
  - Jeffrey Johnson → `jeffreyverlynjohnson@gmail.com` → **Admin**

---

### Groups
- **Button**: `+ Add Group`
- **Search bar**: `Search members...`
- **Table Columns**:
  - Name
  - Role
  - Added On
- **Status message**: `No project groups found`

---

### Machine Identities
- **Button**: `+ Add Identity`
- **Docs link** available
- **Search bar**: `Search identities by name...`
- **Table Columns**:
  - Name
  - Role
  - Added On
- **Status message**: `No identities have been added to this project`

---

### Service Tokens
- **Button**: `+ Create Token`
- **Docs link** available
- **Search bar**: `Search service tokens by name, environment or secret path...`
- **Table Columns**:
  - Name
  - Environment / Secret Path
  - Valid Until
- **Status message**: `No service tokens found`

---

### Project Roles
- **Button**: `+ Add Role`
- **Search bar**: `Search project roles...`
- **Table Columns**:
  - Name
  - Slug
  - Type
- **Default Roles**:
  - **Admin** (slug: `admin`)
  - **Developer** (slug: `member`)
  - **Viewer** (slug: `viewer`)
  - **No Access** (slug: `no-access`)

---

## 6. Audit Logs
- **Section**: Audit History (📖 Docs link)
- **Time Range Options**:
  - 5m
  - 30m
  - 1h
  - 3h
  - 12h
  - Custom (calendar)
- **Dropdown**: Local Timezone
- **Filter icon**
- **Upgrade message (paid feature)**:
  - *Unleash Infisical's Full Power*
  - Buttons:
    - **Upgrade Plan**
    - **Cancel**

---

## 7. Settings

### Tabs
- General
- Secrets Management
- Encryption
- Workflow Integrations
- Webhooks

---

### General
- **Project Overview**
  - Fields: Project name, Project slug, Project description
  - Buttons: Save | Copy Project Slug | Copy Project ID
- **Audit Logs Retention**
  - Input: Number of days
  - Button: Save
- **Delete Protection** (toggle)
- **Danger Zone**
  - Button: `Delete Project`

---

### Secrets Management
- **Environments**
  - Defaults:
    - Development (slug: `dev`)
    - Staging (slug: `staging`)
    - Production (slug: `prod`)
  - Button: `+ Create Environment`
  - Actions: Move | Edit | Copy | Delete
- **Secret Tags**
  - Button: `+ Create Tag`
  - Search bar: `Search tags...`
- **Enforce Capitalization** (toggle)
- **Allow Secret Sharing** (toggle)
- **Show Secret Snapshots (Legacy)** (toggle)
- **Version Retention**
  - Input: Recent versions to keep (default: `10`)
  - Button: Save
- **Index Secret References**
  - Button: `Index Secret References`

---

### Encryption
- **Key Management**
  - Dropdown: `Default Infisical KMS`
  - Button: Save

---

### Workflow Integrations
- **Button**: `+ Add`
- **Status message**: `No project workflow integrations configured`

---

### Webhooks
- **Button**: `+ Create Webhook`
- **Table Columns**:
  - URL
  - Environment
  - Secret Path
  - Status
  - Action
- **Status message**: `No webhooks found`

---

## ✅ Summary

This document covers all **Infisical self-host options** for managing secrets, integrations, access control, auditing, and project-level settings. It is structured by major modules and sub-tabs, providing a clear reference for configuring and operating a self-hosted Infisical instance.

