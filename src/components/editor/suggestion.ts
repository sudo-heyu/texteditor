import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { SlashCommandList } from './SlashCommandList'

export const suggestion = {
    items: ({ query }: { query: string }) => {
        return [
            'heading 1',
            'heading 2',
            'heading 3',
            'bullet list',
            'ordered list',
            'blockquote',
            'code block',
            'table',
        ].filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
    },

    render: () => {
        let component: any
        let popup: any

        return {
            onStart: (props: any) => {
                component = new ReactRenderer(SlashCommandList, {
                    props,
                    editor: props.editor,
                })

                if (!props.clientRect) {
                    return
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                })
            },

            onUpdate(props: any) {
                component.updateProps(props)

                if (!props.clientRect) {
                    return
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                })
            },

            onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                    popup[0].hide()
                    return true
                }

                return component.ref?.onKeyDown(props)
            },

            onExit() {
                popup[0].destroy()
                component.destroy()
            },
        }
    },
}
