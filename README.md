<p align="center">
  <img src="apps/vscode/assets/icons/icon.png" width="96" alt="Zcline" />
</p>

<h1 align="center">Zcline</h1>

<p align="center">
  <strong>Autonomous AI coding assistant powered exclusively by SAP AI Core & SAP BTP</strong>
</p>

<p align="center">
  A specialized enterprise fork of Cline designed for the SAP ecosystem (referencing the traditional SAP <code>Z*</code> customer namespace), featuring native Enterprise SSO (Microsoft Entra ID / SAP Cloud Identity Services), real-time SAP AI Units (AIU) cost tracking, pre-installed official SAP MCP servers, and direct no-account support (BYOK).
</p>

---

## 🚀 Key Features

### 1. 100% Dedicated to SAP AI Core & SAP BTP
- **Native `@sap-ai-sdk/ai-api` connector**: Automatic OAuth2 authentication via XSUAA, transparent token refreshes, and corporate proxy support.
- **Foundation Models**: Leverage Claude 3.5 / 3.7 Sonnet, GPT-4o, Mistral Large, Llama 3, and Gemini deployed on your own SAP AI Core tenant (Generative AI Hub).
- **Deployment auto-discovery**: Automatically fetch active deployments with full compatibility for SAP AI Core orchestration mode.

### 2. Pre-installed Official SAP MCP Servers
Equipped out-of-the box with official Model Context Protocol (MCP) servers tailored for SAP development:
- **`sap-cap-cds` (`@cap-js/mcp-server`)**: Inspect `.cds` models, query entities, generate OData services, and validate CAP logic.
- **`sap-fiori` (`@sap-ux/fiori-mcp-server`)**: Generate Fiori pages, manage `manifest.json`, and manipulate XML/CDS UI annotations.
- **`sap-ui5` (`@ui5/mcp-server`)**: Access UI5 control references, SAP Horizon guidelines, syntax validation, and UI5 linter.
- **`sap-abap-adt` (`@sap/abap-mcp-server`)**: Bridge into ABAP Development Tools to inspect Data Dictionary structures, classes, and CDS views on On-Premise and BTP systems.

### 3. Dual Enterprise Access Modes
- **No-Account Mode (BYOK - Bring Your Own Key)**:
  - Direct paste of your SAP AI Core Service Key JSON (or manual field entry).
  - Credentials remain encrypted locally in VS Code `SecretStorage`.
  - Ideal for consultants, freelancers, and sandbox testing.
- **Enterprise SSO Mode**:
  - **Microsoft Entra ID (Azure AD)**: One-click sign-in via the VS Code Authentication API.
  - **SAP Cloud Identity Services (IAS)**: Secure enterprise directory federation.
  - No external SaaS dependencies: runs entirely on your local machine and your SAP BTP tenant.

### 4. Real-time FinOps & Cost Tracking
- Live token consumption and cost breakdown:
  - **Input Tokens**, **Output Tokens**, and **Cached Tokens**.
  - **Estimated total cost** (in \$ USD).
  - **SAP AI Units (AIU)** computed automatically per SAP consumption tables.

### 5. Human-in-the-Loop & Enterprise Security
- **Explicit approval** for each file modification with visual diff inspection.
- **Manual confirmation** for terminal commands before execution.
- **Enterprise MCP Support** to connect custom data sources (SAP HANA Cloud, OData APIs, internal microservices).

---

## 🛠️ Development & Build

The project uses **Bun 1.3.13** and **Node >= 22**.

### 1. Install dependencies
```bash
bun install
```

### 2. Build SDK packages
```bash
bun run build:sdk
```

### 3. Build VS Code extension (Webview + Extension Host)
```bash
bun run build:vscode
```

### 4. Package into `.vsix`
```bash
bun run package:vscode
```
The generated archive will be available in `apps/vscode/zcline-0.1.0-alpha.1.vsix`.

### 5. Install the extension in VS Code
```bash
code --install-extension apps/vscode/zcline-0.1.0-alpha.1.vsix
```

---

## 🧪 Unit Tests

```bash
# Run unit tests for SDK packages
bun --cwd sdk/packages/llms test

# Run React webview unit tests
cd apps/vscode/webview-ui && bun test
```

---

## 🙏 Acknowledgements & Attribution

**Zcline** is an enterprise distribution and specialized fork built on the open-source **[Cline](https://github.com/cline/cline)** project (licensed under Apache-2.0).

We extend our sincere gratitude to the Cline creators and community for building such an exceptional, modular agentic foundation.

---

## 📄 License

This project is distributed under the [Apache-2.0](LICENSE) license.
