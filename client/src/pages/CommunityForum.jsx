import React, { useState } from "react";
import { FaUserCircle, FaThumbsUp, FaComment, FaShare } from "react-icons/fa";
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
    author: "",
    avatar: "",
    date: "",
    category: "",
    content: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  // Handle post creation
  const handleCreatePost = () => {
    const post = {
      id: posts.length + 1,
      title: newPost.title,
      excerpt: newPost.content.substring(0, 100) + "...",
      author: "Current User",
      avatar: "https://via.placeholder.com/40",
      date: new Date().toISOString().split("T")[0],
      category: "General",
      content: newPost.content,
      likes: 0,
      comments: [],
    };
    setPosts([post, ...posts]);
    setIsModalOpen(false);
    setNewPost({ title: "", content: "", tags: "" });
  };

  // Handle post click for details
  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  // Handle like for a post
  const handleLikePost = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  // Handle comment submission
  const handleAddComment = (postId, comment) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: post.comments.length + 1,
                  author: "Current User",
                  avatar: "https://via.placeholder.com/30",
                  comment,
                  likes: 0,
                },
              ],
            }
          : post
      )
    );
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="community-forum p-4 relative">
      {/* Post Creation Button */}
      <Button
        color="primary"
        className="fixed bottom-10 right-10 z-50"
        onClick={() => setIsModalOpen(true)}
      >
        Create Post
      </Button>

      {/* Post Creation Modal */}
      <Modal
  open={isModalOpen}
  onClickBackdrop={() => setIsModalOpen(false)}
  className="fixed inset-0 z-60 flex justify-center items-center backdrop-blur-md"
>
  <Modal.Header className="absolute top-0 left-0 right-0 bg-white p-4 text-center text-lg font-semibold">
    Create a New Post
  </Modal.Header>
  <Modal.Body className="bg-white p-6 rounded-lg max-w-lg w-full">
    <Input
      placeholder="Title"
      value={newPost.title}
      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
      className="mb-4"
    />
    <Textarea
      placeholder="Excerpt (short summary)"
      value={newPost.excerpt}
      onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
      className="mb-4"
    />
    <Input
      placeholder="Author"
      value={newPost.author}
      onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
      className="mb-4"
    />
    <Input
      placeholder="Avatar URL"
      value={newPost.avatar}
      onChange={(e) => setNewPost({ ...newPost, avatar: e.target.value })}
      className="mb-4"
    />
    <Input
      placeholder="Date (YYYY-MM-DD)"
      value={newPost.date}
      onChange={(e) => setNewPost({ ...newPost, date: e.target.value })}
      className="mb-4"
    />
    <Input
      placeholder="Category"
      value={newPost.category}
      onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
      className="mb-4"
    />
    <Textarea
      placeholder="Content"
      value={newPost.content}
      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
      className="mb-4"
    />
  </Modal.Body>
  <Modal.Actions className="text-center">
    <Button onClick={handleCreatePost}>Submit</Button>
    <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
  </Modal.Actions>
</Modal>


      {/* Post Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentPosts.map((post) => (
          <div
            key={post.id}
            className="rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:transform hover:-translate-y-2 hover:shadow-2xl border-2 border-pink-400 w-[400px]  h-[260px] bg-purple-200 opacity-80 "
            onClick={() => handlePostClick(post)}
          >
            <div className="card-body pt-4">
              <h2 className="card-title px-1">{post.title}</h2>
              <p>{post.excerpt}</p>
              <div className="flex items-center pt-4 px-2">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-12 h-12 rounded-full mr-2"
                />
                <span>{post.author}</span>
                <span className="ml-auto text-sm text-gray-500">
                  {post.date}
                </span>
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  color="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikePost(post.id);
                  }}
                >
                  <FaThumbsUp /> {post.likes}
                </Button>
                <Button color="ghost">
                  <FaComment /> {post.comments.length}
                </Button>
                <Button color="ghost">
                  <FaShare />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <Pagination>
          {Array.from({ length: Math.ceil(posts.length / postsPerPage) }).map(
            (_, index) => (
              <Button
                key={index + 1}
                color={currentPage === index + 1 ? "primary" : "ghost"}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Button>
            )
          )}
        </Pagination>
      </div>

      {/* Post Detail Section */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">{selectedPost.title}</h2>
            <p>{selectedPost.content}</p>
            <div className="flex items-center mt-4">
              <img
                src={selectedPost.avatar}
                alt={selectedPost.author}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span>{selectedPost.author}</span>
              <span className="ml-auto text-sm text-gray-500">
                {selectedPost.date}
              </span>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Comments</h3>
              {selectedPost.comments.map((comment) => (
                <div key={comment.id} className="mb-4">
                  <div className="flex items-center">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span>{comment.author}</span>
                  </div>
                  <p>{comment.comment}</p>
                  <Button color="ghost" size="sm">
                    <FaThumbsUp /> {comment.likes}
                  </Button>
                </div>
              ))}
              <Input
                placeholder="Add a comment..."
                onKeyPress={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    handleAddComment(selectedPost.id, e.target.value);
                    e.target.value = "";
                  }
                }}
              />
            </div>
            <Button
              color="ghost"
              className="mt-4"
              onClick={() => setSelectedPost(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityForum;
