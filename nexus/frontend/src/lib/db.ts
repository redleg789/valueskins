// In-memory data store for demo
interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  bio: string;
  type: 'creator' | 'brand';
  followers: number;
  following: number;
}

interface Post {
  id: string;
  userId: string;
  author: string;
  handle: string;
  avatar: string;
  verified: boolean;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  liked: boolean;
}

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Initial demo data
const users: Map<string, User> = new Map([
  ['user-1', {
    id: 'user-1',
    name: 'The Voyager',
    handle: 'thevoyager',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClSH9Q7nncb6hIbYUZjvavwuAtTrOqvcMh1rAU_bc_EBBOCR0Nbjj6GfUAT2CPITYWbXop1eYqf24Xjqakqa3H_LUAwxtZoFCNT51e7pZhQqYIKaLjkgsGhDibrrYlOA03kM4AtoXG-cS3CDzpnVsFEXvG5TQpFj17eaJ1Hnn3QALMZWU9mCZyGu3tzamU5ZNi-LLeVmRYtXF0QwaFQCAQZtcq-Lk8VMKSApLxH7cKBonKEc174msDiUU6e2QjaQG4jdb921IsZiio',
    verified: true,
    bio: 'Digital Alchemist | Exploring the intersection of art and technology',
    type: 'creator',
    followers: 12400,
    following: 890,
  }],
  ['user-2', {
    id: 'user-2',
    name: 'Artisan Studios',
    handle: 'artisanstudios',
    avatar: 'https://via.placeholder.com/100',
    verified: true,
    bio: 'Premium art supplies for professional creators',
    type: 'brand',
    followers: 45200,
    following: 234,
  }],
  ['user-3', {
    id: 'user-3',
    name: 'Neon Dreams',
    handle: 'neondreams',
    avatar: 'https://via.placeholder.com/100',
    verified: false,
    bio: 'Digital artist | NFT collector | Community builder',
    type: 'creator',
    followers: 8900,
    following: 1200,
  }],
]);

const posts: Map<string, Post> = new Map([
  ['post-1', {
    id: 'post-1',
    userId: 'user-3',
    author: 'Neon Dreams',
    handle: 'neondreams',
    avatar: 'https://via.placeholder.com/100',
    verified: false,
    content: 'Just finished my latest piece exploring the boundaries between digital and physical art. The response has been incredible! #art #digitalart #nft',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likes: 234,
    comments: 45,
    shares: 12,
    saves: 67,
    liked: false,
  }],
  ['post-2', {
    id: 'post-2',
    userId: 'user-2',
    author: 'Artisan Studios',
    handle: 'artisanstudios',
    avatar: 'https://via.placeholder.com/100',
    verified: true,
    content: 'Excited to announce our new summer collection! Designed in collaboration with @thevoyager. Limited edition prints available now. #artists #design #collab',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    likes: 567,
    comments: 89,
    shares: 34,
    saves: 123,
    liked: true,
  }],
]);

const messages: Map<string, Message[]> = new Map();

let postCounter = 3;
let messageCounter = 1;

export const db = {
  users,
  posts,
  messages,
  postCounter,
  messageCounter,
  
  getUser(userId: string): User | undefined {
    return users.get(userId);
  },
  
  getAllUsers(): User[] {
    return Array.from(users.values());
  },
  
  getPosts(userId?: string): Post[] {
    const allPosts = Array.from(posts.values());
    if (userId) {
      return allPosts.filter(p => p.userId === userId);
    }
    return allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  createPost(userId: string, content: string): Post | null {
    const user = users.get(userId);
    if (!user) return null;
    
    const post: Post = {
      id: `post-${postCounter++}`,
      userId,
      author: user.name,
      handle: user.handle,
      avatar: user.avatar,
      verified: user.verified,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      liked: false,
    };
    
    posts.set(post.id, post);
    return post;
  },
  
  toggleLike(postId: string): { likes: number } | null {
    const post = posts.get(postId);
    if (!post) return null;
    
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    
    return { likes: post.likes };
  },
  
  getMessages(userId: string, otherUserId: string): Message[] {
    const key = [userId, otherUserId].sort().join('-');
    return messages.get(key) || [];
  },
  
  sendMessage(from: string, to: string, content: string): Message {
    const key = [from, to].sort().join('-');
    const existing = messages.get(key) || [];
    
    const message: Message = {
      id: `msg-${messageCounter++}`,
      from,
      to,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    existing.push(message);
    messages.set(key, existing);
    
    return message;
  },
};