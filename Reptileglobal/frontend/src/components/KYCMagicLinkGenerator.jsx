
import { useState } from "react";
import axios from "../lib/axios";

const KYCMagicLinkGenerator = ({ shipment, onClose }) => {
  const [generating, setGenerating] = useState(false);
  const [magicLink, setMagicLink] = useState("");
  const [error, setError] = useState("");

  const generateLink = async () => {
    setGenerating(true);
    setError("");
    
    try {
      const response = await axios.post("/kyc/generate-magic-link", {
        shipmentId: shipment._id,
        userEmail: shipment.recipient.email,
        userName: shipment.recipient.name
      });

      if (response.data.success) {
        setMagicLink(response.data.magicLink);
      }
    } catch (error) {
      console.error("Error generating magic link:", error);
      setError(error.response?.data?.message || "Failed to generate magic link");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(magicLink);
      // You could add a toast notification here
      alert("Magic link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-emerald-400">Generate KYC Magic Link</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-sm text-gray-300">
            <span className="font-medium text-emerald-400">Tracking:</span> {shipment.trackingNumber}
          </p>
          <p className="text-sm text-gray-300">
            <span className="font-medium text-emerald-400">Recipient:</span> {shipment.recipient.name}
          </p>
          <p className="text-sm text-gray-300">
            <span className="font-medium text-emerald-400">Email:</span> {shipment.recipient.email}
          </p>
        </div>

        {!magicLink ? (
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-6">
              Generate a one-time magic link for KYC verification
            </p>
            <button
              onClick={generateLink}
              disabled={generating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? "Generating..." : "Generate Magic Link"}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-emerald-400 mb-3">Magic Link Generated:</p>
            <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg mb-4">
              <p className="text-xs text-gray-300 break-all">{magicLink}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-300"
              >
                Copy Link
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCMagicLinkGenerator;
