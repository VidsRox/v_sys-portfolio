'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import React, { useCallback, useRef, useState } from 'react'

const lowlight = createLowlight(common)

// Register mermaid as a language so code blocks can use it
lowlight.register('mermaid', () => ({
  name: 'mermaid',
  contains: [],
}))

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // we use CodeBlockLowlight instead
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Start writing...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'editor-code-block',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            uploadImage(file)
            return true
          }
        }
        return false
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
              event.preventDefault()
              const file = item.getAsFile()
              if (file) uploadImage(file)
              return true
            }
          }
        }
        return false
      },
    },
  })

  const uploadImage = useCallback(async (file: File) => {
    if (!editor) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        editor.chain().focus().setImage({ src: url }).run()
      } else {
        const { error } = await res.json()
        alert(error ?? 'Upload failed')
      }
    } catch {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }, [editor])

  const handleImageClick = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadImage(file)
    e.target.value = ''
  }

  const insertMermaidBlock = () => {
    if (!editor) return
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'codeBlock',
        attrs: { language: 'mermaid' },
        content: [{ type: 'text', text: 'graph TD\n    A[Start] --> B[Process]\n    B --> C[End]' }],
      })
      .run()
  }

  const addLink = () => {
    if (!editor) return
    const url = window.prompt('URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImageByUrl = () => {
    if (!editor) return
    const url = window.prompt('Image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  if (!editor) return null

  return (
    <div className="tiptap-wrapper">
      {/* Toolbar */}
      <div className="tiptap-toolbar">
        <div className="tiptap-toolbar-group">
          <ToolbarBtn
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            H2
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            H3
          </ToolbarBtn>
        </div>

        <div className="tiptap-toolbar-sep" />

        <div className="tiptap-toolbar-group">
          <ToolbarBtn
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            B
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <em>I</em>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <s>S</s>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Inline Code"
          >
            {'</>'}
          </ToolbarBtn>
        </div>

        <div className="tiptap-toolbar-sep" />

        <div className="tiptap-toolbar-group">
          <ToolbarBtn
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            •&thinsp;List
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Ordered List"
          >
            1.&thinsp;List
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          >
            &ldquo;&thinsp;Quote
          </ToolbarBtn>
        </div>

        <div className="tiptap-toolbar-sep" />

        <div className="tiptap-toolbar-group">
          <ToolbarBtn
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block"
          >
            Code
          </ToolbarBtn>
          <ToolbarBtn active={false} onClick={insertMermaidBlock} title="Insert Mermaid Diagram">
            ◇ Diagram
          </ToolbarBtn>
          <ToolbarBtn
            active={false}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            ―
          </ToolbarBtn>
        </div>

        <div className="tiptap-toolbar-sep" />

        <div className="tiptap-toolbar-group">
          <ToolbarBtn active={editor.isActive('link')} onClick={addLink} title="Insert Link">
            Link
          </ToolbarBtn>
          <ToolbarBtn active={false} onClick={handleImageClick} title="Upload Image">
            {uploading ? 'Uploading...' : '⬆ Image'}
          </ToolbarBtn>
          <ToolbarBtn active={false} onClick={addImageByUrl} title="Image from URL">
            🔗 Image
          </ToolbarBtn>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Bubble menu for links */}
      {/* {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="tiptap-bubble">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'active' : ''}
            >
              B
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'active' : ''}
            >
              I
            </button>
            <button onClick={addLink}>Link</button>
            {editor.isActive('link') && (
              <button onClick={() => editor.chain().focus().unsetLink().run()}>
                Unlink
              </button>
            )}
          </div>
        </BubbleMenu>
      )} */}

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Styles */}
      <style>{`
        .tiptap-wrapper {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--bg);
          overflow: hidden;
        }

        .tiptap-toolbar {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          flex-wrap: wrap;
        }

        .tiptap-toolbar-group {
          display: flex;
          gap: 2px;
        }

        .tiptap-toolbar-sep {
          width: 1px;
          height: 20px;
          background: var(--border);
          margin: 0 4px;
        }

        .tiptap-toolbar button {
          background: transparent;
          border: 1px solid transparent;
          color: var(--muted);
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-family: 'DM Mono', monospace;
          cursor: pointer;
          transition: all .15s;
          white-space: nowrap;
        }
        .tiptap-toolbar button:hover {
          color: var(--text);
          background: rgba(255,255,255,.05);
        }
        .tiptap-toolbar button.active {
          color: var(--accent);
          background: rgba(200, 245, 66, .08);
          border-color: rgba(200, 245, 66, .2);
        }

        .tiptap-bubble {
          display: flex;
          gap: 2px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 4px;
          box-shadow: 0 8px 24px rgba(0,0,0,.4);
        }
        .tiptap-bubble button {
          background: transparent;
          border: none;
          color: var(--muted);
          padding: 4px 10px;
          border-radius: 3px;
          font-size: 12px;
          font-family: 'DM Mono', monospace;
          cursor: pointer;
        }
        .tiptap-bubble button:hover { color: var(--text); background: rgba(255,255,255,.06); }
        .tiptap-bubble button.active { color: var(--accent); }

        .tiptap-editor-content {
          padding: 20px 24px;
          min-height: 320px;
          outline: none;
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          line-height: 1.8;
          color: var(--text);
        }

        .tiptap-editor-content > *:first-child { margin-top: 0; }

        .tiptap-editor-content h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.5em;
          color: var(--text);
          margin: 1.6em 0 .5em;
          letter-spacing: -.02em;
        }
        .tiptap-editor-content h3 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.2em;
          color: var(--text);
          margin: 1.4em 0 .4em;
        }

        .tiptap-editor-content p { margin-bottom: 1em; }

        .tiptap-editor-content strong { color: var(--text); }
        .tiptap-editor-content em { color: #ccc; }

        .tiptap-editor-content a,
        .tiptap-editor-content .editor-link {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
        }

        .tiptap-editor-content code {
          font-family: 'DM Mono', monospace;
          font-size: .88em;
          background: #1a1a1a;
          border: 1px solid var(--border);
          color: var(--accent);
          padding: 2px 6px;
          border-radius: 3px;
        }

        .tiptap-editor-content pre {
          background: #111;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 20px 24px;
          overflow-x: auto;
          margin: 1.2em 0;
          position: relative;
        }
        .tiptap-editor-content pre code {
          background: none;
          border: none;
          padding: 0;
          font-size: 13px;
          color: #ccc;
          border-radius: 0;
        }

        /* Mermaid code blocks get a visual indicator */
        .tiptap-editor-content pre[class*="language-mermaid"]::before,
        .tiptap-editor-content pre:has(code.language-mermaid)::before {
          content: '◇ MERMAID DIAGRAM';
          display: block;
          font-size: 10px;
          letter-spacing: .12em;
          color: var(--accent);
          margin-bottom: 12px;
          opacity: .7;
        }

        .tiptap-editor-content blockquote {
          border-left: 3px solid var(--accent);
          margin: 1.2em 0;
          padding: 4px 0 4px 20px;
          color: var(--muted);
          font-style: italic;
        }

        .tiptap-editor-content ul,
        .tiptap-editor-content ol {
          padding-left: 1.6em;
          margin-bottom: 1em;
        }
        .tiptap-editor-content li { margin-bottom: .3em; }
        .tiptap-editor-content ul li::marker { color: var(--accent); }

        .tiptap-editor-content hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 2em 0;
        }

        .tiptap-editor-content img,
        .tiptap-editor-content .editor-image {
          max-width: 100%;
          border-radius: 6px;
          border: 1px solid var(--border);
          margin: 1.2em 0;
          display: block;
        }

        /* Placeholder */
        .tiptap-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #444;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  )
}

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={active ? 'active' : ''}
    >
      {children}
    </button>
  )
}