
import { useState } from 'react';
import { Fingerprint, AlertCircle, Loader } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { authenticateWithWebAuthn } from '../utils/webauthn';
import { useUserStore } from '../stores/useUserStore';

const BiometricLogin = ({ userEmail, onSuccess, onError, onCancel }) => {
  const { t } = useTranslation();
  const { setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await authenticateWithWebAuthn(userEmail);
      
      if (result.verified && result.user) {
        setUser(result.user);
        onSuccess?.(result.user);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      console.error('Biometric login error:', err);
      const errorMessage = err.message || 'Biometric authentication failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <Fingerprint className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('biometric.login.title')}
          </h3>
          <p className="text-gray-600 text-sm">
            {t('biometric.login.description')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleBiometricLogin}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                {t('biometric.login.authenticating')}
              </>
            ) : (
              <>
                <Fingerprint className="h-4 w-4 mr-2" />
                {t('biometric.login.authenticate')}
              </>
            )}
          </button>

          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {t('biometric.login.usePassword')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BiometricLogin;
