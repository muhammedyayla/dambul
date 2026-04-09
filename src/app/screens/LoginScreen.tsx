import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, Users, Globe } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "motion/react";
import { setAuthed } from "../auth";

export function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthed(true);
    navigate("/map");
  };

  const handleSocialLogin = () => {
    setAuthed(true);
    navigate("/map");
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            Dambul
          </h1>
          <p className="text-zinc-400">Discover people nearby</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 h-14 text-white placeholder:text-zinc-500 focus:border-zinc-700"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 h-14 text-white placeholder:text-zinc-500 focus:border-zinc-700"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
          >
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-zinc-950 text-zinc-500">Or continue with</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-8">
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 rounded-2xl bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800/50 text-white"
            onClick={handleSocialLogin}
          >
            <Users className="mr-2 size-5" />
            Continue with Facebook
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-14 rounded-2xl bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800/50 text-white"
            onClick={handleSocialLogin}
          >
            <Globe className="mr-2 size-5" />
            Continue with Google
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-zinc-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Sign Up
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
