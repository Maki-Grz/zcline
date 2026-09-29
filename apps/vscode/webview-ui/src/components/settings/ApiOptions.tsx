import type { Mode } from "@shared/storage/types"
import { useEffect } from "react"
import styled from "styled-components"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { SapAiCoreProvider } from "./providers/SapAiCoreProvider"
import { useApiConfigurationHandlers } from "./utils/useApiConfigurationHandlers"

export interface ApiOptionsProps {
	showModelOptions: boolean
	apiErrorMessage?: string
	modelIdErrorMessage?: string
	isPopup?: boolean
	currentMode: Mode
	initialModelTab?: "recommended" | "free"
}

export const DROPDOWN_Z_INDEX = 1000

export const DropdownContainer = styled.div<{ zIndex?: number }>`
	position: absolute;
	top: calc(100% - 1px);
	left: 0;
	right: 0;
	border-bottom: 1px solid var(--vscode-list-activeSelectionBackground);
	border-left: 1px solid var(--vscode-list-activeSelectionBackground);
	border-right: 1px solid var(--vscode-list-activeSelectionBackground);
	border-radius: 0 0 3px 3px;
	z-index: ${(props) => props.zIndex || DROPDOWN_Z_INDEX};
	background-color: var(--vscode-dropdown-background);
`

export const ApiOptions = ({ showModelOptions, apiErrorMessage, modelIdErrorMessage, isPopup, currentMode }: ApiOptionsProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldsChange } = useApiConfigurationHandlers()

	// Ensure provider is always sapaicore
	useEffect(() => {
		const currentProvider =
			currentMode === "plan" ? apiConfiguration?.planModeApiProvider : apiConfiguration?.actModeApiProvider
		if (currentProvider !== "sapaicore") {
			handleFieldsChange({
				planModeApiProvider: "sapaicore",
				actModeApiProvider: "sapaicore",
			})
		}
	}, [apiConfiguration, currentMode, handleFieldsChange])

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2 mb-1">
				<span className="font-semibold text-sm">Fournisseur d'IA : SAP AI Core</span>
				<span className="text-xs px-2 py-0.5 rounded bg-(--vscode-badge-background) text-(--vscode-badge-foreground)">
					Exclusif
				</span>
			</div>

			<SapAiCoreProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />

			{apiErrorMessage && <p className="text-(--vscode-errorForeground) text-xs mt-1">{apiErrorMessage}</p>}
			{modelIdErrorMessage && <p className="text-(--vscode-errorForeground) text-xs mt-1">{modelIdErrorMessage}</p>}
		</div>
	)
}

export default ApiOptions
