import React, { useState, useRef } from "react";
import { FaUserCircle, FaThumbsUp, FaComment, FaShare, FaPlus, FaEdit } from "react-icons/fa";
import { Modal, Button, Pagination, Input, Textarea } from "react-daisyui";

const CommunityForum = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Coping with Anxiety",
      excerpt: "Here are some tips to manage anxiety...",
      author: "John Doe",
      avatar: "https://avatar.iran.liara.run/public/31",
      date: "2023-10-01",
      category: "Anxiety",
      content:
        "Anxiety can be overwhelming, but there are ways to manage it. Try deep breathing exercises, mindfulness, and talking to a trusted friend or therapist.",
      likes: 12,
      comments: [
        {
          id: 1,
          author: "Jane Smith",
          avatar: "https://avatar.iran.liara.run/public/75",
          comment: "Great advice! Mindfulness has helped me a lot.",
          likes: 3,
        },
      ],
    },
    {
      id: 2,
      title: "Dealing with Depression",
      excerpt: "Understanding and managing depression...",
      author: "Alice Johnson",
      avatar: "https://avatar.iran.liara.run/public/77",
      date: "2023-10-05",
      category: "Depression",
      content:
        "Depression is a serious condition, but it can be managed with therapy, medication, and lifestyle changes. Reach out for help if you're struggling.",
      likes: 8,
      comments: [],
    },
    {
      id: 3,
      title: "Managing Stress at Work",
      excerpt: "Effective strategies for managing workplace stress...",
      author: "Michael Davis",
      avatar: "https://avatar.iran.liara.run/public/83",
      date: "2023-11-10",
      category: "Stress",
      content:
        "Workplace stress is common, but there are ways to cope. Try setting boundaries, practicing time management, and seeking support from colleagues and managers.",
      likes: 15,
      comments: [
        {
          id: 1,
          author: "Emma Brown",
          avatar: "https://avatar.iran.liara.run/public/89",
          comment: "Great tips! Time management has helped me immensely.",
          likes: 5,
        },
      ],
    },
    {
      id: 4,
      title: "Overcoming Social Anxiety",
      excerpt: "Steps to feel more confident in social situations...",
      author: "Sophia Lee",
      avatar: "https://avatar.iran.liara.run/public/44",
      date: "2023-12-01",
      category: "Anxiety",
      content:
        "Social anxiety can be challenging, but it is possible to manage. Start by exposing yourself to social situations gradually and practicing relaxation techniques.",
      likes: 10,
      comments: [],
    },
    {
      id: 5,
      title: "Building Self-Esteem",
      excerpt: "How to boost your self-confidence and self-worth...",
      author: "David Walker",
      avatar: "https://avatar.iran.liara.run/public/55",
      date: "2023-12-12",
      category: "Self-Esteem",
      content:
        "Self-esteem is key to mental health. Try practicing positive self-talk, setting achievable goals, and surrounding yourself with supportive people.",
      likes: 20,
      comments: [
        {
          id: 1,
          author: "Olivia White",
          avatar: "https://avatar.iran.liara.run/public/92",
          comment: "These tips are really helpful! I've been working on my self-worth lately.",
          likes: 7,
        },
      ],
    },
  ]);

  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    excerpt: "",
    author: "Current User",
    avatar: "https://avatar.iran.liara.run/public/40",
    date: new Date().toISOString().split("T")[0],
    category: "General",
    content: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [commentText, setCommentText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = useRef(null);
  const postsPerPage = 6;

  // Available categories for dropdown
  const categories = ["Anxiety", "Depression", "Stress", "Self-Esteem", "General"];

  // Validate form fields
  const validateForm = () => {
    if (!newPost.title.trim()) {
      setErrorMessage("Please enter a title");
      return false;
    }
    if (!newPost.content.trim()) {
      setErrorMessage("Please enter content for your post");
      return false;
    }
    return true;
  };

  // Handle post creation
  const handleCreatePost = () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate network delay for a more realistic experience
    setTimeout(() => {
      const post = {
        id: posts.length + 1,
        title: newPost.title,
        excerpt: newPost.content.substring(0, 100) + (newPost.content.length > 100 ? "..." : ""),
        author: newPost.author || "Current User",
        avatar: newPost.avatar || "https://avatar.iran.liara.run/public/40",
        date: newPost.date || new Date().toISOString().split("T")[0],
        category: newPost.category || "General",
        content: newPost.content,
        likes: 0,
        comments: [],
      };
      
      setPosts([post, ...posts]);
      setIsModalOpen(false);
      setNewPost({
        title: "",
        excerpt: "",
        author: "Current User",
        avatar: "https://avatar.iran.liara.run/public/40",
        date: new Date().toISOString().split("T")[0],
        category: "General",
        content: "",
      });
      setErrorMessage("");
      setIsSubmitting(false);
    }, 600);
  };

  // Handle post click for details
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setCommentText("");
  };

  // Handle like for a post
  const handleLikePost = (postId, e) => {
    e.stopPropagation();
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
    
    // Also update the selected post if it's currently being viewed
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        likes: selectedPost.likes + 1
      });
    }
  };

  // Handle like for a comment
  const handleLikeComment = (postId, commentId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, likes: comment.likes + 1 }
                  : comment
              ),
            }
          : post
      )
    );
    
    // Also update the selected post if it's currently being viewed
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        comments: selectedPost.comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, likes: comment.likes + 1 }
            : comment
        ),
      });
    }
  };

  // Handle comment submission
  const handleAddComment = () => {
    if (!commentText.trim() || !selectedPost) return;
    
    const newComment = {
      id: selectedPost.comments.length + 1,
      author: "Current User",
      avatar: "https://avatar.iran.liara.run/public/30",
      comment: commentText,
      likes: 0,
    };
    
    // Update the posts array
    const updatedPosts = posts.map((post) =>
      post.id === selectedPost.id
        ? {
            ...post,
            comments: [...post.comments, newComment],
          }
        : post
    );
    
    setPosts(updatedPosts);
    
    // Update the selected post
    setSelectedPost({
      ...selectedPost,
      comments: [...selectedPost.comments, newComment],
    });
    
    // Clear the comment input
    setCommentText("");
  };

  // Handle input change for new comment
  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  // Handle input for creating a new post
  const handleNewPostChange = (e) => {
    const { name, value } = e.target;
    setNewPost({ ...newPost, [name]: value });
    setErrorMessage(""); // Clear error message on input change
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const getCategoryColor = (category) => {
    const categoryColors = {
      Anxiety: "bg-blue-100 text-blue-800",
      Depression: "bg-indigo-100 text-indigo-800",
      Stress: "bg-teal-100 text-teal-800",
      "Self-Esteem": "bg-amber-100 text-amber-800",
      General: "bg-gray-100 text-gray-800",
    };
    return categoryColors[category] || "bg-gray-100 text-gray-800";
  };

  // Handle Enter key press for comment submission
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="community-forum min-h-screen p-8 bg-transparent">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Community Forum</h1>
      
      {/* Create Post Button */}
      <Button
        color="primary"
        className="fixed bottom-8 right-8 z-50 rounded-full p-4 shadow-lg bg-indigo-600 hover:bg-indigo-700 border-none flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
        onClick={() => setIsModalOpen(true)}
      >
        <FaPlus className="text-lg" />
        <span className="hidden md:inline font-medium">Create Post</span>
      </Button>

      {/* Post Creation Modal */}
      <Modal
        open={isModalOpen}
        onClickBackdrop={() => !isSubmitting && setIsModalOpen(false)}
        className="fixed inset-0 z-50 flex justify-center items-center"
      >
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
          <div className="bg-indigo-600 text-white p-4 text-center text-lg font-semibold flex items-center justify-center gap-2">
            <FaEdit />
            <span>Create a New Post</span>
          </div>
          <div className="p-6">
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                {errorMessage}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input
                placeholder="Enter post title"
                name="title"
                value={newPost.title}
                onChange={handleNewPostChange}
                className="w-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <Textarea
                placeholder="What's on your mind?"
                name="content"
                value={newPost.content}
                onChange={handleNewPostChange}
                className="w-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 rounded-md"
                rows={5}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={newPost.category}
                onChange={handleNewPostChange}
                className="w-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 rounded-md h-10 px-3"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (Optional)</label>
              <Input
                placeholder="Your Name"
                name="author"
                value={newPost.author}
                onChange={handleNewPostChange}
                className="w-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 p-4 bg-gray-50">
            <Button 
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 border-none rounded-lg px-5 py-2 font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePost}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-lg px-5 py-2 font-medium transition-colors ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Post Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {currentPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer overflow-hidden transform hover:-translate-y-1"
            onClick={() => handlePostClick(post)}
          >
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{post.author}</h4>
                  <p className="text-xs text-gray-500">{post.date}</p>
                </div>
                <div className="ml-auto">
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>
              </div>
              
              <h3 className="font-bold text-xl text-gray-800 mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
              
              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  onClick={(e) => handleLikePost(post.id, e)}
                >
                  <FaThumbsUp className="text-indigo-500" /> 
                  <span>{post.likes}</span>
                </button>
                <button 
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <FaComment className="text-indigo-500" /> 
                  <span>{post.comments.length}</span>
                </button>
                <button 
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <FaShare className="text-indigo-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <FaComment className="text-gray-400 text-4xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Be the first to share your thoughts with the community!
          </p>
          <Button
            color="primary"
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-lg px-6 py-2 font-medium"
            onClick={() => setIsModalOpen(true)}
          >
            Create a Post
          </Button>
        </div>
      )}

      {/* Pagination */}
      {Math.ceil(posts.length / postsPerPage) > 1 && (
        <div className="flex justify-center mt-8 mb-16">
          <Pagination>
            <Button
              className={`mx-1 min-w-8 h-8 rounded-md ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white bg-opacity-80 text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo;
            </Button>
            
            {Array.from({ length: Math.ceil(posts.length / postsPerPage) }).map(
              (_, index) => (
                <Button
                  key={index + 1}
                  className={`mx-1 min-w-8 h-8 rounded-md ${
                    currentPage === index + 1
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white bg-opacity-80 text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Button>
              )
            )}
            
            <Button
              className={`mx-1 min-w-8 h-8 rounded-md ${
                currentPage === Math.ceil(posts.length / postsPerPage)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white bg-opacity-80 text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => 
                currentPage < Math.ceil(posts.length / postsPerPage) && 
                setCurrentPage(currentPage + 1)
              }
              disabled={currentPage === Math.ceil(posts.length / postsPerPage)}
            >
              &raquo;
            </Button>
          </Pagination>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white bg-opacity-95 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPost.avatar}
                  alt={selectedPost.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{selectedPost.author}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{selectedPost.date}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(selectedPost.category)}`}>
                      {selectedPost.category}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full h-8 w-8 p-0 flex items-center justify-center border-none"
                onClick={() => setSelectedPost(null)}
              >
                &times;
              </Button>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedPost.title}</h2>
              <div className="prose max-w-none mb-8">
                <p>{selectedPost.content}</p>
              </div>
              
              <div className="flex gap-4 border-t border-b border-gray-200 py-3 mb-6">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  onClick={(e) => handleLikePost(selectedPost.id, e)}
                >
                  <FaThumbsUp className="text-indigo-500" /> 
                  <span>{selectedPost.likes} {selectedPost.likes === 1 ? 'Like' : 'Likes'}</span>
                </button>
                <button 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  onClick={() => commentInputRef.current?.focus()}
                >
                  <FaComment className="text-indigo-500" /> 
                  <span>Comment</span>
                </button>
                <button 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <FaShare className="text-indigo-500" />
                  <span>Share</span>
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Comments ({selectedPost.comments.length})
                </h3>
                
                {selectedPost.comments.length === 0 ? (
                  <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
                ) : (
                  <div className="space-y-4">
                    {selectedPost.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={comment.avatar}
                            alt={comment.author}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-medium text-gray-800">{comment.author}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{comment.comment}</p>
                        <button 
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-gray-600 text-sm hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          onClick={() => handleLikeComment(selectedPost.id, comment.id)}
                        >
                          <FaThumbsUp className="text-indigo-400" /> 
                          <span>{comment.likes}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <Textarea
                  ref={commentInputRef}
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={handleCommentChange}
                  onKeyDown={handleKeyPress}
                  className="w-full pr-24 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 rounded-lg resize-none"
                  rows={2}
                />
                <Button
                  className="absolute right-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-1 px-4 rounded-full border-none transition-colors"
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityForum;