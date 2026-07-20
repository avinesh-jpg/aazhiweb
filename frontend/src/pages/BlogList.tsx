import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Clock, Search, Tag, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  tags: string[];
  author: string;
  readTime: string;
  createdAt: string;
}

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API_URL}/blog`);
      const data = await response.json();
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique list of tags across all blogs
  const allTags = Array.from(
    new Set(blogs.flatMap(blog => blog.tags || []))
  ).filter(tag => tag && tag.trim() !== '');

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = selectedTag ? blog.tags.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  const getImageUrl = (url: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=600&auto=format&fit=crop'; // default baby photo
    if (url.startsWith('http')) return url;
    return `${API_URL.replace('/api', '')}${url}`;
  };

  return (
    <>
      <Helmet>
        <title>Blog | Aazhi – Baby Clothing Guides & Parenting Stories</title>
        <meta name="description" content="Explore Aazhi's blog for parenting tips, baby clothing guides, organic fabric choices, and behind-the-scenes stories from India's textile capital, Tiruppur." />
        <meta name="keywords" content="baby care, organic baby clothes, parenting blog, Tiruppur cotton, kids styling tips" />
      </Helmet>

      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-[#0f0e1a] via-[#1a1a2e] to-[#16213e] pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-[1320px] mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-3">
              <div className="h-1 w-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mx-auto"></div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-['Cormorant_Garamond',serif] font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Aazhi Stories & Insights
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Your source for parenting insights, baby skin health, organic fabric guides, and direct stories from the weavers and makers of Tiruppur knitwear.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors text-sm"
              />
            </div>

            {/* Tag Filters */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-300 ${
                  !selectedTag 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                All Articles
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-300 ${
                    selectedTag === tag 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden animate-pulse">
                  <div className="h-56 bg-white/10"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-white/10 rounded w-1/4"></div>
                    <div className="h-6 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-gray-400 text-lg mb-2">No articles found</p>
              <p className="text-gray-500 text-sm">Try broadening your search term or selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <article 
                  key={blog._id} 
                  onClick={() => navigate(`/blog/${blog.slug}`)}
                  className="group cursor-pointer bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1.5"
                >
                  {/* Image container */}
                  <div className="h-56 overflow-hidden relative">
                    <img 
                      src={getImageUrl(blog.coverImage)} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    {blog.tags && blog.tags.length > 0 && (
                      <span className="absolute top-4 left-4 bg-purple-600/90 text-white text-[0.65rem] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-purple-400/20">
                        {blog.tags[0]}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col justify-between h-[230px]">
                    <div>
                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-purple-400" />
                          {new Date(blog.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-blue-400" />
                          {blog.readTime}
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                        {blog.title}
                      </h2>
                      
                      {/* Excerpt */}
                      <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed mb-4">
                        {blog.summary}
                      </p>
                    </div>

                    {/* Footer link */}
                    <div className="flex items-center gap-1 text-xs font-semibold text-purple-300 group-hover:text-purple-400 group-hover:translate-x-1.5 transition-all">
                      Read Article <ArrowRight size={14} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BlogList;
