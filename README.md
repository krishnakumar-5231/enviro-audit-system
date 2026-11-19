# Centralized Environmental Audit Management System (CEAMS)

An enterprise-grade web application for managing industrial environmental compliance, digital audit lifecycles, non-conformance findings, Corrective and Preventive Actions (CAPA), and statutory compliance reporting.

---

## 🚀 Key Features

- **Environmental Compliance Dashboard**: Real-time KPI statistics, compliance scoring, audit distributions, and upcoming inspection schedules.
- **Site Management**: Register and manage industrial sites, facilities, and environmental profiles.
- **Audit Scheduling & Execution**: Plan, assign, conduct, and close statutory environmental audits.
- **Digital Inspection Workflows**: Category-based compliance checklists, scoring frameworks, question verification, and evidence upload.
- **Findings & Non-Conformance Tracking**: Severity classification, root-cause tracking, and automated status pipelines.
- **CAPA Lifecycle Management**: Corrective & Preventive Action workflows with verification and closure approvals.
- **Statutory Reporting**: Generate formal compliance audit summary reports and PDF export integration.
- **Audit Trail & System Security**: Full immutable activity audit logging and role-based access control (RBAC).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6, Axios
- **Backend**: Node.js, Express, Mongoose, JWT Authentication, Multer, PDFKit
- **Database**: MongoDB (with automatic embedded `mongodb-memory-server` fallback for zero-config development)

---

## 📦 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)

### 2. Installation

Install dependencies:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 3. Running the Application

Start both backend and frontend with a single command:

```bash
npm start
```

Or double-click `run.bat` on Windows.

- **Frontend**: [http://localhost:5173](http://localhost:5173) (opens automatically)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 👥 Demo Accounts

The database comes pre-seeded with realistic industrial data and demo accounts (Password: `password123` for all):

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `password123` | Full system access & config |
| **Environmental Auditor** | `auditor@example.com` | `password123` | Audit execution & findings |
| **Site Manager** | `manager@example.com` | `password123` | Site oversight & CAPA resolution |
| **Compliance Officer** | `compliance@example.com` | `password123` | Audit verification & reporting |

---

## 📄 License

MIT
