<p align="center">
  <img src="apps/vscode/assets/icons/icon.png" width="96" alt="Zcline" />
</p>

<h1 align="center">Zcline</h1>

<p align="center">
  <strong>L'assistant de code autonome propulsé exclusivement par SAP AI Core et SAP BTP</strong>
</p>

<p align="center">
  Fork customisé de Cline conçu spécialement pour l'écosystème SAP (clin d'œil au namespace <code>Z*</code> des développements spécifiques SAP), avec intégration native SSO Entreprise (Microsoft Entra ID / SAP IAS), calcul des coûts en unités SAP AI (AIU) et support direct sans compte (BYOK).
</p>

---

## 🚀 Fonctionnalités Clés

### 1. 100% Dédié à SAP AI Core & SAP BTP
- **Connecteur natif `@sap-ai-sdk/ai-api`** : Authentification OAuth2 automatique via XSUAA, renouvellement transparent des tokens et respect des politiques de proxy d'entreprise.
- **Support des Foundation Models** : Exploitez Claude 3.5 Sonnet, GPT-4o, Mistral Large, Llama 3 et Gemini déployés sur votre propre tenant SAP AI Core (Generative AI Hub).
- **Auto-découverte des déploiements** : Sélection automatique ou manuelle de votre déploiement actif et compatibilité complète avec le service d'orchestration SAP AI Core.

### 2. Double Mode d'Accès Entreprise
- **Mode Sans Compte (BYOK - Bring Your Own Key)** :
  - Saisie directe de votre Service Key SAP AI Core (format JSON ou clés individuelles).
  - Idéal pour les consultants, freelances et environnements de test / sandbox.
- **Mode SSO Entreprise** :
  - **Microsoft Entra ID (Azure AD)** : Connexion native en un clic via l'API VS Code Authentication.
  - **SAP Cloud Identity Services (IAS)** : Authentification sécurisée par annuaire d'entreprise.
  - Aucune dépendance à un SaaS tiers externe : l'extension s'exécute entièrement sur votre poste et votre tenant SAP BTP.

### 3. Suivi FinOps des Coûts & Tokens en Temps Réel
- Suivi direct de votre consommation par session et cumulée :
  - **Tokens d'entrée**, **Tokens de sortie** et **Tokens mis en cache**.
  - **Coût estimé total** (en \$ USD).
  - **Unités SAP AI (AIU)** calculées automatiquement selon la grille de consommation SAP.

### 4. Contrôle Humain & Sécurité Entreprise (Human-in-the-loop)
- **Approbation systématique** de chaque modification de fichier via un visualiseur de diffs interactif.
- **Validation manuelle** des commandes de terminal avant exécution.
- **Support du Model Context Protocol (MCP)** pour étendre l'assistant avec vos sources de données d'entreprise (SAP HANA Cloud, APIs OData, etc.).

---

## 🛠️ Développement & Compilation

Le projet utilise **Bun 1.3.13** et **Node >= 22**.

### 1. Installation des dépendances
```bash
bun install
```

### 2. Compilation des SDKs
```bash
bun run build:sdk
```

### 3. Compilation de l'extension VS Code (Webview + Extension)
```bash
bun run build:vscode
```

### 4. Packaging en fichier `.vsix`
```bash
bun run package:vscode
```
Le fichier généré sera disponible dans `apps/vscode/zcline-4.1.10.vsix`.

### 5. Installer l'extension dans VS Code
```bash
code --install-extension apps/vscode/zcline-4.1.10.vsix
```

---

## 🧪 Tests Unitaires

```bash
# Tests unitaires du connecteur SAP AI Core
bun --cwd sdk/packages/llms test

# Tests unitaires de la Webview React
cd apps/vscode/webview-ui && bun test
```

---

## 🙏 Remerciements & Attribution

Ce projet, **Zcline**, est une déclinaison d'entreprise spécialisée et un fork customisé basé sur le projet open-source remarquable **[Cline](https://github.com/cline/cline)**, distribué sous licence Apache-2.0.

Nous exprimons toute notre gratitude à l'équipe et aux contributeurs de Cline pour avoir créé et partagé une architecture d'agent de codage aussi robuste, modulaire et performante.

---

## 📄 Licence

Ce projet est distribué sous la licence [Apache-2.0](LICENSE).
