import type { User } from "./mockData";

/** Logged-in user for Settings / map avatar (mock). */
export const currentUser: User = {
  id: "me",
  name: "Sen",
  photo:
    "https://images.unsplash.com/photo-1737574821698-862e77f044c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB5b3VuZyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NTQ3MTUyOHww&ixlib=rb-4.1.0&q=80&w=1080",
  bio: "Haritada keşfetmeyi seven biri.",
  age: 28,
  gender: "Erkek",
  dambulScore: 88,
  location: { lat: 37.7749, lng: -122.4194 },
};
