// SPDX-FileCopyrightText: © 2026 Joseph Maldjian <joseph.maldjian@hyecompany.com>
// SPDX-License-Identifier: Apache-2.0

import { useSyncExternalStore } from "react";
import { ALL_PROJECTS, type ProjectScope } from "@/lib/incus/project-scope";

export const presets = [
	"live",
	"loading",
	"empty",
	"error",
	"populated",
	"populated-error",
	"unavailable",
	"long-names",
] as const;
export type Preset = (typeof presets)[number];

type State = { preset: Preset; scope: ProjectScope };
let state: State = { preset: "live", scope: ALL_PROJECTS };
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};
const update = (next: State) => {
	state = next;
	for (const listener of listeners) listener();
};
export function useProjectSelectorSimulation() {
	return useSyncExternalStore(subscribe, () => state);
}
export function setPreset(preset: Preset) {
	update({
		preset,
		scope:
			preset === "unavailable"
				? { kind: "project", name: "missing-project" }
				: ALL_PROJECTS,
	});
}
export function setSampleScope(scope: ProjectScope) {
	update({ ...state, scope });
}
