// SPDX-FileCopyrightText: © 2026 Hye Ararat contributors
// SPDX-FileCopyrightText: © 2026 Joseph Maldjian <joseph.maldjian@hyecompany.com>
// SPDX-License-Identifier: Apache-2.0

import {
	setPreset,
	setSampleScope,
	useProjectSelectorSimulation,
} from "@/components/debug/project-selector-state";
import { LoadingStatus, SkeletonList } from "@/components/loading/skeletons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useProjectScope } from "@/hooks/incus/use-project-scope";
import { useProjects, useProjectsApi } from "@/hooks/incus/use-projects";
import { IncusApiError } from "@/lib/incus/client";
import type { CollectionResult } from "@/lib/incus/data/consumers";
import { collectionView } from "@/lib/incus/data/loading";
import {
	ALL_PROJECTS,
	type ProjectScope,
	projectScopeKey,
	scopeFromKey,
} from "@/lib/incus/project-scope";
import { cn } from "@/lib/ui/utils";

const ERROR_KEY = "status:error";
const EMPTY_KEY = "status:empty";

function scopeLabel(scope: ProjectScope, isAvailable: boolean): string {
	if (scope.kind === "all") {
		return "All Projects";
	}
	return isAvailable ? scope.name : `${scope.name} (unavailable)`;
}

export function ProjectSelector({ className }: { className?: string }) {
	const { scope, setScope, isAvailable } = useProjectScope();
	// Names only: one small URL-list request, then kept live by events.
	const projects = useProjects(["name"]);
	const api = useProjectsApi();
	const props = {
		className,
		scope,
		setScope,
		isAvailable,
		projects,
		retry: () => api?.refreshList(["name"]),
	};
	return import.meta.env.DEV ? (
		<SimulatedSelector {...props} />
	) : (
		<Selector {...props} />
	);
}

type SelectorProps = {
	className?: string;
	scope: ProjectScope;
	setScope: (scope: ProjectScope) => void;
	isAvailable: boolean;
	projects: CollectionResult<{ name: string }>;
	retry: () => void;
};

function SimulatedSelector(props: SelectorProps) {
	const { preset, scope } = useProjectSelectorSimulation();
	if (preset === "live") return <Selector {...props} />;
	const names =
		preset === "long-names"
			? [
					"a-very-long-project-name-for-testing-the-selector-layout",
					"another-long-project-name-for-testing",
				]
			: ["default", "development", "production"];
	const data =
		preset === "loading" || preset === "error"
			? undefined
			: preset === "empty"
				? []
				: names.map((name) => ({ name }));
	const error =
		preset === "error" || preset === "populated-error"
			? new IncusApiError("network", "Simulated error")
			: null;
	return (
		<Selector
			{...props}
			scope={scope}
			setScope={setSampleScope}
			isAvailable={
				scope.kind === "all" ||
				preset !== "unavailable" ||
				scope.name !== "missing-project"
			}
			projects={{
				data,
				missing: [],
				available: data !== undefined,
				complete: data !== undefined,
				fresh: false,
				fetching: preset === "loading",
				error,
			}}
			retry={() => setPreset("populated")}
		/>
	);
}

function Selector({
	className,
	scope,
	setScope,
	isAvailable,
	projects,
	retry,
}: SelectorProps) {
	const names = projects.data ?? [];
	const error = projects.error;
	const view = collectionView(projects);

	const selectedKey = projectScopeKey(scope);

	return (
		<div className={cn("flex min-w-0 items-center gap-1", className)}>
			<Select
				value={selectedKey}
				onValueChange={(key) => {
					const next = key === null ? null : scopeFromKey(key);
					if (next !== null) {
						setScope(next);
					}
				}}
			>
				<SelectTrigger aria-label="Project" className="max-w-36 sm:max-w-56">
					<SelectValue>{scopeLabel(scope, isAvailable)}</SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={projectScopeKey(ALL_PROJECTS)}>
						All Projects
					</SelectItem>
					{view.kind === "skeleton" && (
						<>
							<LoadingStatus label="Loading projects" />
							<SkeletonList items={3} />
						</>
					)}
					{error !== null && (
						<SelectItem value={ERROR_KEY} disabled>
							Could not load projects
						</SelectItem>
					)}
					{view.kind === "empty" && (
						<SelectItem value={EMPTY_KEY} disabled>
							No projects
						</SelectItem>
					)}
					{names.map((project) => (
						<SelectItem
							key={project.name}
							value={projectScopeKey({ kind: "project", name: project.name })}
						>
							{project.name}
						</SelectItem>
					))}
					{!isAvailable && scope.kind === "project" && (
						<SelectItem value={selectedKey} disabled>
							{scopeLabel(scope, false)}
						</SelectItem>
					)}
				</SelectContent>
			</Select>
			{error !== null && (
				<button
					type="button"
					className="shrink-0 rounded-md px-1.5 py-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
					onClick={retry}
				>
					Retry
				</button>
			)}
		</div>
	);
}
