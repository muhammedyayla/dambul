import { useState } from "react";
import { useNavigate } from "react-router";
import { Camera, User, Calendar, Mail, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { motion } from "motion/react";

export function RegisterScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to customize profile after registration
    navigate("/customize-profile");
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 overflow-auto">
      <div className="min-h-full flex items-center justify-center p-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
              Join Dambul
            </h1>
            <p className="text-zinc-400">Create your profile</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="size-32 rounded-full bg-zinc-900/50 border-2 border-zinc-800 flex items-center justify-center overflow-hidden">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Profile"
                      className="size-full object-cover"
                    />
                  ) : (
                    <Camera className="size-10 text-zinc-600" />
                  )}
                </div>
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 size-10 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center cursor-pointer shadow-lg"
                >
                  <Camera className="size-5 text-white" />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-zinc-500">Upload your photo</p>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 h-14 text-white placeholder:text-zinc-500 focus:border-zinc-700"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 h-14 text-white placeholder:text-zinc-500 focus:border-zinc-700"
                />
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-400">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 h-14 text-white placeholder:text-zinc-500 focus:border-zinc-700"
                />
              </div>
            </div>

            {/* Age Input */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-zinc-400">
                Age
              </Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="18"
                  max="99"
                  className="w-full bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 h-14 text-white placeholder:text-zinc-500 focus:border-zinc-700"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-3">
              <Label className="text-zinc-400">Gender</Label>
              <RadioGroup value={gender} onValueChange={setGender}>
                <div className="flex gap-4">
                  <label
                    htmlFor="male"
                    className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      gender === "male"
                        ? "bg-indigo-600/20 border-indigo-600"
                        : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <RadioGroupItem value="male" id="male" />
                    <span className="text-white">Male</span>
                  </label>

                  <label
                    htmlFor="female"
                    className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      gender === "female"
                        ? "bg-indigo-600/20 border-indigo-600"
                        : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <RadioGroupItem value="female" id="female" />
                    <span className="text-white">Female</span>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
            >
              Create Account
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <p className="text-zinc-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}