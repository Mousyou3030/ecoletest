import React, { useState, useEffect } from 'react';
import { Plus, Search, Send, Inbox, Send as Sent, Archive, Star, MessageSquare, Users, Bell } from 'lucide-react';
import { Message } from '../../types';
import { messageService, userService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';

const MessageCenter: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    content: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messagesData, usersData] = await Promise.all([
          messageService.getAll(),
          userService.getAll()
        ]);
        setMessages(messagesData.messages || messagesData || []);
        setUsers(usersData.users || usersData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMessages = messages.filter(message => {
    const sender = users.find(u => u.id === message.senderId);
    return message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
           message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (sender?.firstName + ' ' + sender?.lastName).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const newMessage = await messageService.create({
        senderId: user.id,
        receiverId: composeForm.to,
        subject: composeForm.subject,
        content: composeForm.content
      });
      setMessages(prev => [newMessage, ...prev]);
      setComposeForm({ to: '', subject: '', content: '' });
      setActiveTab('sent');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await messageService.markAsRead(messageId);
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
    } catch (error) {
      console.error('Erreur lors du marquage du message:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  const ComposeMessage = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveau Message</h3>
      <form onSubmit={handleSendMessage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire</label>
          <select
            value={composeForm.to}
            onChange={(e) => setComposeForm(prev => ({ ...prev, to: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionner un destinataire</option>
            {users.filter(u => u.id !== user?.id).map(u => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName} ({u.role === 'teacher' ? 'Enseignant' :
                            u.role === 'student' ? 'Élève' : 'Parent'})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
          <input
            type="text"
            value={composeForm.subject}
            onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Sujet du message"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={composeForm.content}
            onChange={(e) => setComposeForm(prev => ({ ...prev, content: e.target.value }))}
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tapez votre message ici..."
            required
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setActiveTab('inbox')}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );

  const MessageList = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher dans les messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {filteredMessages.map((message) => {
          const sender = users.find(u => u.id === message.senderId);
          return (
            <div
              key={message.id}
              onClick={() => {
                setSelectedMessage(message);
                if (!message.isRead) markAsRead(message.id);
              }}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${!message.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm font-medium ${!message.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {sender?.firstName} {sender?.lastName}
                    </p>
                    {!message.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className={`text-sm ${!message.isRead ? 'font-medium text-gray-900' : 'text-gray-600'} truncate`}>
                    {message.subject}
                  </p>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {message.content}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <p className="text-xs text-gray-400">
                    {message.timestamp.toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const MessageDetail = () => {
    if (!selectedMessage) return null;
    
    const sender = users.find(u => u.id === selectedMessage.senderId);
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedMessage(null)}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Retour à la liste
          </button>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Star className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Archive className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {selectedMessage.subject}
          </h2>
          <div className="flex items-center text-sm text-gray-600">
            <span>De: {sender?.firstName} {sender?.lastName}</span>
            <span className="mx-2">•</span>
            <span>{selectedMessage.timestamp.toLocaleString('fr-FR')}</span>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">
            {selectedMessage.content}
          </p>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Send className="h-4 w-4 mr-2" />
            Répondre
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centre de Messages</h1>
          <p className="text-gray-600">Gérez vos communications avec l'équipe éducative</p>
        </div>
        <button
          onClick={() => setActiveTab('compose')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau message
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Inbox className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Messages reçus</p>
              <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Non lus</p>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Sent className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Envoyés</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{users.length - 1}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inbox'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <Inbox className="h-4 w-4 mr-2" />
                Boîte de réception
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <Sent className="h-4 w-4 mr-2" />
                Messages envoyés
              </div>
            </button>
            <button
              onClick={() => setActiveTab('compose')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'compose'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Nouveau message
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'compose' && <ComposeMessage />}
      {activeTab === 'inbox' && !selectedMessage && <MessageList />}
      {activeTab === 'inbox' && selectedMessage && <MessageDetail />}
      {activeTab === 'sent' && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <Sent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Messages envoyés</h3>
          <p className="text-gray-600">Vos messages envoyés apparaîtront ici.</p>
        </div>
      )}
    </div>
  );
};

export default MessageCenter;