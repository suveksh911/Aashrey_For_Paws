import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Home, History, Gift } from "lucide-react";
import api from "../services/axios";
import { toast } from "react-toastify";

/**
 * Global Callback Page for Khalti e-Payment.
 * Handles both Pet Purchases and Donations.
 */
const KhaltiPaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [state, setState] = useState("verifying"); // 'verifying' | 'success' | 'failed'
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    const status = searchParams.get("status");

    if (!pidx) {
      setState("failed");
      setErrorMsg("No payment identifier (pidx) received from Khalti.");
      return;
    }

    if (status && status !== "Completed") {
      setState("failed");
      setErrorMsg(`Payment was not completed. Status: ${status}`);
      return;
    }

    const verify = async () => {
      try {
        const res = await api.post("/payment/verify", { pidx });
        if (res.data.success) {
          setPaymentData(res.data.paymentRecord || res.data.data);
          setState("success");
          toast.success("Payment verified successfully!");
        } else {
          setErrorMsg(res.data.message || "Verification failed.");
          setState("failed");
        }
      } catch (err) {
        console.error("Verification Error:", err);
        setErrorMsg(err?.response?.data?.message || "Server error during verification.");
        setState("failed");
      }
    };

    verify();
  }, [searchParams]);

  const isDonation = paymentData?.purpose === "Donation";

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4 py-20">
      <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-2xl max-w-lg w-full text-center border border-[#EFEBE9]">
        
        {/* Verification in progress */}
        {state === "verifying" && (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin text-[#8D6E63]" size={64} />
            </div>
            <h2 className="text-2xl font-bold text-[#3E2723]">Verifying Payment</h2>
            <p className="text-gray-500">
              Please stay on this page while we confirm your transaction with Khalti...
            </p>
          </div>
        )}

        {/* Success State */}
        {state === "success" && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm">
              <CheckCircle className="text-green-500" size={48} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-[#3E2723]">Success!</h2>
              <p className="text-[#8D6E63] font-medium">
                {isDonation 
                  ? "Thank you for your generous donation! ❤️" 
                  : "Your pet purchase was successful! 🐾"}
              </p>
            </div>

            <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EFEBE9] text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Purpose:</span>
                <span className="font-bold text-[#3E2723]">{paymentData?.purpose || "Payment"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="font-bold text-[#3E2723]">Rs. {paymentData?.amount || "--"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-600 font-bold uppercase">Completed</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <button
                onClick={() => navigate(isDonation ? "/donate" : "/user?tab=history")}
                className="flex items-center justify-center gap-2 py-3 px-6 bg-[#8D6E63] text-white rounded-xl font-bold hover:bg-[#795548] transition-all shadow-lg shadow-brown-100"
              >
                {isDonation ? <Gift size={18} /> : <History size={18} />}
                {isDonation ? "Donate More" : "View History"}
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 py-3 px-6 bg-white text-[#8D6E63] border-2 border-[#EFEBE9] rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                <Home size={18} />
                Back Home
              </button>
            </div>
          </div>
        )}

        {/* Failed State */}
        {state === "failed" && (
          <div className="space-y-6">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm">
              <XCircle className="text-red-500" size={48} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-[#3E2723]">Oops!</h2>
              <p className="text-red-600 font-medium">Payment Verification Failed</p>
            </div>

            <p className="text-gray-500 bg-red-50 p-4 rounded-xl border border-red-100 text-sm">
              {errorMsg || "Something went wrong while verifying your payment. Please contact our support team."}
            </p>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={() => navigate(-1)}
                className="w-full py-3 bg-[#3E2723] text-white rounded-xl font-bold hover:bg-black transition-all"
              >
                Try Again
              </button>
              <Link
                to="/contact"
                className="text-sm font-bold text-[#8D6E63] hover:underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-[#F5F5F5]">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Aashrey For Paws Security System
          </p>
        </div>
      </div>
    </div>
  );
};

export default KhaltiPaymentCallbackPage;
