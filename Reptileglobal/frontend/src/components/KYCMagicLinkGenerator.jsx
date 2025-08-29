
import { useState } from "react";
import axios from "../lib/axios";
import { X, Link, Copy, Mail, Package } from "lucide-react";

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
      // Using a simple alert for now - you could integrate react-hot-toast here
      alert("Magic link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-emerald-400 flex items-center gap-2">
            <Link className="w-6 h-6" />
            Generate KYC Magic Link
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 transition duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Shipment Information Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Package className="w-6 h-6 text-emerald-400 mr-2" />
            <h3 className="text-xl font-semibold text-emerald-400">
              Shipment Details
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tracking Number
              </label>
              <p className="text-white bg-gray-700 rounded-lg px-4 py-3 font-mono">
                {shipment.trackingNumber}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Current Status
              </label>
              <p className="text-white bg-gray-700 rounded-lg px-4 py-3 capitalize">
                {shipment.status.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center mb-2">
              <Mail className="w-5 h-5 text-emerald-400 mr-2" />
              <label className="block text-sm font-medium text-gray-300">
                Recipient Information
              </label>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-white mb-1">
                <span className="text-gray-300">Name:</span> {shipment.recipient.name}
              </p>
              <p className="text-white">
                <span className="text-gray-300">Email:</span> {shipment.recipient.email}
              </p>
            </div>
          </div>
        </div>

        {/* Magic Link Generation Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          {!magicLink ? (
            <div className="text-center">
              <div className="mb-4">
                <Link className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-emerald-400 mb-2">
                  KYC Verification Link
                </h3>
                <p className="text-gray-300 text-sm mb-6">
                  Generate a secure one-time magic link for KYC verification. 
                  This link will be valid for 24 hours and can only be used once.
                </p>
              </div>
              
              <button
                onClick={generateLink}
                disabled={generating}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition duration-300 flex items-center gap-2 mx-auto"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating Link...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4" />
                    Generate Magic Link
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-4">
                <Link className="w-6 h-6 text-emerald-400 mr-2" />
                <h3 className="text-xl font-semibold text-emerald-400">
                  Magic Link Generated Successfully
                </h3>
              </div>
              
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Generated Link
                </label>
                <div className="bg-gray-900 rounded border border-gray-600 p-3">
                  <p className="text-emerald-400 text-xs font-mono break-all">
                    {magicLink}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-300 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-900/50 border border-red-700 rounded-lg p-4">
              <p className="text-red-300 text-sm flex items-center gap-2">
                <X className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCMagicLinkGenerator;
