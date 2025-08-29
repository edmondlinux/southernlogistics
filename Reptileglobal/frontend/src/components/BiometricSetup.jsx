
import { useState, useEffect } from 'react';
import { Fingerprint, Shield, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { 
  isWebAuthnSupported, 
  isUserVerifyingPlatformAuthenticatorAvailable,
  registerWebAuthnCredential 
} from '../utils/webauthn';
import { useUserStore } from '../stores/useUserStore';

const BiometricSetup = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = isWebAuthnSupported();
      setIsSupported(supported);
      
      if (supported) {
        const available = await isUserVerifyingPlatformAuthenticatorAvailable();
        setIsAvailable(available);
      }
    };
    
    checkSupport();
  }, []);

  const handleSetupBiometric = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await registerWebAuthnCredential(user._id, user.email, user.name);
      setSuccess(true);
      
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 2000);
    } catch (err) {
      console.error('Biometric setup error:', err);
      setError(err.message || 'Failed to setup biometric authentication');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('biometric.notSupported.title')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('biometric.notSupported.message')}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('biometric.notAvailable.title')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('biometric.notAvailable.message')}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {success ? (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('biometric.success.title')}
            </h3>
            <p className="text-gray-600">
              {t('biometric.success.message')}
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="flex justify-center space-x-2 mb-4">
                <Fingerprint className="h-8 w-8 text-emerald-500" />
                <Shield className="h-8 w-8 text-blue-500" />
                <Smartphone className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('biometric.setup.title')}
              </h3>
              <p className="text-gray-600">
                {t('biometric.setup.description')}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-800">{t('biometric.benefits.secure')}</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Fingerprint className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-800">{t('biometric.benefits.fast')}</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Smartphone className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-purple-800">{t('biometric.benefits.convenient')}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSetupBiometric}
                disabled={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('biometric.setup.setting')}
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4 mr-2" />
                    {t('biometric.setup.enable')}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BiometricSetup;
