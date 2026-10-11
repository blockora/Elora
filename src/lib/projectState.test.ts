import { describe, expect, it } from 'vitest'
import {
  applyEdit,
  createProjectState,
  canUndo,
  canRedo,
  getVersionHistory,
  redo,
  restoreVersion,
  undo,
  updateProjectName,
} from './projectState'
import { restaurantWebsite } from '../features/website/examples'

describe('project state management', () => {
  it('creates initial project state with a version', () => {
    const state = createProjectState({
      initialName: 'My Website',
      initialSpec: restaurantWebsite,
    })

    expect(state.name).toBe('My Website')
    expect(state.currentSpec).toEqual(restaurantWebsite)
    expect(state.versions).toHaveLength(1)
    expect(state.versions[0].version).toBe(1)
    expect(state.versions[0].changeSummary).toBe('Initial generation')
    expect(state.currentVersionIndex).toBe(0)
    expect(canUndo(state)).toBe(false)
    expect(canRedo(state)).toBe(false)
  })

  it('creates project with default name when not provided', () => {
    const state = createProjectState({
      initialSpec: restaurantWebsite,
    })

    expect(state.name).toBe('Untitled project')
  })

  it('updates project name', () => {
    const state = createProjectState({
      initialName: 'Old Name',
      initialSpec: restaurantWebsite,
    })

    const updated = updateProjectName(state, 'New Name')
    expect(updated.name).toBe('New Name')
    expect(updated.versions).toEqual(state.versions)
  })

  it('ignores empty project names', () => {
    const state = createProjectState({
      initialName: 'Original',
      initialSpec: restaurantWebsite,
    })

    const updated = updateProjectName(state, '   ')
    expect(updated.name).toBe('Original')
  })

  it('truncates long project names', () => {
    const state = createProjectState({
      initialSpec: restaurantWebsite,
    })

    const longName = 'a'.repeat(100)
    const updated = updateProjectName(state, longName)
    expect(updated.name).toHaveLength(80)
  })

  it('applies an edit and creates a new version', () => {
    const state = createProjectState({
      initialSpec: restaurantWebsite,
    })

    const newSpec = {
      ...restaurantWebsite,
      sections: restaurantWebsite.sections.map((s) =>
        s.type === 'hero' ? { ...s, title: 'Updated Title' } : s,
      ),
    }

    const result = applyEdit(state, newSpec, 'Updated hero title')

    expect(result.error).toBeUndefined()
    expect(result.state.currentSpec).toEqual(newSpec)
    expect(result.state.versions).toHaveLength(2)
    expect(result.state.versions[1].version).toBe(2)
    expect(result.state.versions[1].changeSummary).toBe('Updated hero title')
    expect(result.state.currentVersionIndex).toBe(1)
    expect(canUndo(result.state)).toBe(true)
    expect(canRedo(result.state)).toBe(false)
  })

  it('returns error when edit produces unchanged spec', () => {
    const state = createProjectState({
      initialSpec: restaurantWebsite,
    })

    const result = applyEdit(state, restaurantWebsite, 'No change')

    expect(result.error).toBeDefined()
    expect(result.state).toBe(state)
  })

  it('applies multiple edits', () => {
    const state = createProjectState({
      initialSpec: restaurantWebsite,
    })

    const edit1 = {
      ...restaurantWebsite,
      sections: restaurantWebsite.sections.map((s) =>
        s.type === 'hero' ? { ...s, title: 'First Edit' } : s,
      ),
    }

    const afterFirst = applyEdit(state, edit1, 'First edit').state

    const edit2 = {
      ...edit1,
      sections: edit1.sections.map((s) =>
        s.type === 'features' ? { ...s, title: 'Second Edit' } : s,
      ),
    }

    const afterSecond = applyEdit(afterFirst, edit2, 'Second edit').state

    expect(afterSecond.versions).toHaveLength(3)
    expect(afterSecond.currentSpec.sections[0].title).toBe('First Edit')
    expect(afterSecond.currentSpec.sections[1].title).toBe('Second Edit')
  })

  it('undoes to previous version', () => {
    const state = createProjectState({
      initialSpec: restaurantWebsite,
    })

    const newSpec = {
      ...restaurantWebsite,
      sections: restaurantWebsite.sections.map((s) =>
        s.type === 'hero' ? { ...s, title: 'Edited' } : s,
      ),
    }

    const afterEdit = applyEdit(state, newSpec, 'Edit').state
    const afterUndo = undo(afterEdit).state

    expect(afterUndo.currentSpec).toEqual(restaurantWebsite)
    expect(afterUndo.currentVersionIndex).toBe(0)
    expect(canUndo(afterUndo)).toBe(false)
    expect(canRedo(afterUndo)).toBe(true)
  })

  it('returns error when undo is not possible', () => {
    const state = createProjectState({
      initialSpec: restaurantWebsite,
    })

    const result = undo(state)
    expect(result.error).toBeDefined()
    expect(result.state).toBe(state)
  })

  it('redoes to newer version', () => {
    const state = createProjectState({
      initialSpec: restaurantWebsite,
    })

    const newSpec = {
      ...restaurantWebsite,
      sections: restaurantWebsite.sections.map((s) =>
        s.type === 'hero' ? { ...s, title: 'Edited' } : s,
      ),
    }

    const afterEdit = applyEdit(state, newSpec, 'Edit').state
    const afterUndo = undo(afterEdit).state
    const afterRedo = redo(afterUndo).state

    expect(afterRedo.currentSpec).toEqual(newSpec)
    expect(afterRedo.currentVersionIndex).toBe(1)
    expect(canUndo(afterRedo)).toBe(true)
    expect(canRedo(afterRedo)).toBe(false)
  })

  it('returns error when redo is not possible', () => {
    const state = createProjectState({
      initialSpec: restaurantWebsite,
    })

    const result = redo(state)
    expect(result.error).toBeDefined()
    expect(result.state).toBe(state)
  })

  it('truncates redo stack when new edit is applied after undo', () => {
    const state = createProjectState({
      initialSpec: restaurantWebsite,
    })

    const edit1 = {
      ...restaurantWebsite,
      sections: restaurantWebsite.sections.map((s) =>
        s.type === 'hero' ? { ...s, title: 'Edit 1' } : s,
      ),
    }

    const edit2 = {
      ...edit1,
      sections: edit1.sections.map((s) =>
        s.type === 'features' ? { ...s, title: 'Edit 2' } : s,
      ),
    }

    const edit3 = {
      ...edit2,
      sections: edit2.sections.map((s) =>
        s.type === 'contact' ? { ...s, title: 'Edit 3' } : s,
      ),
    }

    // State: v1 -> v2 (edit1) -> v3 (edit2)
    const afterEdit1 = applyEdit(state, edit1, 'Edit 1').state
    const afterEdit2 = applyEdit(afterEdit1, edit2, 'Edit 2').state

    // Undo: back to v2
    const afterUndo = undo(afterEdit2).state

    // Apply new edit from v2 position - should truncate v3
    const afterNewEdit = applyEdit(afterUndo, edit3, 'New edit').state

    // Now we have: v1, v2 (edit1), v3 (edit3) = 3 versions
    expect(afterNewEdit.versions).toHaveLength(3)
    expect(canRedo(afterNewEdit)).toBe(false)
    expect(afterNewEdit.currentSpec.sections[2].title).toBe('Edit 3')
  })

  it('returns version history', () => {
    const state = createProjectState({
      initialSpec: restaurantWebsite,
    })

    const newSpec = {
      ...restaurantWebsite,
      sections: restaurantWebsite.sections.map((s) =>
        s.type === 'hero' ? { ...s, title: 'Edited' } : s,
      ),
    }

    const afterEdit = applyEdit(state, newSpec, 'Edit').state

    const history = getVersionHistory(afterEdit)
    expect(history).toHaveLength(2)
    expect(history[0].version).toBe(1)
    expect(history[1].version).toBe(2)
    // Ensure spec is cloned, not same reference
    expect(history[0].spec).not.toBe(state.versions[0].spec)
  })

  it('restores a specific version', () => {
    const state = createProjectState({
      initialSpec: restaurantWebsite,
    })

    const edit1 = {
      ...restaurantWebsite,
      sections: restaurantWebsite.sections.map((s) =>
        s.type === 'hero' ? { ...s, title: 'Edit 1' } : s,
      ),
    }

    const edit2 = {
      ...edit1,
      sections: edit1.sections.map((s) =>
        s.type === 'features' ? { ...s, title: 'Edit 2' } : s,
      ),
    }

    const afterEdits = applyEdit(
      applyEdit(state, edit1, 'E1').state,
      edit2,
      'E2',
    ).state

    const restored = restoreVersion(afterEdits, 1).state
    expect(restored.currentSpec).toEqual(restaurantWebsite)
    expect(restored.currentVersionIndex).toBe(0)
  })

  it('returns error when restoring non-existent version', () => {
    const state = createProjectState({
      initialSpec: restaurantWebsite,
    })

    const result = restoreVersion(state, 999)
    expect(result.error).toBeDefined()
    expect(result.state).toBe(state)
  })
})
