
// WebAuthn utility functions
export const isWebAuthnSupported = () => {
  return window.PublicKeyCredential && 
         typeof window.PublicKeyCredential === "function" &&
         typeof navigator.credentials.create === "function" &&
         typeof navigator.credentials.get === "function";
};

export const isUserVerifyingPlatformAuthenticatorAvailable = async () => {
  if (!isWebAuthnSupported()) return false;
  
  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (error) {
    console.error('Error checking platform authenticator:', error);
    return false;
  }
};

// Convert string to ArrayBuffer
export const stringToArrayBuffer = (str) => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

// Convert ArrayBuffer to string
export const arrayBufferToString = (buffer) => {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
};

// Convert ArrayBuffer to base64url
export const arrayBufferToBase64url = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// Convert base64url to ArrayBuffer
export const base64urlToArrayBuffer = (base64url) => {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  const padded = base64 + '='.repeat(padding ? 4 - padding : 0);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

export const registerWebAuthnCredential = async (userId, userEmail, userName) => {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported on this device');
  }

  try {
    // Get registration options from server
    const response = await fetch('/api/auth/webauthn/register-begin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId,
        userEmail,
        userName
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get registration options');
    }

    const options = await response.json();

    // Convert base64url strings to ArrayBuffers
    const publicKeyCredentialCreationOptions = {
      ...options,
      challenge: base64urlToArrayBuffer(options.challenge),
      user: {
        ...options.user,
        id: base64urlToArrayBuffer(options.user.id)
      },
      excludeCredentials: options.excludeCredentials?.map(cred => ({
        ...cred,
        id: base64urlToArrayBuffer(cred.id)
      })) || []
    };

    // Create credential
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });

    // Convert ArrayBuffers back to base64url for transmission
    const credentialData = {
      id: credential.id,
      rawId: arrayBufferToBase64url(credential.rawId),
      response: {
        clientDataJSON: arrayBufferToBase64url(credential.response.clientDataJSON),
        attestationObject: arrayBufferToBase64url(credential.response.attestationObject)
      },
      type: credential.type
    };

    // Send credential to server
    const verificationResponse = await fetch('/api/auth/webauthn/register-finish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentialData)
    });

    if (!verificationResponse.ok) {
      throw new Error('Failed to verify registration');
    }

    return await verificationResponse.json();
  } catch (error) {
    console.error('WebAuthn registration error:', error);
    throw error;
  }
};

export const authenticateWithWebAuthn = async (userEmail) => {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported on this device');
  }

  try {
    // Get authentication options from server
    const response = await fetch('/api/auth/webauthn/login-begin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userEmail })
    });

    if (!response.ok) {
      throw new Error('Failed to get authentication options');
    }

    const options = await response.json();

    // Convert base64url strings to ArrayBuffers
    const publicKeyCredentialRequestOptions = {
      ...options,
      challenge: base64urlToArrayBuffer(options.challenge),
      allowCredentials: options.allowCredentials?.map(cred => ({
        ...cred,
        id: base64urlToArrayBuffer(cred.id)
      })) || []
    };

    // Get credential
    const credential = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });

    // Convert ArrayBuffers back to base64url for transmission
    const credentialData = {
      id: credential.id,
      rawId: arrayBufferToBase64url(credential.rawId),
      response: {
        clientDataJSON: arrayBufferToBase64url(credential.response.clientDataJSON),
        authenticatorData: arrayBufferToBase64url(credential.response.authenticatorData),
        signature: arrayBufferToBase64url(credential.response.signature),
        userHandle: credential.response.userHandle ? arrayBufferToBase64url(credential.response.userHandle) : null
      },
      type: credential.type
    };

    // Send credential to server for verification
    const verificationResponse = await fetch('/api/auth/webauthn/login-finish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentialData)
    });

    if (!verificationResponse.ok) {
      throw new Error('Failed to verify authentication');
    }

    return await verificationResponse.json();
  } catch (error) {
    console.error('WebAuthn authentication error:', error);
    throw error;
  }
};
