"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { type Editor } from '@tiptap/react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TableEdgeControlsProps {
    editor: Editor | null
}

export const TableEdgeControls = ({ editor }: TableEdgeControlsProps) => {
    const [rowPos, setRowPos] = useState<{ top: number; left: number; index: number } | null>(null)
    const [colPos, setColPos] = useState<{ top: number; left: number; index: number } | null>(null)

    const updateControls = useCallback(() => {
        if (!editor || !editor.isActive('table')) {
            setRowPos(null)
            setColPos(null)
            return
        }

        const { state, view } = editor
        const { selection } = state

        // Find the table node
        let tableNodePos = -1
        let tableElement: HTMLElement | null = null

        const $pos = selection.$anchor
        for (let d = $pos.depth; d > 0; d--) {
            if ($pos.node(d).type.name === 'table') {
                tableNodePos = $pos.before(d)
                break
            }
        }

        if (tableNodePos === -1) return

        tableElement = view.nodeDOM(tableNodePos) as HTMLElement
        if (!tableElement) return

        const rect = tableElement.getBoundingClientRect()
        const editorRect = view.dom.parentElement?.getBoundingClientRect()
        if (!editorRect) return

        // For simplicity, we'll just show markers for the current row/col
        // A more advanced version would track hover

        // Let's find the current cell's position
        let cellNodePos = -1
        for (let d = $pos.depth; d > 0; d--) {
            if ($pos.node(d).type.name === 'tableCell' || $pos.node(d).type.name === 'tableHeader') {
                cellNodePos = $pos.before(d)
                break
            }
        }

        if (cellNodePos !== -1) {
            const cellElement = view.nodeDOM(cellNodePos) as HTMLElement
            if (cellElement) {
                const cellRect = cellElement.getBoundingClientRect()

                // Row Control (Left side of cell)
                setRowPos({
                    top: cellRect.top - editorRect.top + cellRect.height / 2,
                    left: rect.left - editorRect.left - 24,
                    index: 0 // logic for index would be needed for insertion
                })

                // Col Control (Top of cell)
                setColPos({
                    top: rect.top - editorRect.top - 24,
                    left: cellRect.left - editorRect.left + cellRect.width / 2,
                    index: 0
                })
            }
        }
    }, [editor])

    useEffect(() => {
        if (!editor) return

        editor.on('selectionUpdate', updateControls)
        editor.on('transaction', updateControls)
        window.addEventListener('resize', updateControls)

        return () => {
            editor.off('selectionUpdate', updateControls)
            editor.off('transaction', updateControls)
            window.removeEventListener('resize', updateControls)
        }
    }, [editor, updateControls])

    if (!editor || !editor.isActive('table')) return null

    return (
        <>
            {rowPos && (
                <div
                    className="absolute pointer-events-auto z-50 transition-all duration-200"
                    style={{ top: rowPos.top, left: rowPos.left, transform: 'translateY(-50%)' }}
                >
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-5 w-5 rounded-full shadow-md bg-primary text-primary-foreground hover:scale-110 p-0"
                        onClick={() => editor.chain().focus().addRowAfter().run()}
                        title="在下方添加行"
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            )}
            {colPos && (
                <div
                    className="absolute pointer-events-auto z-50 transition-all duration-200"
                    style={{ top: colPos.top, left: colPos.left, transform: 'translateX(-50%)' }}
                >
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-5 w-5 rounded-full shadow-md bg-primary text-primary-foreground hover:scale-110 p-0"
                        onClick={() => editor.chain().focus().addColumnAfter().run()}
                        title="在右侧添加列"
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            )}
        </>
    )
}
