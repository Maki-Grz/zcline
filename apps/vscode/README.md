# Zcline

L'assistant de code autonome d'entreprise propulsé exclusivement par **SAP AI Core** et **SAP BTP** (Custom Z-fork de Cline).

## Fonctionnalités Clés
- **100% Dédié à SAP AI Core** : Connecteur natif `@sap-ai-sdk/ai-api` avec gestion OAuth2/XSUAA et découverte automatique des déploiements.
- **Double Mode d'Accès** : Mode Sans Compte (BYOK clé de service directe) et SSO Entreprise (Microsoft Entra ID / SAP Cloud Identity Services).
- **Suivi des Coûts & Tokens** : Tokens In/Out/Cache, coûts estimés en USD et suivi en Unités SAP AI (AIU).
- **Contrôle Humain en Boucle** : Approbation de chaque diff de code et de chaque commande de terminal.
- **Support MCP** : Connexion à vos outils et bases de données d'entreprise via le Model Context Protocol.

## Installation
Installez directement le fichier `.vsix` :
```bash
code --install-extension zcline-4.1.10.vsix
```

## Remerciements & Attribution
Ce projet, **Zcline**, est développé comme une adaptation d'entreprise basée sur le travail open-source de **[Cline](https://github.com/cline/cline)** (licence Apache-2.0). Nous remercions sincèrement l'équipe de Cline pour cette formidable fondation agentique.

## Licence
Apache-2.0
