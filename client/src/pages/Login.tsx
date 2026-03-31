import { useState } from "react";
import { useLocation } from "wouter";
import { Zap } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google login failed");
      navigate("/"); window.location.reload();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* bg blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 glow-primary">
            <Zap className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black text-foreground">
            Urban<span className="text-primary">Cartel</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-8 space-y-6">
          {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg text-center">{error}</p>}

          <div className="flex justify-center flex-col items-center gap-2">
            <div className={loading ? "opacity-50 pointer-events-none transition-opacity" : ""}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
                theme="filled_black"
                text="continue_with"
                type="standard"
                size="large"
              />
            </div>
            {loading && <p className="text-xs text-muted-foreground mt-2 animate-pulse">Authenticating...</p>}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Connect your Google account to get started securely.
        </p>
      </div>
    </div>
  );
}
