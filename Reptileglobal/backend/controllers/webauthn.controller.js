
import crypto from 'crypto';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import User from '../models/user.model.js';
import WebAuthnCredential from '../models/webauthn.model.js';

// Store challenges temporarily (in production, use Redis or similar)
const challenges = new Map();

// Your app's details
const rpName = 'Reptile Global';
const rpID = process.env.NODE_ENV === 'production' ? 'reptileglobal.site' : 'localhost';
const origin = process.env.NODE_ENV === 'production' ? 'https://reptileglobal.site' : 'http://localhost:5173';

export const beginRegistration = async (req, res) => {
  try {
    const { userId, userEmail, userName } = req.body;

    // Verify user exists and is authenticated
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get existing credentials for this user to exclude them
    const existingCredentials = await WebAuthnCredential.find({ userId });
    
    const excludeCredentials = existingCredentials.map(cred => ({
      id: Buffer.from(cred.credentialID, 'base64url'),
      type: 'public-key',
      transports: cred.transports,
    }));

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: Buffer.from(userId),
      userName: userEmail,
      userDisplayName: userName,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    // Store challenge for verification
    challenges.set(userId, options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Error in beginRegistration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const finishRegistration = async (req, res) => {
  try {
    const credential = req.body;
    const userId = req.user._id.toString();

    const expectedChallenge = challenges.get(userId);
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Challenge not found or expired' });
    }

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

      // Save credential to database
      const newCredential = new WebAuthnCredential({
        credentialID: Buffer.from(credentialID).toString('base64url'),
        publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
        counter,
        userId,
        userEmail: req.user.email,
        credentialDeviceType,
        credentialBackedUp,
        transports: credential.response.transports || [],
      });

      await newCredential.save();

      // Clean up challenge
      challenges.delete(userId);

      res.json({ 
        verified: true, 
        message: 'Biometric authentication enabled successfully',
        credentialID: newCredential.credentialID
      });
    } else {
      res.status(400).json({ 
        verified: false, 
        message: 'Failed to verify registration' 
      });
    }
  } catch (error) {
    console.error('Error in finishRegistration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const beginAuthentication = async (req, res) => {
  try {
    const { userEmail } = req.body;

    // Get user's credentials
    const credentials = await WebAuthnCredential.find({ userEmail });
    
    if (credentials.length === 0) {
      return res.status(404).json({ message: 'No credentials found for this user' });
    }

    const allowCredentials = credentials.map(cred => ({
      id: Buffer.from(cred.credentialID, 'base64url'),
      type: 'public-key',
      transports: cred.transports,
    }));

    const options = await generateAuthenticationOptions({
      timeout: 60000,
      allowCredentials,
      userVerification: 'preferred',
      rpID,
    });

    // Store challenge for verification
    challenges.set(userEmail, options.challenge);

    res.json(options);
  } catch (error) {
    console.error('Error in beginAuthentication:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const finishAuthentication = async (req, res) => {
  try {
    const credential = req.body;
    const userEmail = req.body.userEmail || challenges.get('userEmail');

    const expectedChallenge = challenges.get(userEmail);
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Challenge not found or expired' });
    }

    // Find the credential
    const dbCredential = await WebAuthnCredential.findOne({
      credentialID: Buffer.from(credential.rawId, 'base64url').toString('base64url')
    });

    if (!dbCredential) {
      return res.status(404).json({ message: 'Credential not found' });
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(dbCredential.credentialID, 'base64url'),
        credentialPublicKey: Buffer.from(dbCredential.publicKey, 'base64url'),
        counter: dbCredential.counter,
        transports: dbCredential.transports,
      },
    });

    if (verification.verified) {
      // Update counter
      dbCredential.counter = verification.authenticationInfo.newCounter;
      await dbCredential.save();

      // Get user
      const user = await User.findById(dbCredential.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Set session cookie
      res.cookie("userId", user._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Clean up challenge
      challenges.delete(userEmail);

      res.json({
        verified: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({ 
        verified: false, 
        message: 'Failed to verify authentication' 
      });
    }
  } catch (error) {
    console.error('Error in finishAuthentication:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserCredentials = async (req, res) => {
  try {
    const userId = req.user._id;
    const credentials = await WebAuthnCredential.find({ userId }).select('credentialID createdAt credentialDeviceType');
    
    res.json({ 
      credentials: credentials.map(cred => ({
        id: cred.credentialID,
        createdAt: cred.createdAt,
        deviceType: cred.credentialDeviceType
      }))
    });
  } catch (error) {
    console.error('Error in getUserCredentials:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const userId = req.user._id;

    const credential = await WebAuthnCredential.findOneAndDelete({
      credentialID: credentialId,
      userId
    });

    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }

    res.json({ message: 'Credential deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCredential:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
