import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { mockUsers } from "../data/mockData";
import { motion } from "motion/react";

export function ProfileScreen() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
        <p className="text-white">User not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-zinc-950 overflow-auto">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate("/map")}
        className="fixed top-6 left-6 z-10 size-12 rounded-full bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center text-white shadow-lg"
      >
        <ArrowLeft className="size-5" />
      </motion.button>

      {/* Profile Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Profile Image */}
        <div className="relative h-[500px] w-full">
          <img
            src={user.photo}
            alt={user.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="px-6 -mt-32 relative z-10">
          <div className="mb-6">
            <h1 className="text-4xl font-black text-white mb-2">{user.name}</h1>
            <p className="text-xl text-zinc-400">{user.age} years old • {user.gender}</p>
          </div>

          {/* Bio */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-3">About</h3>
            <p className="text-zinc-300 leading-relaxed">{user.bio}</p>
          </div>

          {/* Connect Button */}
          <div className="sticky bottom-0 bg-zinc-950 py-6 border-t border-zinc-900">
            <Button className="w-full h-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg shadow-lg shadow-indigo-500/20">
              Connect with {user.name.split(" ")[0]}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}