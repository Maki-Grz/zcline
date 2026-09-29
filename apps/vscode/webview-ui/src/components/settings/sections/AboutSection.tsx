import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import Section from "../Section"

interface AboutSectionProps {
	version: string
	extensionVariant?: "legacy" | "next"
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const AboutSection = ({ version, renderSectionHeader }: AboutSectionProps) => {
	return (
		<div>
			{renderSectionHeader("about")}
			<Section>
				<div className="flex px-4 flex-col gap-3">
					<h2 className="text-lg font-semibold">Zcline v{version}</h2>
					<p className="text-sm">
						Assistant de développement d'entreprise propulsé exclusivement par <strong>SAP AI Core</strong> et vos
						modèles de fondation hébergés en toute sécurité sur <strong>SAP BTP</strong>. Il vous accompagne pas à pas
						pour créer, modifier, tester et auditer votre code sous contrôle strict.
					</p>

					<h3 className="text-sm font-semibold mt-1">Documentation SAP</h3>
					<p className="text-xs">
						<VSCodeLink href="https://help.sap.com/docs/sap-ai-core">SAP AI Core Guide</VSCodeLink>
						{" • "}
						<VSCodeLink href="https://discovery-center.cloud.sap/serviceCatalog/ai-core">
							BTP Discovery Center
						</VSCodeLink>
					</p>

					<h3 className="text-sm font-semibold mt-2">Remerciements & Origine</h3>
					<p className="text-xs text-description">
						<strong>Zcline</strong> est une déclinaison d'entreprise autonome développée comme un fork customisé
						(hommage au namespace <code>Z*</code> des développements spécifiques SAP) basé sur le projet open-source{" "}
						<VSCodeLink href="https://github.com/cline/cline">Cline</VSCodeLink> (licence Apache 2.0). Nous remercions
						chaleureusement l'équipe de Cline et sa communauté pour avoir conçu cette formidable architecture
						agentique.
					</p>
				</div>
			</Section>
		</div>
	)
}

export default AboutSection
