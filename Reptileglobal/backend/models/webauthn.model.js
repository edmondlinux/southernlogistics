
import mongoose from "mongoose";

const webauthnCredentialSchema = new mongoose.Schema(
  {
    credentialID: {
      type: String,
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    counter: {
      type: Number,
      required: true,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    credentialDeviceType: {
      type: String,
      enum: ["singleDevice", "multiDevice"],
      default: "singleDevice",
    },
    credentialBackedUp: {
      type: Boolean,
      default: false,
    },
    transports: {
      type: [String],
      default: [],
    },
    aaguid: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
webauthnCredentialSchema.index({ credentialID: 1 }, { unique: true });
webauthnCredentialSchema.index({ userId: 1 });
webauthnCredentialSchema.index({ userEmail: 1 });

const WebAuthnCredential = mongoose.model("WebAuthnCredential", webauthnCredentialSchema);

export default WebAuthnCredential;
