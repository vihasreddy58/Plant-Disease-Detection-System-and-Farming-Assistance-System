import React, { useState, useEffect } from "react";
import "./DiscussionPage.css";

const DiscussionPage = () => {
  const [discussions, setDiscussions] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [replyText, setReplyText] = useState({});
  const [loadingPost, setLoadingPost] = useState(false);
  const [replyLoading, setReplyLoading] = useState({});

  const fetchDiscussions = async () => {
    const res = await fetch("http://localhost:5000/api/discussions");
    const data = await res.json();
    setDiscussions(data.reverse());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingPost(true);
    await fetch("http://localhost:5000/api/discussions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setTitle("");
    setContent("");
    setLoadingPost(false);
    fetchDiscussions();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpvote = async (id) => {
    await fetch(`http://localhost:5000/api/discussions/${id}/upvote`, { method: "POST" });
    fetchDiscussions(); // Refresh data
  };

  const handleReply = async (discussionId, replyContent) => {
    try {
      const response = await fetch(`http://localhost:5000/api/discussions/${discussionId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: replyContent }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to post reply");
      }
  
      console.log("Reply posted successfully!");
    } catch (error) {
      console.error("Reply error:", error);
    }
  };
  

  useEffect(() => {
    fetchDiscussions();
  }, []);

  return (
    <div className="discussion-container">
      <h2>Community Forum</h2>

      <form onSubmit={handleSubmit} className="discussion-form">
        <input
          type="text"
          placeholder="Discussion Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Share your thoughts or questions..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit" disabled={loadingPost}>
          {loadingPost ? "Posting..." : "Post"}
        </button>
      </form>

      <div className="discussion-list">
        {discussions.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">
            No discussions yet. Be the first to post!
          </p>
        ) : (
          discussions.map((discussion) => (
            <div key={discussion._id} className="bg-white p-4 rounded shadow my-4">
              <h3 className="font-bold text-lg">{discussion.title}</h3>
              <p>{discussion.content}</p>
              <p className="text-sm text-gray-500">
                {new Date(discussion.timestamp).toLocaleString()}
              </p>

              {/* Upvote */}
              <div className="flex items-center mt-2">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mr-2"
                  onClick={() => handleUpvote(discussion._id)}
                >
                  👍 Upvote
                </button>
                <span>{discussion.upvotes || 0} Upvotes</span>
              </div>

              {/* Reply Input */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText[discussion._id] || ""}
                  onChange={(e) =>
                    setReplyText({ ...replyText, [discussion._id]: e.target.value })
                  }
                  className="border rounded p-2 w-full my-1"
                />
               <button
  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
  onClick={() => handleReply(discussion._id, replyText[discussion._id])}
  disabled={replyLoading[discussion._id]}
>
  {replyLoading[discussion._id] ? "Replying..." : "Reply"}
</button>


                {/* Replies */}
                <div className="mt-2 ml-4">
                  {discussion.replies &&
                    discussion.replies.map((reply, idx) => (
                      <div key={idx} className="border-l-2 pl-2 my-1">
                        <p>{reply.content}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(reply.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscussionPage;
