import { useNavigate } from "react-router";
import { X, MapPin, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import type { User } from "../data/mockData";

interface UserBottomSheetProps {
  user: User;
  onClose: () => void;
}

export function UserBottomSheet({ user, onClose }: UserBottomSheetProps) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/profile/${user.id}`);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[1500] bg-black/40 backdrop-blur-sm"
      />

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[1600] bg-zinc-900 rounded-t-3xl shadow-2xl border-t border-zinc-800 max-h-[70vh] overflow-auto"
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 size-10 rounded-full bg-zinc-800 flex items-center justify-center text-white shadow-lg hover:bg-zinc-700"
        >
          <X className="size-5" />
        </button>

        {/* Content */}
        <div className="p-6 pt-4">
          {/* User Photo */}
          <div className="flex items-start gap-4 mb-6">
            <img
              src={user.photo}
              alt={user.name}
              className="size-20 rounded-2xl object-cover shadow-lg"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-black text-white mb-1">{user.name}</h2>
              <p className="text-zinc-400 mb-2">{user.age} years old • {user.gender}</p>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-2">About</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">{user.bio}</p>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-6">
            <MapPin className="size-4" />
            <span>San Francisco, CA</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleViewProfile}
              className="flex-1 h-14 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              View Full Profile
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              Connect
            </Button>
          </div>
        </div>

        {/* Bottom Safe Area */}
        <div className="h-6" />
      </motion.div>
    </>
  );
}