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
          padding-left: 1rem;
          font-style: italic;
          margin: 1.5rem 0;
          color: #9ca3af;
          width: 100%;
        }
        .blog-content-body img {
          border-radius: 12px;
          margin: 2rem 0;
          max-width: 100%;
          height: auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
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

          {/* REMOVED max-w-4xl constraint - NOW FULL WIDTH */}
          <div className="w-full">
            <main className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden mb-12">
              
              {/* Blog Header info */}
              <header className="mb-8">
                {/* Tags */}
                

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
              <div className="rounded-2xl border border-white/10 overflow-hidden mb-8 h-[240px] sm:h-[350px] md:h-[450px]">
                <img 
                  src={getImageUrl(blog.coverImage)} 
                  alt={blog.title} 
                  className="w-full h-full object-cover"
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