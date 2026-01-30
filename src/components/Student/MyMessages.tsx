import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { messageService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

interface Message {
  id: string;
  subject: string;
  content: string;
  senderName: string;
  recipientName: string;
  date: string;
  read: boolean;
  senderId: string;
  recipientId: string;
}

const MyMessages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await messageService.getAll({ userId: user?.id });
      setMessages(response);
    } catch (err) {
      console.error('Erreur lors du chargement des messages:', err);
      setError('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.read && message.recipientId === user?.id) {
      try {
        await messageService.markAsRead(message.id);
        setMessages(messages.map(m =>
          m.id === message.id ? { ...m, read: true } : m
        ));
      } catch (err) {
        console.error('Erreur lors du marquage du message:', err);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Consultez vos messages</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
            <h3 className="text-lg font-semibold text-white">Boîte de réception</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Aucun message</p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !message.read && message.recipientId === user?.id ? 'bg-blue-50' : ''
                  } ${selectedMessage?.id === message.id ? 'bg-blue-100' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-medium ${!message.read && message.recipientId === user?.id ? 'text-blue-900' : 'text-gray-900'}`}>
                          {message.senderId === user?.id ? `À: ${message.recipientName}` : message.senderName}
                        </p>
                        {!message.read && message.recipientId === user?.id && (
                          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 font-medium truncate">{message.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(message.date)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedMessage.subject}</h2>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>De: {selectedMessage.senderName}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(selectedMessage.date)}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p>Sélectionnez un message pour le lire</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyMessages;
