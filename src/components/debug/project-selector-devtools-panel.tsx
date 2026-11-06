// SPDX-FileCopyrightText: © 2026 Joseph Maldjian <joseph.maldjian@hyecompany.com>
// SPDX-License-Identifier: Apache-2.0

import {
	presets,
	setPreset,
	useProjectSelectorSimulation,
} from "@/components/debug/project-selector-state";
import { Button } from "@/components/ui/button";

const labels = {
	live: "Live data",
	loading: "Loading",
	empty: "Empty",
	error: "Error",
	populated: "Populated",
	"populated-error": "Populated with error",
	unavailable: "Unavailable selection",
	"long-names": "Long project names",
};

export function ProjectSelectorDevtoolsPanel() {
	const { preset } = useProjectSelectorSimulation();
	return (
		<div className="flex flex-col gap-3 p-2 text-sm">
			<p>Simulate the header selector without changing the active project.</p>
			<div className="flex flex-wrap gap-2">
				{presets
					.filter((item) => item !== "live")
					.map((item) => (
						<Button
							key={item}
							size="sm"
							variant={preset === item ? "default" : "outline"}
							aria-pressed={preset === item}
							onClick={() => setPreset(item)}
						>
							{labels[item]}
						</Button>
					))}
			</div>
			<div>
				<Button
					size="sm"
					variant="outline"
					onClick={() => setPreset("live")}
					disabled={preset === "live"}
				>
					Reset to live data
				</Button>
			</div>
			<p className="text-muted-foreground">Current: {labels[preset]}</p>
		</div>
	);
}
