import { useEffect, useState } from 'react';

interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  likes: number;
  replies: Comment[];
}

interface CommentsModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentsModal({ postId, isOpen, onClose }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts?action=comments&postId=${postId}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`/api/posts?action=comment&postId=${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-black border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Comments</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No comments yet. Be the first to comment! 💬</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="border-b border-gray-700 pb-4">
                <div className="flex gap-3">
                  <div className="text-2xl">{comment.userAvatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{comment.userName}</span>
                      <span className="text-gray-500">{comment.userHandle}</span>
                    </div>
                    <p className="text-white mt-1">{comment.text}</p>
                    <div className="flex gap-4 text-gray-500 text-sm mt-2">
                      <button className="hover:text-blue-400">❤️ {comment.likes}</button>
                      <button className="hover:text-blue-400">Reply</button>
                      <span className="text-xs">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="border-t border-gray-700 p-4">
          <form onSubmit={handlePostComment} className="flex gap-3">
            <div className="text-2xl">👤</div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What do you think?"
                maxLength={500}
                className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none"
                rows={2}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-500 text-xs">{newComment.length}/500</span>
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-full text-sm"
                >
                  Reply
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
