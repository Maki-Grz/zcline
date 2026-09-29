import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useMemo } from "react"
import ClineLogoWhite from "@/assets/ClineLogoWhite"
import { ClineAuthStatus } from "@/components/account/ClineAuthStatus"
import { useClineSignIn } from "@/context/ClineAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"

export const AccountWelcomeView = () => {
	const { taskHistory } = useExtensionState()
	const { isLoginLoading, authStatusMessage, handleSignIn } = useClineSignIn()

	// Compute consumption metrics from task history
	const metrics = useMemo(() => {
		const history = taskHistory || []
		const totalTasks = history.length
		const tokensIn = history.reduce((acc, item) => acc + (item.tokensIn || 0), 0)
		const tokensOut = history.reduce((acc, item) => acc + (item.tokensOut || 0), 0)
		const cache = history.reduce((acc, item) => acc + (item.cacheReads || 0) + (item.cacheWrites || 0), 0)
		const totalCost = history.reduce((acc, item) => acc + (item.totalCost || 0), 0)
		// Estimation SAP AI Units: standard ratio on SAP BTP Foundation Models
		const sapAiUnits = (totalCost * 1.02).toFixed(4)

		return {
			totalTasks,
			tokensIn,
			tokensOut,
			cache,
			totalTokens: tokensIn + tokensOut + cache,
			totalCost: totalCost.toFixed(4),
			sapAiUnits,
		}
	}, [taskHistory])

	return (
		<div className="flex flex-col gap-4 p-2">
			{/* Header / Mode Indicator */}
			<div className="flex items-center justify-between p-3 rounded bg-(--vscode-editor-inactiveSelectionBackground) border border-(--vscode-editorWidget-border)">
				<div className="flex items-center gap-2.5">
					<ClineLogoWhite className="size-6 text-(--vscode-focusBorder)" />
					<div>
						<div className="font-semibold text-xs text-(--vscode-foreground)">Mode Sans Compte (BYOK)</div>
						<div className="text-[10px] text-(--vscode-descriptionForeground)">Clé de service SAP AI Core locale</div>
					</div>
				</div>
				<span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
					Actif
				</span>
			</div>

			{/* Suivi des consommations et coûts */}
			<div className="rounded border border-(--vscode-editorWidget-border) p-3 bg-(--vscode-sideBar-background)">
				<div className="flex items-center justify-between mb-2">
					<span className="text-xs font-semibold text-(--vscode-foreground)">Suivi de Consommation & Coûts</span>
					<span className="text-[10px] text-(--vscode-descriptionForeground)">
						{metrics.totalTasks} tâche{metrics.totalTasks > 1 ? "s" : ""}
					</span>
				</div>

				<div className="grid grid-cols-2 gap-2 my-2">
					<div className="p-2 rounded bg-(--vscode-input-background) border border-(--vscode-input-border)">
						<div className="text-[10px] text-(--vscode-descriptionForeground)">Tokens Entrants</div>
						<div className="text-sm font-semibold font-mono text-(--vscode-foreground)">
							{metrics.tokensIn.toLocaleString()}
						</div>
					</div>

					<div className="p-2 rounded bg-(--vscode-input-background) border border-(--vscode-input-border)">
						<div className="text-[10px] text-(--vscode-descriptionForeground)">Tokens Sortants</div>
						<div className="text-sm font-semibold font-mono text-(--vscode-foreground)">
							{metrics.tokensOut.toLocaleString()}
						</div>
					</div>

					<div className="p-2 rounded bg-(--vscode-input-background) border border-(--vscode-input-border)">
						<div className="text-[10px] text-(--vscode-descriptionForeground)">Tokens en Cache</div>
						<div className="text-sm font-semibold font-mono text-(--vscode-foreground)">
							{metrics.cache.toLocaleString()}
						</div>
					</div>

					<div className="p-2 rounded bg-(--vscode-input-background) border border-(--vscode-input-border)">
						<div className="text-[10px] text-(--vscode-descriptionForeground)">Unités SAP AI (Est.)</div>
						<div className="text-sm font-semibold font-mono text-emerald-400">{metrics.sapAiUnits} AIU</div>
					</div>
				</div>

				<div className="mt-2 pt-2 border-t border-(--vscode-editorWidget-border) flex items-center justify-between">
					<span className="text-xs text-(--vscode-descriptionForeground)">Coût estimé total :</span>
					<span className="text-xs font-mono font-bold text-(--vscode-foreground)">${metrics.totalCost} USD</span>
				</div>
			</div>

			{/* Enterprise SSO Login Section */}
			<div className="rounded border border-(--vscode-editorWidget-border) p-3 bg-(--vscode-sideBar-background) flex flex-col gap-2">
				<div className="font-semibold text-xs text-(--vscode-foreground)">Raccordement Entreprise (SSO)</div>
				<p className="text-[11px] text-(--vscode-descriptionForeground) m-0 leading-relaxed">
					Connectez-vous avec votre identifiant d'entreprise pour synchroniser vos quotas d'équipe et appliquer les
					politiques de gouvernance SAP BTP.
				</p>

				<VSCodeButton className="w-full mt-1" disabled={isLoginLoading} onClick={handleSignIn}>
					<span className="codicon codicon-shield mr-1.5" />
					Connexion Entreprise (SSO Microsoft / SAP)
					{isLoginLoading && (
						<span className="ml-1.5 animate-spin">
							<span className="codicon codicon-refresh" />
						</span>
					)}
				</VSCodeButton>

				<ClineAuthStatus message={authStatusMessage} />
			</div>

			<p className="text-(--vscode-descriptionForeground) text-[10px] text-center m-0">
				Extension SAP AI Core Assistant • Données et clés hébergées localement
			</p>
		</div>
	)
}

export default AccountWelcomeView
