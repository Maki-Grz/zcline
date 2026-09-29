import { ApiConfiguration } from "@shared/api"
import { Mode } from "@shared/storage/types"

export function validateApiConfiguration(_currentMode: Mode, apiConfiguration?: ApiConfiguration): string | undefined {
	if (apiConfiguration) {
		if (!apiConfiguration.sapAiCoreBaseUrl) {
			return "Veuillez renseigner une URL de base SAP AI Core valide (ex: https://api.ai....)."
		}
		if (!apiConfiguration.sapAiCoreClientId) {
			return "Veuillez renseigner un Client ID valide issu de votre clé de service SAP AI Core."
		}
		if (!apiConfiguration.sapAiCoreClientSecret) {
			return "Veuillez renseigner un Client Secret valide."
		}
		if (!apiConfiguration.sapAiCoreTokenUrl) {
			return "Veuillez renseigner une Token URL (Auth URL) valide."
		}
	}
	return undefined
}
