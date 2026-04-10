import React from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";

const Alert = ({ type, message, onClose }) => {
  const bgColor = type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const Icon = type === "success" ? CheckCircle : AlertCircle;
  const iconColor = type === "success" ? "text-green-500" : "text-red-500";

  return (
    <div className={`flex items-center gap-3 p-4 border rounded-xl mb-6 animate-fadeIn ${bgColor}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
      <p className={`text-sm font-medium ${textColor} flex-1`}>{message}</p>
      {onClose && (
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
