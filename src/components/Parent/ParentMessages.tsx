import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { messageService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

interface Message {
  id: string;
  from: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
  sender_name?: string;
  created_at?: string;
  is_read?: boolean;
}

const ParentMessages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messageService.getAll({ recipientId: user?.id });

      const formattedMessages = (data.messages || data || []).map((msg: any) => ({
        id: msg.id,
        from: msg.sender_name || msg.from || 'Inconnu',
        subject: msg.subject,
        content: msg.content || msg.message,
        date: msg.created_at || msg.date,
        read: msg.is_read !== undefined ? msg.is_read : msg.read
      }));

      setMessages(formattedMessages);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);

    if (!message.read) {
      try {
        await messageService.markAsRead(message.id);

        setMessages(messages.map(m =>
          m.id === message.id ? { ...m, read: true } : m
        ));
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchMessages}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Communication avec l'établissement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Boîte de réception</h3>
            <p className="text-sm text-gray-500 mt-1">
              {messages.filter(m => !m.read).length} non lu(s)
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {messages.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucun message
              </div>
            ) : (
              messages.map(message => (
                <button
                  key={message.id}
                  onClick={() => handleSelectMessage(message)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                  } ${!message.read ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className={`font-medium text-sm ${!message.read ? 'text-blue-900' : 'text-gray-900'}`}>
                      {message.from}
                    </span>
                    {!message.read && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 font-medium mb-1 truncate">
                    {message.subject}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(message.date)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedMessage.subject}
                </h2>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1" />
                  <span className="mr-4">{selectedMessage.from}</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(selectedMessage.date).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
              <div className="p-6 border-t border-gray-200">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Répondre
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Sélectionnez un message pour le lire</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentMessages;
