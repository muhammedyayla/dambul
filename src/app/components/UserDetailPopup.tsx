import { useNavigate } from "react-router";
import { X, MapPin, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import type { User } from "../data/mockData";

interface UserDetailPopupProps {
  user: User;
  onClose: () => void;
}

export function UserDetailPopup({ user, onClose }: UserDetailPopupProps) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/profile/${user.id}`);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Popup Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 max-w-sm w-full"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 size-10 rounded-full bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center text-white shadow-lg hover:bg-zinc-950"
        >
          <X className="size-5" />
        </button>

        {/* User Photo */}
        <div className="relative h-80 w-full">
          <img
            src={user.photo}
            alt={user.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
        </div>

        {/* User Info */}
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-black text-white mb-1">{user.name}</h2>
            <p className="text-zinc-400">{user.age} years old • {user.gender}</p>
          </div>

          {/* Bio */}
          <p className="text-zinc-300 text-sm mb-4 line-clamp-2">{user.bio}</p>
        </div>
      </motion.div>
    </div>
  );
}