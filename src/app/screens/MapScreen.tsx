import { useState } from "react";
import { useNavigate } from "react-router";
import { SlidersHorizontal, X, Plus, Minus } from "lucide-react";
import { Button } from "../components/ui/button";
import { mockUsers } from "../data/mockData";
import { UserDetailPopup } from "../components/UserDetailPopup";
import { UserBottomSheet } from "../components/UserBottomSheet";
import { motion, AnimatePresence } from "motion/react";
import { setAuthed } from "../auth";

export function MapScreen() {
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [bottomSheetUserId, setBottomSheetUserId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const selectedUser = mockUsers.find((u) => u.id === selectedUserId);
  const bottomSheetUser = mockUsers.find((u) => u.id === bottomSheetUserId);

  // Convert lat/lng to x/y positions (simplified for demo)
  const getPosition = (lat: number, lng: number) => {
    // Center around San Francisco coordinates
    const baseLat = 37.7749;
    const baseLng = -122.4194;
    
    // Scale factor for positioning
    const scale = 5000;
    
    const x = 50 + (lng - baseLng) * scale;
    const y = 50 + (baseLat - lat) * scale;
    
    return { x, y };
  };

  return (
    <div className="h-screen w-full relative bg-zinc-950 overflow-hidden">
      {/* Logout */}
      <div className="absolute top-6 left-6 z-[1000]">
        <Button
          variant="outline"
          className="h-12 rounded-2xl bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800/60 text-white"
          onClick={() => {
            setAuthed(false);
            navigate("/");
          }}
        >
          Log out
        </Button>
      </div>

      {/* Map Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544411047-c491e34a24e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwbWFwJTIwZGFyayUyMGFlcmlhbHxlbnwxfHx8fDE3NzU0NzIyOTl8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transition: 'transform 0.3s ease',
          filter: 'brightness(0.4)',
        }}
      />

      {/* Map Grid Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transition: 'transform 0.3s ease',
        }}
      />

      {/* User Markers */}
      <div className="absolute inset-0">
        {mockUsers.map((user) => {
          const pos = getPosition(user.location.lat, user.location.lng);
          return (
            <motion.button
              key={user.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * parseInt(user.id), type: "spring" }}
              onClick={() => setSelectedUserId(user.id)}
              className="absolute cursor-pointer group"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `scale(${zoom}) translate(-50%, -50%)`,
                transformOrigin: 'center',
              }}
            >
              {/* User Avatar Pin */}
              <div className="relative">
                <div className="size-14 rounded-full overflow-hidden border-4 border-white shadow-2xl transition-transform group-hover:scale-110">
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Pulse Effect */}
                <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
                
                {/* Score Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                  {user.dambulScore}
                </div>
              </div>

              {/* Hover Label */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/95 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl shadow-xl whitespace-nowrap pointer-events-none border border-zinc-700">
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-zinc-400">{user.age} years old</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Zoom Controls */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute bottom-32 right-6 z-[1000] flex flex-col gap-2"
      >
        <Button
          onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
          className="size-12 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-zinc-50 p-0"
        >
          <Plus className="size-5 text-zinc-900" />
        </Button>
        <Button
          onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
          className="size-12 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-zinc-50 p-0"
        >
          <Minus className="size-5 text-zinc-900" />
        </Button>
      </motion.div>

      {/* Filter Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute top-6 right-6 z-[1000]"
      >
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className="size-14 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-zinc-50 p-0"
        >
          <SlidersHorizontal className="size-6 text-zinc-900" />
        </Button>
      </motion.div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute top-6 right-24 z-[1000] bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-zinc-800 min-w-[280px]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 block mb-2">Distance</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  defaultValue="10"
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 block mb-2">
                  Min Dambul Score
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                Apply Filters
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Detail Popup */}
      <AnimatePresence>
        {selectedUser && (
          <UserDetailPopup
            user={selectedUser}
            onClose={() => setSelectedUserId(null)}
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet Preview */}
      <AnimatePresence>
        {bottomSheetUser && (
          <UserBottomSheet
            user={bottomSheetUser}
            onClose={() => setBottomSheetUserId(null)}
          />
        )}
      </AnimatePresence>

      {/* Map Legend */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-zinc-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-zinc-800">
        <p className="text-white text-sm font-semibold mb-2">📍 Nearby Users</p>
        <p className="text-zinc-400 text-xs">{mockUsers.length} people in your area</p>
      </div>
    </div>
  );
}
