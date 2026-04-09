import { useState } from "react";
import { useNavigate } from "react-router";
import { MapPin, Phone, Briefcase, GraduationCap, Heart, Camera, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { motion } from "motion/react";

export function CustomizeProfileScreen() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [interests, setInterests] = useState("");
  const [bio, setBio] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const handleVerifyAccount = () => {
    // Placeholder for future camera verification functionality
    alert("Account verification will open your camera to verify your identity. This feature is coming soon!");
    setIsVerified(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile and navigate to login
    navigate("/");
  };

  const handleSkip = () => {
    // Skip customization and go to login
    navigate("/");
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
              Customize Profile
            </h1>
            <p className="text-zinc-400">Add your personal information</p>
          </div>

          {/* Verification Status */}
          {!isVerified ? (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
              <div className="flex items-start gap-3">
                <ShieldCheck className="size-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-yellow-500 font-semibold mb-1">Account Not Verified</h3>
                  <p className="text-sm text-zinc-400 mb-3">
                    Verify your identity with live face recognition to increase trust
                  </p>
                  <Button
                    type="button"
                    onClick={handleVerifyAccount}
                    className="w-full h-12 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <Camera className="mr-2 size-5" />
                    Verify Account
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-green-500" />
                <div>
                  <h3 className="text-green-500 font-semibold">Account Verified</h3>
                  <p className="text-sm text-zinc-400">Your identity has been confirmed</p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-zinc-400">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                <Input
                  id="location"
                  type="text"
                  placeholder="City, Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 h-14 text-white placeholder:text-zinc-500 focus:border-zinc-700"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-400">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 h-14 text-white placeholder:text-zinc-500 focus:border-zinc-700"
                />
              </div>
            </div>

            {/* Occupation */}
            <div className="space-y-2">
              <Label htmlFor="occupation" className="text-zinc-400">
                Occupation
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                <Input
                  id="occupation"
                  type="text"
                  placeholder="Your job title"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 h-14 text-white placeholder:text-zinc-500 focus:border-zinc-700"
                />
              </div>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <Label htmlFor="education" className="text-zinc-400">
                Education
              </Label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                <Input
                  id="education"
                  type="text"
                  placeholder="Your school or university"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 h-14 text-white placeholder:text-zinc-500 focus:border-zinc-700"
                />
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label htmlFor="interests" className="text-zinc-400">
                Interests
              </Label>
              <div className="relative">
                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                <Input
                  id="interests"
                  type="text"
                  placeholder="Music, Travel, Sports..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="w-full bg-zinc-900/50 border-zinc-800 rounded-2xl pl-12 h-14 text-white placeholder:text-zinc-500 focus:border-zinc-700"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-zinc-400">
                About You
              </Label>
              <Textarea
                id="bio"
                placeholder="Write a short bio about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-zinc-900/50 border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-500 focus:border-zinc-700 min-h-[100px] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={handleSkip}
                variant="outline"
                className="flex-1 h-14 rounded-2xl bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800/50 text-white"
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
              >
                Save Profile
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
