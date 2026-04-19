import { NextApiRequest, NextApiResponse } from 'next';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[]; // user IDs
  participantNames: { [key: string]: string };
  participantAvatars: { [key: string]: string };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: { [key: string]: number };
}

let conversations: Conversation[] = [
  {
    id: 'conv_1',
    participants: ['user_123', 'user_456'],
    participantNames: { 'user_123': 'Sarah Chen', 'user_456': 'Alex Rivers' },
    participantAvatars: { 'user_123': '👩‍🎨', 'user_456': '👨‍💼' },
    lastMessage: "Let's collab on this campaign!",
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: { 'user_123': 0, 'user_456': 1 },
  },
  {
    id: 'conv_2',
    participants: ['user_123', 'user_789'],
    participantNames: { 'user_123': 'Sarah Chen', 'user_789': 'Maya Patel' },
    participantAvatars: { 'user_123': '👩‍🎨', 'user_789': '👩‍💻' },
    lastMessage: 'Thanks for the collab opportunity!',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: { 'user_123': 0, 'user_789': 0 },
  },
];

let messages: Message[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_1',
    senderId: 'user_456',
    senderName: 'Alex Rivers',
    senderAvatar: '👨‍💼',
    content: "Hi Sarah! Love your recent posts. Interested in a collab?",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg_2',
    conversationId: 'conv_1',
    senderId: 'user_123',
    senderName: 'Sarah Chen',
    senderAvatar: '👩‍🎨',
    content: 'Hey Alex! Always open to collaborations. What do you have in mind?',
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg_3',
    conversationId: 'conv_1',
    senderId: 'user_456',
    senderName: 'Alex Rivers',
    senderAvatar: '👨‍💼',
    content: "Let's collab on this campaign!",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const userToken = req.headers.authorization?.replace('Bearer ', '');

  if (!userToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { action, conversationId } = req.query;

    if (action === 'conversations') {
      // Get all conversations for user
      const userConversations = conversations
        .filter(c => c.participants.includes(userToken))
        .map(c => ({
          ...c,
          otherParticipantId: c.participants.find(p => p !== userToken),
          otherParticipantName: c.participantNames[c.participants.find(p => p !== userToken) || ''],
          otherParticipantAvatar: c.participantAvatars[c.participants.find(p => p !== userToken) || ''],
        }))
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

      return res.status(200).json(userConversations);
    }

    if (action === 'messages' && conversationId) {
      // Get messages from a conversation
      const conversationMessages = messages
        .filter(m => m.conversationId === conversationId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return res.status(200).json(conversationMessages);
    }

    return res.status(400).json({ error: 'Invalid action' });
  }

  if (req.method === 'POST') {
    const { action } = req.query;

    if (action === 'send' && req.body.conversationId && req.body.content) {
      const { conversationId, content, recipientId, recipientName, recipientAvatar } = req.body;

      // Create or get conversation
      let conversation = conversations.find(c => c.id === conversationId);

      if (!conversation) {
        conversation = {
          id: `conv_${conversations.length + 1}`,
          participants: [userToken, recipientId],
          participantNames: { [userToken]: 'You', [recipientId]: recipientName },
          participantAvatars: { [userToken]: '👤', [recipientId]: recipientAvatar },
          lastMessage: content,
          lastMessageTime: new Date().toISOString(),
          unreadCount: { [userToken]: 0, [recipientId]: 1 },
        };
        conversations.push(conversation);
      } else {
        conversation.lastMessage = content;
        conversation.lastMessageTime = new Date().toISOString();
        conversation.unreadCount[recipientId] = (conversation.unreadCount[recipientId] || 0) + 1;
      }

      // Create message
      const newMessage: Message = {
        id: `msg_${messages.length + 1}`,
        conversationId: conversation.id,
        senderId: userToken,
        senderName: 'You',
        senderAvatar: '👤',
        content,
        createdAt: new Date().toISOString(),
        read: false,
      };

      messages.push(newMessage);
      return res.status(201).json(newMessage);
    }

    if (action === 'mark-read' && req.body.conversationId) {
      const conversation = conversations.find(c => c.id === req.body.conversationId);
      if (conversation) {
        conversation.unreadCount[userToken] = 0;
      }

      // Mark all messages in conversation as read
      messages.forEach(m => {
        if (m.conversationId === req.body.conversationId) {
          m.read = true;
        }
      });

      return res.status(200).json({ success: true });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
