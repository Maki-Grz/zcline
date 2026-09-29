# Zcline

Autonomous enterprise coding assistant powered exclusively by **SAP AI Core** and **SAP BTP** (Custom Z-fork of Cline).

## Key Features
- **100% Dedicated to SAP AI Core**: Native `@sap-ai-sdk/ai-api` connector with OAuth2/XSUAA management and automatic deployment discovery.
- **Pre-installed Official SAP MCPs**: Native support for `@cap-js/mcp-server`, `@sap-ux/fiori-mcp-server`, `@ui5/mcp-server`, and `@sap/abap-mcp-server`.
- **Dual Access Modes**: No-Account Mode (direct BYOK service key paste) and Enterprise SSO (Microsoft Entra ID / SAP Cloud Identity Services).
- **Cost & Token Tracking**: Input/Output/Cache token counters, USD cost estimates, and SAP AI Units (AIU) metrics.
- **Human-in-the-Loop**: Interactive diff approvals and terminal command authorizations.

## Installation
Install directly from the generated `.vsix` file:
```bash
code --install-extension zcline-0.1.0-alpha.1.vsix
```

## Acknowledgements & Attribution
**Zcline** is developed as an enterprise-specialized adaptation based on the open-source work of **[Cline](https://github.com/cline/cline)** (Apache-2.0 license). We sincerely thank the Cline team and contributors for this outstanding agentic engine.

## License
Apache-2.0
