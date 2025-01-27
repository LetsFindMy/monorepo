"use client"

import type React from "react"
import { useCallback } from "react"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-typescript"
import "prismjs/themes/prism.css"
import { Box, type BoxProps } from "@mantine/core"
import { useUncontrolled } from "@mantine/hooks"

interface CodeEditorProps extends Omit<BoxProps, "onChange"> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  error?: React.ReactNode
  language: "javascript" | "typescript"
  height?: number | string
  tabSize?: number
  insertSpaces?: boolean
  ignoreTabKey?: boolean
  padding?: number
  textareaId?: string
  textareaClassName?: string
  preClassName?: string
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  defaultValue = "",
  onChange,
  onBlur,
  error,
  language,
  height = 500,
  tabSize = 2,
  insertSpaces = true,
  ignoreTabKey = false,
  padding = 10,
  textareaId,
  textareaClassName,
  preClassName,
  ...boxProps
}) => {
  const [_value, handleChange] = useUncontrolled({
    value,
    defaultValue,
    finalValue: "",
    onChange,
  })

  const handleHighlight = useCallback(
    (code: string) => {
      if (typeof code !== "string" || code.length === 0) {
        return "" // Return empty string if code is undefined, null, or empty
      }
      return highlight(code, languages[language] || languages.javascript, language)
    },
    [language],
  )

  return (
    <Box {...boxProps}>
      <Editor
        value={_value}
        onValueChange={handleChange}
        onBlur={onBlur}
        highlight={handleHighlight}
        padding={padding}
        tabSize={tabSize}
        insertSpaces={insertSpaces}
        ignoreTabKey={ignoreTabKey}
        textareaId={textareaId}
        textareaClassName={textareaClassName}
        preClassName={preClassName}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
          height,
          overflow: "auto",
          border: error ? "1px solid red" : "1px solid #ced4da",
          borderRadius: "4px",
        }}
      />
      {error && <div style={{ color: "red", marginTop: "5px" }}>{error}</div>}
    </Box>
  )
}

