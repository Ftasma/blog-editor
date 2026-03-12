"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PenLine,
  Image as ImageIcon,
  User,
  Hash,
  Type,
  AlignLeft,
  CheckCircle2,
  XCircle,
  Save,
  Upload,
  Loader2,
  List,
  Plus,
  Edit,
  Trash2,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImagePlus
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Utility for cleaner class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Custom Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label: string;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, label, ...props }, ref) => {
    return (
      <div className="relative group w-full">
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400">
          {label}
        </label>
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-zinc-400 transition-colors group-focus-within:text-indigo-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-900",
              icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
      </div>
    )
  }
)
Input.displayName = 'Input'

// Custom Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="relative group w-full h-full flex flex-col">
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400">
          {label}
        </label>
        <textarea
          ref={ref}
          className={cn(
            "w-full flex-1 rounded-xl border border-zinc-200 bg-white/50 p-4 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-900 resize-none",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// --- Main Blog Form ---
export default function BlogWriterPage() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author_name: 'Editorial Team',
    author_role: 'ShineBrite Entertainment',
    author_avatar_url: '',
    featured_image_url: '',
    is_published: false
  })

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Post saved successfully!')
  const [isHoveringSave, setIsHoveringSave] = useState(false)
  const [isUploading, setIsUploading] = useState<{ avatar: boolean; featured: boolean; inline: boolean }>({
    avatar: false,
    featured: false,
    inline: false
  })
  const contentRef = useRef<HTMLTextAreaElement>(null)

  // New State for List View
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list')
  const [blogs, setBlogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Fetch blogs on load
  useEffect(() => {
    if (viewMode === 'list') {
      fetchBlogs()
    }
  }, [viewMode])

  const fetchBlogs = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching blogs:', error.message)
    else setBlogs(data || [])
    setIsLoading(false)
  }

  const handleEdit = (blog: any) => {
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      author_name: blog.author_name || 'Editorial Team',
      author_role: blog.author_role || 'ShineBrite Entertainment',
      author_avatar_url: blog.author_avatar_url || '',
      featured_image_url: blog.featured_image_url || '',
      is_published: blog.is_published || false
    })
    setEditingId(blog.id)
    setViewMode('editor')
  }

  const handleCreateNew = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author_name: 'Editorial Team',
      author_role: 'ShineBrite Entertainment',
      author_avatar_url: '',
      featured_image_url: '',
      is_published: false
    })
    setEditingId(null)
    setViewMode('editor')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    const { error } = await supabase.from('blogs').delete().eq('id', id)
    if (error) {
      alert(`Error deleting: ${error.message}`)
    } else {
      fetchBlogs()
    }
  }

  // Auto-generate slug from title (only if creating new)
  useEffect(() => {
    if (formData.title && !editingId) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setFormData(prev => ({ ...prev, slug: generatedSlug }))
    }
  }, [formData.title, editingId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'featured') => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(prev => ({ ...prev, [type]: true }))

    try {
      // 1. Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `uploads/${fileName}`

      // 2. Upload to Supabase bucket (assuming bucket name is 'images')
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (error) {
        console.error('Supabase upload error:', error.message)
        alert('Failed to upload image. Make sure bucket "images" exists and is public.')
        return
      }

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      // 4. Update Form Data
      setFormData(prev => ({
        ...prev,
        [type === 'avatar' ? 'author_avatar_url' : 'featured_image_url']: publicUrl
      }))

    } catch (err) {
      console.error(err)
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }))
      if (e.target) e.target.value = ''
    }
  }

  const insertAtCursor = (text: string) => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentContent = formData.content

    const newContent =
      currentContent.substring(0, start) +
      text +
      currentContent.substring(end)

    setFormData(prev => ({ ...prev, content: newContent }))

    // Reset focus and cursor position after state update
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const handleToolbarAction = (type: string) => {
    switch (type) {
      case 'h1': insertAtCursor('\n# '); break
      case 'h2': insertAtCursor('\n## '); break
      case 'h3': insertAtCursor('\n### '); break
      case 'bold': insertAtCursor('**bold text**'); break
      case 'italic': insertAtCursor('*italic text*'); break
      case 'list': insertAtCursor('\n- '); break
      case 'link': insertAtCursor('[link text](url)'); break
    }
  }

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(prev => ({ ...prev, inline: true }))

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `inline_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `uploads/inline/${fileName}`

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      insertAtCursor(`\n![Image](${publicUrl})\n`)
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`)
    } finally {
      setIsUploading(prev => ({ ...prev, inline: false }))
      if (e.target) e.target.value = ''
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const input = document.createElement('input')
      input.type = 'file'
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
      handleInlineImageUpload({ target: input } as any)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    // Construct exact JSON payload for DB
    const payload = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      author_name: formData.author_name || null,
      author_role: formData.author_role || null,
      author_avatar_url: formData.author_avatar_url || null,
      featured_image_url: formData.featured_image_url || null,
      is_published: formData.is_published
    }

    try {
      let error

      if (editingId) {
        // Update existing
        const { error: updateError } = await supabase
          .from('blogs')
          .update(payload)
          .eq('id', editingId)
        error = updateError
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('blogs')
          .insert([payload])
        error = insertError
      }

      if (error) {
        console.error('Error saving to database:', error.message)
        alert(`Database error: ${error.message}`)
        return
      }

      setToastMessage(editingId ? "Post updated successfully!" : "Post created successfully!")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)

      // Go back to list view
      setViewMode('list')

    } catch (err) {
      console.error('Unexpected error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/30">

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent flex items-center gap-3">
              <PenLine className="w-8 h-8 text-indigo-500" />
              Studio Writer
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Craft engaging content for ShineBrite Entertainment.</p>
          </div>

          <div className="flex items-center gap-4">
            {viewMode === 'editor' ? (
              <>
                <button
                  onClick={() => setViewMode('list')}
                  className="px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <List className="w-4 h-4" /> Cancel
                </button>
                <button
                  onMouseEnter={() => setIsHoveringSave(true)}
                  onMouseLeave={() => setIsHoveringSave(false)}
                  onClick={handleSave}
                  className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {editingId ? 'Update Post' : 'Commit to DB'}
                  </span>
                  {/* Button hover effect */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                      isHoveringSave && "animate-pulse"
                    )}
                  />
                </button>
              </>
            ) : (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Create New Post
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-sm flex">

          {viewMode === 'list' && (
            <div className="flex-1 p-6 lg:p-10">
              {isLoading ? (
                <div className="w-full h-40 flex items-center justify-center text-zinc-500">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : blogs.length === 0 ? (
                <div className="w-full h-40 flex flex-col gap-3 items-center justify-center text-zinc-500">
                  <PenLine className="w-8 h-8 opacity-50" />
                  <p>No blog posts found. Create your first one!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="group relative flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-all pt-32 p-5 text-left">

                      {/* Optional Background Image Preview */}
                      {blog.featured_image_url && (
                        <div className="absolute inset-0 h-32 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <img src={blog.featured_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      {!blog.featured_image_url && (
                        <div className="absolute inset-0 h-32 w-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20" />
                      )}

                      <div className="relative mt-2 flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                            blog.is_published
                              ? "bg-green-100/50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
                              : "bg-yellow-100/50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-500 dark:border-yellow-800/50"
                          )}>
                            {blog.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-2 leading-tight">
                          {blog.title}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {blog.excerpt}
                        </p>
                      </div>

                      <div className="relative mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          {blog.author_avatar_url ? (
                            <img src={blog.author_avatar_url} alt="author" className="w-5 h-5 rounded-full" />
                          ) : <User className="w-4 h-4" />}
                          {blog.author_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEdit(blog)} className="p-2 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(blog.id)} className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {viewMode === 'editor' && (
            <div className="flex-1 flex flex-col p-6 lg:p-10">
              <form id="blog-form" className="space-y-6 flex-1 flex flex-col" onSubmit={handleSave}>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Post Title"
                    name="title"
                    placeholder="The Future of Digital Entertainment"
                    icon={<Type className="w-4 h-4" />}
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="URL Slug (Auto-generated)"
                    name="slug"
                    placeholder="the-future-of-digital-entertainment"
                    icon={<Hash className="w-4 h-4" />}
                    value={formData.slug}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Textarea
                  label="Excerpt (2-3 sentences max)"
                  name="excerpt"
                  placeholder="Discover how next-generation streaming is reshaping the way we consume media..."
                  className="min-h-[100px] max-h-[150px]"
                  value={formData.excerpt}
                  onChange={handleChange}
                  required
                />

                <div className="flex-1 flex flex-col min-h-[400px]">
                  {/* Markdown Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 mb-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <button type="button" onClick={() => handleToolbarAction('h1')} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors" title="Heading 1"><Heading1 className="w-4 h-4" /></button>
                    <button type="button" onClick={() => handleToolbarAction('h2')} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors" title="Heading 2"><Heading2 className="w-4 h-4" /></button>
                    <button type="button" onClick={() => handleToolbarAction('h3')} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors" title="Heading 3"><Heading3 className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />
                    <button type="button" onClick={() => handleToolbarAction('bold')} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
                    <button type="button" onClick={() => handleToolbarAction('italic')} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />
                    <button type="button" onClick={() => handleToolbarAction('list')} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors" title="List"><List className="w-4 h-4" /></button>
                    <button type="button" onClick={() => handleToolbarAction('link')} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors" title="Link"><LinkIcon className="w-4 h-4" /></button>

                    <div className="relative overflow-hidden p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer" title="Add Image">
                      <ImagePlus className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleInlineImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isUploading.inline}
                      />
                    </div>
                    {isUploading.inline && <Loader2 className="w-4 h-4 animate-spin text-indigo-500 ml-2" />}
                  </div>

                  <Textarea
                    ref={contentRef}
                    label="Markdown Content"
                    name="content"
                    placeholder="## A New Era of Streaming&#10;&#10;Use markdown syntax here `##` for subheadings, `>` for quotes, etc."
                    className="flex-1 font-mono text-sm leading-relaxed"
                    value={formData.content}
                    onChange={handleChange}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="space-y-6">
                    <Input
                      label="Author Name"
                      name="author_name"
                      placeholder="Editorial Team"
                      icon={<User className="w-4 h-4" />}
                      value={formData.author_name}
                      onChange={handleChange}
                    />
                    <Input
                      label="Author Role"
                      name="author_role"
                      placeholder="ShineBrite Entertainment"
                      icon={<User className="w-4 h-4" />}
                      value={formData.author_role}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="relative group w-full">
                      <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Author Avatar
                      </label>
                      <div className="flex items-center gap-3">
                        {formData.author_avatar_url && (
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0">
                            <img src={formData.author_avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="relative flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'avatar')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            disabled={isUploading.avatar}
                          />
                          <div className={cn(
                            "flex items-center justify-center gap-2 w-full rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 px-4 py-2.5 text-sm transition-all text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800",
                            isUploading.avatar && "opacity-50"
                          )}>
                            {isUploading.avatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {formData.author_avatar_url ? 'Replace Avatar' : 'Upload Avatar'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Featured Image Upload */}
                    <div className="relative group w-full">
                      <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Featured Image
                      </label>
                      <div className="flex flex-col gap-3">
                        {formData.featured_image_url && (
                          <div className="w-full h-32 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                            <img src={formData.featured_image_url} alt="Featured" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="relative w-full">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'featured')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            disabled={isUploading.featured}
                          />
                          <div className={cn(
                            "flex items-center justify-center gap-2 w-full rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 px-4 py-2.5 text-sm transition-all text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800",
                            isUploading.featured && "opacity-50"
                          )}>
                            {isUploading.featured ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {formData.featured_image_url ? 'Replace Image' : 'Upload Featured Image'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Publication Status</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Toggle when ready to push live.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_published"
                      className="sr-only peer"
                      checked={formData.is_published}
                      onChange={handleChange}
                    />
                    <div className="w-14 h-7 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

              </form>
            </div>
          )}

        </div>
      </main>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-full shadow-2xl border border-zinc-800 dark:border-zinc-200"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400 dark:text-green-600" />
            <span className="font-medium text-sm">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.3);
        }
      `}} />
    </div>
  )
}
