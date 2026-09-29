import { BooleanRequest, EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { memo, useEffect, useState } from "react"
import ClineLogoWhite from "@/assets/ClineLogoWhite"
import ApiOptions from "@/components/settings/ApiOptions"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient, StateServiceClient } from "@/services/grpc-client"
import { validateApiConfiguration } from "@/utils/validate"

const WelcomeView = memo(() => {
	const { apiConfiguration, mode } = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const disableLetsGoButton = apiErrorMessage != null

	const handleLogin = () => {
		setIsLoading(true)
		AccountServiceClient.accountLoginClicked(EmptyRequest.create())
			.catch((err) => console.error("Failed to get login URL:", err))
			.finally(() => {
				setIsLoading(false)
			})
	}

	const handleSubmit = async () => {
		try {
			await StateServiceClient.setWelcomeViewCompleted(BooleanRequest.create({ value: true }))
		} catch (error) {
			console.error("Failed to update API configuration or complete welcome view:", error)
		}
	}

	useEffect(() => {
		setApiErrorMessage(validateApiConfiguration(mode, apiConfiguration))
	}, [apiConfiguration, mode])

	return (
		<div className="fixed inset-0 p-0 flex flex-col">
			<div className="h-full px-5 overflow-auto flex flex-col gap-2.5">
				<h2 className="text-lg font-semibold">SAP AI Core Assistant</h2>
				<div className="flex justify-center my-4">
					<ClineLogoWhite className="size-16" />
				</div>
				<p>
					Bienvenue dans votre assistant de développement propulsé exclusivement par <strong>SAP AI Core</strong> et vos
					modèles de fondation hébergés en toute sécurité sur <strong>SAP BTP</strong>.
				</p>

				<p className="text-(--vscode-descriptionForeground) text-xs">
					Générez du code, analysez vos architectures, automatisez vos workflows et suivez votre consommation de tokens
					et d'unités SAP AI en temps réel.
				</p>

				<div className="mt-2 flex flex-col gap-2">
					<VSCodeButton appearance="primary" className="w-full" disabled={isLoading} onClick={handleLogin}>
						<span className="codicon codicon-shield mr-1" />
						Connexion Entreprise (SSO Microsoft / SAP)
						{isLoading && (
							<span className="ml-1 animate-spin">
								<span className="codicon codicon-refresh" />
							</span>
						)}
					</VSCodeButton>

					{!showApiOptions && (
						<VSCodeButton appearance="secondary" className="w-full" onClick={() => setShowApiOptions(true)}>
							<span className="codicon codicon-key mr-1" />
							Mode Sans Compte (Clé de Service SAP AI Core)
						</VSCodeButton>
					)}
				</div>

				<div className="mt-4">
					{showApiOptions && (
						<div>
							<div className="text-xs font-semibold mb-2 text-(--vscode-descriptionForeground)">
								Configuration locale de la clé de service SAP AI Core (BYOK) :
							</div>
							<ApiOptions currentMode={mode} showModelOptions={false} />
							<VSCodeButton className="mt-2 w-full" disabled={disableLetsGoButton} onClick={handleSubmit}>
								Démarrer en Mode Sans Compte
							</VSCodeButton>
						</div>
					)}
				</div>
			</div>
		</div>
	)
})

export default WelcomeView
