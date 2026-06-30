"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    await signIn("credentials", {
      username,
      password,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f0f1a] px-4">
      <div className="w-full max-w-sm bg-[#16162a] border border-white/10 rounded-xl p-8">

        <div className="flex items-center gap-3 mb-8">
          <div>
            <p className="text-white font-medium text-base leading-tight">Les 3 balais</p>
            <p className="text-white/40 text-xs">Espace administration</p>
          </div>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-xs text-white/50 mb-1.5">Nom d&apos;utilisateur</label>
          <input
            type="text"
            placeholder="ex: johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#a89af9]/50"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-xs text-white/50 mb-1.5">Mot de passe</label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#a89af9]/50 pr-10"
            />
            <button
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs"
            >
              {showPwd ? "Cacher" : "Voir"}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] font-medium text-sm rounded-lg py-2.5 transition-colors disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

      </div>
    </main>
  );
}