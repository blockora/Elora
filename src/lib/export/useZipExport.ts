import { useCallback, useState } from 'react'
import { generateExportProject } from './projectGenerator'
import { generateZip, downloadZip, validateExportProject } from './zipGenerator'
import type { WebsiteSpec } from '../../features/website/schema'

export interface UseZipExportResult {
  isDownloading: boolean
  progress: number
  error: string | null
  downloadZipFile: (spec: WebsiteSpec, projectName: string) => Promise<void>
  reset: () => void
}

export function useZipExport(): UseZipExportResult {
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const downloadZipFile = useCallback(
    async (spec: WebsiteSpec, projectName: string) => {
      setIsDownloading(true)
      setProgress(0)
      setError(null)

      try {
        // Generate the project structure
        setProgress(10)
        const project = generateExportProject(spec, projectName)

        // Validate before creating ZIP
        setProgress(20)
        const validation = validateExportProject(project)
        if (!validation.valid) {
          throw new Error(
            `Export validation failed: ${validation.errors.join('; ')}`,
          )
        }

        // Generate ZIP
        setProgress(30)
        const zipBlob = await generateZip(project)
        setProgress(100)

        // Download the file
        await downloadZip(zipBlob, project.name)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to generate ZIP file',
        )
        throw err
      } finally {
        setIsDownloading(false)
      }
    },
    [],
  )

  const reset = useCallback(() => {
    setIsDownloading(false)
    setProgress(0)
    setError(null)
  }, [])

  return {
    isDownloading,
    progress,
    error,
    downloadZipFile,
    reset,
  }
}
