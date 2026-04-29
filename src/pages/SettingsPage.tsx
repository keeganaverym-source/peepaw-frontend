import { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [groqModel, setGroqModel] = useState('mixtral-8x7b-32768');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedGoogleKey = localStorage.getItem('VITE_GOOGLE_MAPS_KEY') || '';
    const savedGroqKey = localStorage.getItem('VITE_GROQ_API_KEY') || '';
    const savedModel = localStorage.getItem('VITE_GROQ_MODEL') || 'mixtral-8x7b-32768';
    setGoogleMapsKey(savedGoogleKey);
    setGroqApiKey(savedGroqKey);
    setGroqModel(savedModel);
  }, []);

  const handleGoogleMapsKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoogleMapsKey(e.target.value);
    setHasChanges(true);
  };

  const handleGroqApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroqApiKey(e.target.value);
    setHasChanges(true);
  };

  const handleGroqModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroqModel(e.target.value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!googleMapsKey.trim()) {
      toast.error('Google Maps API key is required');
      return;
    }
    if (!groqApiKey.trim()) {
      toast.error('Groq API key is required');
      return;
    }

    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('VITE_GOOGLE_MAPS_KEY', googleMapsKey);
      localStorage.setItem('VITE_GROQ_API_KEY', groqApiKey);
      localStorage.setItem('VITE_GROQ_MODEL', groqModel);

      // Update environment variables
      (window as any).VITE_GOOGLE_MAPS_KEY = googleMapsKey;
      (window as any).VITE_GROQ_API_KEY = groqApiKey;
      (window as any).VITE_GROQ_MODEL = groqModel;

      setHasChanges(false);
      toast.success('Settings saved successfully! Please refresh the page for changes to take effect.');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const savedGoogleKey = localStorage.getItem('VITE_GOOGLE_MAPS_KEY') || '';
    const savedGroqKey = localStorage.getItem('VITE_GROQ_API_KEY') || '';
    const savedModel = localStorage.getItem('VITE_GROQ_MODEL') || 'mixtral-8x7b-32768';
    setGoogleMapsKey(savedGoogleKey);
    setGroqApiKey(savedGroqKey);
    setGroqModel(savedModel);
    setHasChanges(false);
  };

  return (
    <div className="h-full overflow-auto bg-dark-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Configure your API keys and preferences</p>
        </div>

        {/* API Keys Section */}
        <div className="space-y-6">
          {/* Google Maps API Key */}
          <div className="card bg-dark-900 border border-dark-700 rounded-lg p-6">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white mb-2">
                Google Maps API Key
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Get your API key from{' '}
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent/80 underline"
                >
                  Google Cloud Console
                </a>
              </p>
              <input
                type="password"
                value={googleMapsKey}
                onChange={handleGoogleMapsKeyChange}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            {googleMapsKey && (
              <div className="text-xs text-gray-400">
                Key saved: {googleMapsKey.substring(0, 10)}...
              </div>
            )}
          </div>

          {/* Groq API Key */}
          <div className="card bg-dark-900 border border-dark-700 rounded-lg p-6">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white mb-2">
                Groq API Key
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Get your API key from{' '}
                <a
                  href="https://console.groq.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent/80 underline"
                >
                  Groq Console
                </a>
              </p>
              <input
                type="password"
                value={groqApiKey}
                onChange={handleGroqApiKeyChange}
                placeholder="gsk_..."
                className="w-full px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            {groqApiKey && (
              <div className="text-xs text-gray-400">
                Key saved: {groqApiKey.substring(0, 10)}...
              </div>
            )}
          </div>

          {/* Groq Model Selection */}
          <div className="card bg-dark-900 border border-dark-700 rounded-lg p-6">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white mb-2">
                AI Model
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Choose which Groq model to use for AI processing
              </p>
              <select
                value={groqModel}
                onChange={handleGroqModelChange}
                className="w-full px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-accent/50 transition-colors"
              >
                <option value="mixtral-8x7b-32768">Groq Mixtral 8x7B (Faster)</option>
                <option value="llama-3.1-70b-versatile">Groq Llama 3.1 70B (More Powerful)</option>
              </select>
            </div>
            <div className="text-xs text-gray-400">
              Selected: {groqModel === 'mixtral-8x7b-32768' ? 'Mixtral 8x7B (Faster)' : 'Llama 3.1 70B (More Powerful)'}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-accent/5 border border-accent/30 rounded-lg p-4 flex gap-3">
            <AlertCircle size={18} className="text-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">API Keys are stored locally</p>
              <p className="text-xs">
                Your API keys are stored in your browser's local storage for this session only. They are never sent to any server except to their respective API providers (Google Maps and Groq).
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-dark-800 text-gray-300 rounded-lg font-semibold hover:bg-dark-700 transition-colors border border-dark-600"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Usage Info */}
        <div className="mt-12 pt-8 border-t border-dark-700">
          <h2 className="text-lg font-semibold text-white mb-4">How to get your API keys</h2>
          
          <div className="space-y-6">
            {/* Google Maps */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Google Maps API Key</h3>
              <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80">Google Cloud Console</a></li>
                <li>Create a new project or select an existing one</li>
                <li>Enable the Maps JavaScript API</li>
                <li>Go to Credentials and create an API key</li>
                <li>Copy the API key and paste it here</li>
              </ol>
            </div>

            {/* Groq */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Groq API Key</h3>
              <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80">Groq Console</a></li>
                <li>Sign in or create an account</li>
                <li>Navigate to API Keys section</li>
                <li>Create a new API key</li>
                <li>Copy the API key and paste it here</li>
              </ol>
            </div>

            {/* AI Models */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">AI Models</h3>
              <div className="text-sm text-gray-400 space-y-2">
                <div>
                  <p className="font-semibold text-white">Mixtral 8x7B (Faster)</p>
                  <p className="text-xs">Faster response times, good for real-time applications</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Llama 3.1 70B (More Powerful)</p>
                  <p className="text-xs">More powerful model for complex analysis and reasoning</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
