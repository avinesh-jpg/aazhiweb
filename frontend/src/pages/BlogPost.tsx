// src/pages/BlogPost.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Clock, ArrowLeft, User, Share2, Copy, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  tags: string[];
  author: string;
  readTime: string;
  createdAt: string;
}

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchPostAndRecent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/blog/slug/${slug}`);
      const data = await response.json();
      if (data.success) {
        setBlog(data.blog);
      } else {
        setBlog(null);
      }

      const listResponse = await fetch(`${API_URL}/blog`);
      const listData = await listResponse.json();
      if (listData.success) {
        const filtered = listData.blogs
          .filter((b: Blog) => b.slug !== slug)
          .slice(0, 3);
        setRecentBlogs(filtered);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndRecent();
    window.scrollTo(0, 0);
  }, [slug]);

  const getImageUrl = (url: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=1200&auto=format&fit=crop';
    if (url.startsWith('http')) return url;
    return `${API_URL.replace('/api', '')}${url}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0e1a]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#0f0e1a] flex flex-col items-center justify-center pt-24 px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Post Not Found</h2>
          <p className="text-gray-400 mb-8 max-w-md">
            The article you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Link 
            to="/blog" 
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all"
          >
            Back to Blog
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.title} | Aazhi Blog</title>
        <meta name="description" content={blog.summary} />
        <meta name="keywords" content={blog.tags?.join(', ')} />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:site_name" content="Aazhi" />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.summary} />
        <meta property="og:image" content={getImageUrl(blog.coverImage)} />
        <meta property="og:image:secure_url" content={getImageUrl(blog.coverImage)} />
        <meta property="og:image:alt" content={blog.title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.summary} />
        <meta name="twitter:image" content={getImageUrl(blog.coverImage)} />
        <meta name="twitter:site" content="@Aazhi" />

        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <Navbar />

      <style>{`
        .blog-content-body {
          color: #d1d5db;
          font-size: 1.05rem;
          line-height: 1.8;
          width: 100%;
          max-width: 100%;
        }
        .blog-content-body p {
          margin-bottom: 1.5rem;
          width: 100%;
          max-width: 100%;
        }
        .blog-content-body h2 {
          color: #ffffff;
          font-size: 1.6rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-family: 'Cormorant Garamond', serif;
          width: 100%;
        }
        .blog-content-body h3 {
          color: #ffffff;
          font-size: 1.3rem;
          font-weight: 600;
          margin-top: 1.8rem;
          margin-bottom: 0.8rem;
          font-family: 'Cormorant Garamond', serif;
          width: 100%;
        }
        .blog-content-body ul, 
        .blog-content-body ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
          width: 100%;
        }
        .blog-content-body ul {
          list-style-type: disc;
        }
        .blog-content-body ol {
          list-style-type: decimal;
        }
        .blog-content-body li {
          margin-bottom: 0.5rem;
          width: 100%;
        }
        .blog-content-body blockquote {
          border-left: 4px solid #a855f7;
          background: rgba(168, 85, 247, 0.06);
          padding: 1rem 1.25rem;
          border-radius: 0 0.75rem 0.75rem 0;
          font-style: italic;
          margin: 1.75rem 0;
          color: #e5e7eb;
          width: 100%;
        }
        .blog-content-body img {
          border-radius: 12px;
          margin: 2rem auto;
          display: block;
          max-width: 100%;
          max-height: 550px;
          height: auto;
          object-fit: contain;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .blog-content-body strong {
          color: #ffffff;
          font-weight: 600;
        }
        .blog-content-body a {
          color: #c084fc;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .blog-content-body a:hover {
          color: #d8b4fe;
        }

        /* 💡 Structural Content Helper Classes */
        .blog-content-body .tip-box,
        .blog-content-body .note-box {
          background: rgba(168, 85, 247, 0.08);
          border-left: 4px solid #a855f7;
          padding: 1.25rem 1.5rem;
          border-radius: 0 0.75rem 0.75rem 0;
          margin: 2rem 0;
          color: #f3f4f6;
        }
        .blog-content-body .info-box {
          background: rgba(59, 130, 246, 0.08);
          border-left: 4px solid #3b82f6;
          padding: 1.25rem 1.5rem;
          border-radius: 0 0.75rem 0.75rem 0;
          margin: 2rem 0;
          color: #f3f4f6;
        }
        .blog-content-body .card-box {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 1rem;
          margin: 2rem 0;
        }
        .blog-content-body .grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }
        .blog-content-body .blog-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: #ffffff !important;
          font-weight: 600;
          border-radius: 0.5rem;
          text-decoration: none !important;
          margin: 1.5rem 0;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);
        }
        .blog-content-body .blog-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
        }
        .blog-content-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .blog-content-body th {
          background: rgba(139, 92, 246, 0.2);
          color: #ffffff;
          padding: 0.85rem 1rem;
          text-align: left;
          font-weight: 700;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }
        .blog-content-body td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          color: #e5e7eb;
        }
        .blog-content-body tr:hover td {
          background: rgba(255, 255, 255, 0.03);
        }

        .blog-content-body div,
        .blog-content-body section,
        .blog-content-body article {
          width: 100%;
          max-width: 100%;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-[#0f0e1a] via-[#1a1a2e] to-[#16213e] pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-[1320px] mx-auto relative z-10">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gray-400 hover:text-purple-300 transition-colors mb-8 text-sm group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Articles
          </button>

          <div className="w-full">
            <main className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden mb-12">
              
              {/* Blog Header info */}
              <header className="mb-8">
                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-['Cormorant_Garamond',serif] font-bold text-white mb-6 leading-tight">
                  {blog.title}
                </h1>

                {/* Author & Date Metainfo */}
                <div className="flex flex-wrap items-center gap-6 py-4 border-y border-white/10 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {blog.author.slice(0, 1).toUpperCase()}
                    </div>
                    <span>
                      Written by <strong className="text-white">{blog.author}</strong>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-purple-400" />
                    <span>
                      {new Date(blog.createdAt).toLocaleDateString(undefined, { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-400" />
                    <span>{blog.readTime}</span>
                  </div>

                  {/* Share button */}
                  <button 
                    onClick={handleCopyLink}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-green-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </header>

              {/* Cover Image */}
              <div className="w-full rounded-2xl border border-white/10 overflow-hidden mb-8 shadow-xl bg-slate-900">
                <img 
                  src={getImageUrl(blog.coverImage)} 
                  alt={blog.title} 
                  className="w-full h-[280px] sm:h-[380px] md:h-[460px] lg:h-[520px] object-cover object-center block"
                />
              </div>

              {/* Summary / Lead Paragraph */}
              <div className="text-lg text-gray-200 border-l-4 border-purple-500 pl-4 py-1 italic mb-8 bg-purple-500/5 rounded-r-xl">
                {blog.summary}
              </div>

              {/* Blog Content body - FULL WIDTH */}
              <div 
                className="blog-content-body w-full"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </main>

            {/* Read Next / Recent Articles Section */}
            {recentBlogs.length > 0 && (
              <div className="border-t border-white/10 pt-10">
                <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-white mb-6">
                  Read Next
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recentBlogs.map((b) => (
                    <Link 
                      key={b._id} 
                      to={`/blog/${b.slug}`}
                      className="group bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 shadow-sm"
                    >
                      <div>
                        <div className="h-40 rounded-xl overflow-hidden mb-3 border border-white/5">
                          <img 
                            src={getImageUrl(b.coverImage)} 
                            alt={b.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-200 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug mb-2">
                          {b.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {b.readTime}
                        </span>
                        <span className="text-purple-300 font-medium group-hover:underline">Read Post →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BlogPost;