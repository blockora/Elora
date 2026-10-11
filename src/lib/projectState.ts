import { type WebsiteSpec } from '../features/website/schema'

export interface ProjectState {
  name: string
  currentSpec: WebsiteSpec
  versions: ProjectVersion[]
  currentVersionIndex: number
}

export interface ProjectVersion {
  version: number
  spec: WebsiteSpec
  changeSummary: string
  createdAt: number
}

export interface ProjectStateOptions {
  initialName?: string
  initialSpec: WebsiteSpec
}

export function createProjectState({
  initialName = 'Untitled project',
  initialSpec,
}: ProjectStateOptions): ProjectState {
  const initialVersion: ProjectVersion = {
    version: 1,
    spec: initialSpec,
    changeSummary: 'Initial generation',
    createdAt: Date.now(),
  }

  return {
    name: initialName,
    currentSpec: initialSpec,
    versions: [initialVersion],
    currentVersionIndex: 0,
  }
}

export function updateProjectName(
  state: ProjectState,
  newName: string,
): ProjectState {
  if (!newName.trim()) {
    return state
  }
  return {
    ...state,
    name: newName.trim().slice(0, 80),
  }
}

export function applyEdit(
  state: ProjectState,
  newSpec: WebsiteSpec,
  changeSummary: string,
): { state: ProjectState; error?: string } {
  // Validate that the new spec is different from current
  if (JSON.stringify(newSpec) === JSON.stringify(state.currentSpec)) {
    return { state, error: 'No changes detected in the updated specification.' }
  }

  // Create new version, truncating any future versions (redo stack)
  const newVersion: ProjectVersion = {
    version: state.versions[state.currentVersionIndex].version + 1,
    spec: newSpec,
    changeSummary: changeSummary.slice(0, 240) || 'Edit applied',
    createdAt: Date.now(),
  }

  const newVersions = state.versions.slice(0, state.currentVersionIndex + 1)
  newVersions.push(newVersion)

  return {
    state: {
      ...state,
      currentSpec: newSpec,
      versions: newVersions,
      currentVersionIndex: newVersions.length - 1,
    },
  }
}

export function undo(state: ProjectState): {
  state: ProjectState
  error?: string
} {
  if (state.currentVersionIndex <= 0) {
    return {
      state,
      error: 'No previous version to restore.',
    }
  }

  const previousIndex = state.currentVersionIndex - 1
  return {
    state: {
      ...state,
      currentSpec: state.versions[previousIndex].spec,
      currentVersionIndex: previousIndex,
    },
  }
}

export function redo(state: ProjectState): {
  state: ProjectState
  error?: string
} {
  if (state.currentVersionIndex >= state.versions.length - 1) {
    return {
      state,
      error: 'No newer version to restore.',
    }
  }

  const nextIndex = state.currentVersionIndex + 1
  return {
    state: {
      ...state,
      currentSpec: state.versions[nextIndex].spec,
      currentVersionIndex: nextIndex,
    },
  }
}

export function canUndo(state: ProjectState): boolean {
  return state.currentVersionIndex > 0
}

export function canRedo(state: ProjectState): boolean {
  return state.currentVersionIndex < state.versions.length - 1
}

export function getVersionHistory(state: ProjectState): ProjectVersion[] {
  return state.versions.map((v) => ({ ...v, spec: { ...v.spec } }))
}

export function restoreVersion(
  state: ProjectState,
  versionNumber: number,
): { state: ProjectState; error?: string } {
  const versionIndex = state.versions.findIndex(
    (v) => v.version === versionNumber,
  )
  if (versionIndex === -1) {
    return {
      state,
      error: `Version ${versionNumber} not found.`,
    }
  }

  return {
    state: {
      ...state,
      currentSpec: state.versions[versionIndex].spec,
      currentVersionIndex: versionIndex,
    },
  }
}
