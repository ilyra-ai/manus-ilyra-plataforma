import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Check,
  X,
  Save,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { getAllLanguages, createLanguage, updateLanguage, deleteLanguage, getLanguageTranslations } from '../../services/languageService';
import { useAuth } from '../../hooks/useAuth';

const LanguageSettings = () => {
  const { user } = useAuth(); // Assuming user object contains role information
  const [languages, setLanguages] = useState([]); // List of languages from backend
  const [newLang, setNewLang] = useState({ code: '', name: '', is_active: true, translations: {} });
  const [editingLang, setEditingLang] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // TODO: Implement proper admin role check
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const data = await getAllLanguages();
      setLanguages(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch languages.' });
      console.error('Error fetching languages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLanguage = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await createLanguage(newLang);
      setMessage({ type: 'success', text: 'Language created successfully!' });
      setNewLang({ code: '', name: '', is_active: true, translations: {} });
      fetchLanguages();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create language.' });
      console.error('Error creating language:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLanguage = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    if (!editingLang) return;
    try {
      await updateLanguage(editingLang.id, editingLang);
      setMessage({ type: 'success', text: 'Language updated successfully!' });
      setEditingLang(null);
      fetchLanguages();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update language.' });
      console.error('Error updating language:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLanguage = async (langId) => {
    setMessage({ type: '', text: '' });
    if (window.confirm('Are you sure you want to delete this language?')) {
      try {
        await deleteLanguage(langId);
        setMessage({ type: 'success', text: 'Language deleted successfully!' });
        fetchLanguages();
      } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete language.' });
        console.error('Error deleting language:', err);
      }
    }
  };

  const handleEditTranslations = async (lang) => {
    setMessage({ type: '', text: '' });
    try {
      // Fetch full translations for editing
      const fullLangData = await getLanguageTranslations(lang.code);
      setEditingLang({ ...lang, translations: fullLangData });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load translations for editing.' });
      console.error('Error loading translations:', err);
    }
  };

  if (!isAdmin) {
    return <div className="text-center py-8 text-red-500">Access Denied: You must be an administrator to view this page.</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
        <span className="ml-3 text-gray-600">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configurações de Idiomas
            </h1>
            <p className="text-gray-600">
              Gerencie quais idiomas estarão disponíveis para os usuários da plataforma
            </p>
          </div>
        </div>

        {/* Estatísticas - Adaptar para dados do backend se necessário */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total de Idiomas</p>
                <p className="text-2xl font-bold text-blue-900">{languages.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Habilitados</p>
                <p className="text-2xl font-bold text-green-900">{languages.filter(lang => lang.is_active).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                <EyeOff className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Desabilitados</p>
                <p className="text-2xl font-bold text-gray-900">{languages.filter(lang => !lang.is_active).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem de Status */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : message.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {message.type === 'warning' && <AlertCircle className="w-5 h-5" />}
          {message.type === 'info' && <Info className="w-5 h-5" />}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Create New Language */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Create New Language</h3>
        <form onSubmit={handleCreateLanguage} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">Language Code (e.g., en, pt-BR)</label>
            <input
              type="text"
              id="code"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newLang.code}
              onChange={(e) => setNewLang({ ...newLang, code: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Language Name (e.g., English, Português (Brasil))</label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newLang.name}
              onChange={(e) => setNewLang({ ...newLang, name: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active_new"
              className="mr-2 leading-tight"
              checked={newLang.is_active}
              onChange={(e) => setNewLang({ ...newLang, is_active: e.target.checked })}
            />
            <label className="text-gray-700 text-sm font-bold" htmlFor="is_active_new">Is Active</label>
          </div>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Add Language
          </button>
        </form>
      </div>

      {/* Existing Languages List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Existing Languages</h3>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Code</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Active</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((lang) => (
              <tr key={lang.id}>
                <td className="py-2 px-4 border-b text-center">{lang.code}</td>
                <td className="py-2 px-4 border-b text-center">{lang.name}</td>
                <td className="py-2 px-4 border-b text-center">{lang.is_active ? 'Yes' : 'No'}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button onClick={() => handleEditTranslations(lang)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs mr-2">Edit</button>
                  <button onClick={() => handleDeleteLanguage(lang.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editingLang && (
          <div className="mt-8 bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Language: {editingLang.name} ({editingLang.code})</h3>
            <form onSubmit={handleUpdateLanguage} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit_name">Language Name</label>
                <input
                  type="text"
                  id="edit_name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={editingLang.name}
                  onChange={(e) => setEditingLang({ ...editingLang, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  className="mr-2 leading-tight"
                  checked={editingLang.is_active}
                  onChange={(e) => setEditingLang({ ...editingLang, is_active: e.target.checked })}
                />
                <label className="text-gray-700 text-sm font-bold" htmlFor="edit_is_active">Is Active</label>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit_translations">Translations (JSON)</label>
                <textarea
                  id="edit_translations"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-48 font-mono text-sm"
                  value={JSON.stringify(editingLang.translations, null, 2)}
                  onChange={(e) => {
                    try {
                      setEditingLang({ ...editingLang, translations: JSON.parse(e.target.value) });
                    } catch (err) {
                      // Handle invalid JSON input
                      console.error('Invalid JSON for translations:', err);
                      setMessage({ type: 'error', text: 'Invalid JSON format for translations.' });
                    }
                  }}
                />
              </div>
              <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                Save Changes
              </button>
              <button type="button" onClick={() => setEditingLang(null)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSettings;

