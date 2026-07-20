import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, Eye, EyeOff, Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  tags: string[];
  author: string;
  status: 'draft' | 'published';
  readTime: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BlogManager: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    coverImage: '',
    tagsString: '',
    author: 'Admin',
    status: 'published' as 'draft' | 'published'
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`${API_URL}/blog/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (error) {
      console.error('Fetch blogs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug || '',
      summary: blog.summary,
      content: blog.content,
      coverImage: blog.coverImage || '',
      tagsString: blog.tags ? blog.tags.join(', ') : '',
      author: blog.author || 'Admin',
      status: blog.status || 'published'
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      const token = localStorage.getItem('admin_token');
      try {
        const response = await fetch(`${API_URL}/blog/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          fetchBlogs();
        }
      } catch (error) {
        console.error('Delete blog error:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const url = editingBlog ? `${API_URL}/blog/${editingBlog._id}` : `${API_URL}/blog`;
    const method = editingBlog ? 'PUT' : 'POST';

    // Parse tags string into array
    const tags = formData.tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const payload = {
      title: formData.title,
      slug: formData.slug,
      summary: formData.summary,
      content: formData.content,
      coverImage: formData.coverImage,
      tags,
      author: formData.author,
      status: formData.status
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.success) {
        fetchBlogs();
        setShowModal(false);
        resetForm();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Save blog error:', error);
    }
  };

  const resetForm = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      slug: '',
      summary: '',
      content: '',
      coverImage: '',
      tagsString: '',
      author: 'Admin',
      status: 'published'
    });
  };

  // Helper to insert HTML tags at textarea selection
  const insertHTMLTag = (openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(startPos, endPos);
    
    const replacement = openTag + selectedText + closeTag;
    const newContent = text.substring(0, startPos) + replacement + text.substring(endPos);
    
    setFormData({ ...formData, content: newContent });
    
    // Reset focus and cursor pos
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = startPos + openTag.length;
      textarea.selectionEnd = startPos + openTag.length + selectedText.length;
    }, 50);
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL.replace('/api', '')}${url}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading blog posts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Blog Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Blog Post
        </button>
      </div>

      {/* Blogs List Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Read Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {blog.coverImage ? (
                      <img src={getImageUrl(blog.coverImage)} alt={blog.title} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        <ImageIcon size={18} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={blog.title}>
                      {blog.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500 max-w-[120px] truncate" title={blog.slug}>
                    {blog.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {blog.author}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {blog.tags?.map((tag, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 text-[10px] bg-purple-50 text-purple-700 rounded border border-purple-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${
                      blog.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {blog.status === 'published' ? <Eye size={12} /> : <EyeOff size={12} />}
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {blog.readTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleEdit(blog)} 
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Post"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(blog._id)} 
                        className="text-red-600 hover:text-red-900"
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No blog posts yet. Click "Add Blog Post" to create your first article.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                {editingBlog ? 'Edit Blog Post' : 'Add Blog Post'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 5 Benefits of Organic Kids Wear"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (Custom URL) <span className="text-gray-400 text-xs">(Optional - auto-generated if blank)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    placeholder="e.g. 5-benefits-organic-kids-wear"
                  />
                </div>
              </div>

              {/* Row 2: Author, Tags, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="text-gray-400 text-xs">(comma-separated)</span></label>
                  <input
                    type="text"
                    value={formData.tagsString}
                    onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Parenting, Organic Cotton, Tiruppur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="published">Published (Visible on site)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <ImageUpload 
                  onUpload={(url) => setFormData({ ...formData, coverImage: url })}
                  onRemove={() => setFormData({ ...formData, coverImage: '' })}
                  multiple={false}
                  existingImages={formData.coverImage ? [formData.coverImage] : []}
                />
              </div>

              {/* Row 4: Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary / Lead Paragraph *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Provide a brief summary that appears on the list card and details lead section."
                />
              </div>

              {/* Row 5: Content Body with HTML Helper Toolbar */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="block text-sm font-medium text-gray-700">Content (HTML formatted) *</label>
                  
                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 border border-gray-200 p-1.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => insertHTMLTag('<strong>', '</strong>')}
                      className="px-2 py-0.5 text-xs font-bold bg-white border rounded hover:bg-gray-100 transition"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHTMLTag('<em>', '</em>')}
                      className="px-2 py-0.5 text-xs italic bg-white border rounded hover:bg-gray-100 transition"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHTMLTag('<h2>', '</h2>')}
                      className="px-2 py-0.5 text-xs font-semibold bg-white border rounded hover:bg-gray-100 transition"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHTMLTag('<h3>', '</h3>')}
                      className="px-2 py-0.5 text-xs font-semibold bg-white border rounded hover:bg-gray-100 transition"
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHTMLTag('<a href="https://">', '</a>')}
                      className="px-2 py-0.5 text-xs text-blue-600 bg-white border rounded hover:bg-gray-100 transition"
                      title="Link"
                    >
                      Link
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHTMLTag('<blockquote>', '</blockquote>')}
                      className="px-2 py-0.5 text-xs font-serif bg-white border rounded hover:bg-gray-100 transition"
                      title="Quote"
                    >
                      Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHTMLTag('<ul>\n  <li>', '</li>\n  <li>Second Item</li>\n</ul>')}
                      className="px-2 py-0.5 text-xs bg-white border rounded hover:bg-gray-100 transition"
                      title="Unordered List"
                    >
                      Bullet List
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHTMLTag('<br />', '')}
                      className="px-2 py-0.5 text-xs bg-white border rounded hover:bg-gray-100 transition"
                      title="Line Break"
                    >
                      Line Break
                    </button>
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  required
                  rows={12}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  placeholder="Write your blog post content here. Use the toolbar buttons above to apply formatting."
                />
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Sparkles size={12} className="text-purple-500" />
                  Supports standard HTML tags. Select text and click the buttons above to format instantly.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-sm"
                >
                  {editingBlog ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManager;
