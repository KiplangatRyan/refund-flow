import JSZip from 'jszip';

export async function generateRepoZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file('.gitignore', `# Dependencies
node_modules
.pnp
.pnp.js

# Production build
dist
dist-ssr
*.local

# Environment
.env
.env.production

# Editor & OS
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`);

  zip.file('.env.example', `# Environment Variables
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
`);

  zip.file('package.json', JSON.stringify({
    name: "refund-flow",
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc && vite build",
      preview: "vite preview",
      lint: "tsc --noEmit"
    },
    dependencies: {
      "@tailwindcss/vite": "^4.3.3",
      "@vitejs/plugin-react": "^6.1.1",
      "canvas-confetti": "^1.9.4",
      "firebase": "^11.0.0",
      "jszip": "^3.10.1",
      "lucide-react": "^0.546.0",
      "motion": "^12.23.24",
      "react": "^19.0.1",
      "react-dom": "^19.0.1",
      "tailwindcss": "^4.3.3",
      "vite": "^8.3.0"
    },
    devDependencies: {
      "@types/canvas-confetti": "^1.9.0",
      "@types/jszip": "^3.4.1",
      "@types/node": "^22.14.0",
      "@types/react": "^19.3.0",
      "@types/react-dom": "^19.3.0",
      "typescript": "^7.0.2"
    }
  }, null, 2));

  zip.file('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      experimentalDecorators: true,
      useDefineForClassFields: false,
      module: "ESNext",
      types: ["vite/client"],
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      skipLibCheck: true,
      moduleResolution: "bundler",
      isolatedModules: true,
      moduleDetection: "force",
      allowJs: true,
      jsx: "react-jsx",
      paths: {
        "@/*": ["./*"]
      },
      allowImportingTsExtensions: true,
      noEmit: true
    },
    exclude: ["dist"]
  }, null, 2));

  zip.file('vite.config.ts', `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
  },
});
`);

  zip.file('index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RefundFlow - Autonomous Refund & Dispute Resolution Engine</title>
    <meta name="description" content="Modern e-commerce and fintech refund management platform with automated policy rules, dispute handling, instant store credit incentives, and GitHub deployment integration." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

  // GitHub workflows & templates
  zip.file('.github/workflows/ci.yml', `name: CI / Build & Validate

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci || npm install
      - name: Typecheck
        run: npx tsc --noEmit
      - name: Build production bundle
        run: npm run build
`);

  zip.file('README.md', `# RefundFlow ⚡ Autonomous Refund & Dispute Resolution Engine

[![CI](https://github.com/USER/refund-flow/actions/workflows/ci.yml/badge.svg)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

RefundFlow is a production-grade refund, return, and dispute orchestration platform designed for high-volume modern e-commerce and fintech operators.

---

## 🚀 Key Features

- **Customer Self-Service Return Portal**:
  - Interactive order lookup (#ORD-84920, #ORD-91042, etc.)
  - Line-item return selection & reason attribution
  - Instant Store Credit incentive (+10% cash equivalent bonus)
  - Frictionless return methods (Digital QR Return slips, Home courier pickup, or Keep-The-Item eco waiver)
- **Finance Operations & Merchant Hub**:
  - Live refund queue with multi-status filtering (Needs Review, Auto-Approved, In Transit, Dispute, Settled)
  - Customer lifetime value (LTV) & fraud risk scoring
  - Interactive **Refund Calculator** with restock fee slider, pro-rated tax refund, and shipping adjustments
  - Quick decision controls: Approve, Partial Refund, Store Credit + Bonus, Clarification Request, or Decline
- **Automated Policy Rules Engine**:
  - Instant Micro-Refund Auto Approval (e.g., <$50 with low fraud score)
  - "Keep-The-Item" eco-friendly freight ratio waiver
  - Real-time rule toggles with immediate evaluation
- **Payment Gateway Webhook Simulator**:
  - Real-time event timeline simulating Stripe / Adyen webhooks (\`charge.refunded\`, \`credit.issued\`, \`dispute.opened\`)
- **Immutable Audit Trail & CSV Export**:
  - Full compliance log tracking automated vs manual actions
  - 1-click CSV settlement report export
- **GitHub Shipping Center**:
  - Native GitHub Actions CI workflow, PR templates, and instant Git push integration.

---

## 🛠️ Quickstart

\`\`\`bash
# 1. Clone or initialize the repository
git clone https://github.com/YOUR_USERNAME/refund-flow.git
cd refund-flow

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚢 Push to GitHub

\`\`\`bash
# Create a new repository on GitHub (e.g. refund-flow), then:
git remote add origin https://github.com/YOUR_USERNAME/refund-flow.git
git branch -M main
git push -u origin main
\`\`\`

Or via GitHub CLI:
\`\`\`bash
gh repo create refund-flow --public --source=. --remote=origin --push
\`\`\`

---

## 📄 License
MIT © 2026 RefundFlow
`);

  zip.file('LICENSE', `MIT License

Copyright (c) 2026 RefundFlow

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`);

  return await zip.generateAsync({ type: 'blob' });
}
