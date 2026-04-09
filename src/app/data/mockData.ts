export interface User {
  id: string;
  name: string;
  photo: string;
  bio: string;
  age: number;
  gender: string;
  dambulScore: number;
  location: {
    lat: number;
    lng: number;
  };
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Marcus Chen",
    photo: "https://images.unsplash.com/photo-1737574821698-862e77f044c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB5b3VuZyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NTQ3MTUyOHww&ixlib=rb-4.1.0&q=80&w=1080",
    bio: "Tech enthusiast, coffee lover, and weekend hiker",
    age: 28,
    gender: "Male",
    dambulScore: 86,
    location: { lat: 37.7749, lng: -122.4194 },
  },
  {
    id: "2",
    name: "Sarah Johnson",
    photo: "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB5b3VuZyUyMHdvbWFuJTIwc21pbGluZ3xlbnwxfHx8fDE3NzUzNzExMTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    bio: "Artist & Designer | Love connecting with creative people",
    age: 26,
    gender: "Female",
    dambulScore: 91,
    location: { lat: 37.7849, lng: -122.4094 },
  },
  {
    id: "3",
    name: "James Wilson",
    photo: "https://images.unsplash.com/photo-1611095006856-19f5ffdca7f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMGNhc3VhbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NTQyNTM1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    bio: "Fitness coach and nutrition expert",
    age: 30,
    gender: "Male",
    dambulScore: 74,
    location: { lat: 37.7649, lng: -122.4294 },
  },
  {
    id: "4",
    name: "Emily Parker",
    photo: "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc3NTQxNjU4MHww&ixlib=rb-4.1.0&q=80&w=1080",
    bio: "Marketing professional | Travel enthusiast ✈️",
    age: 27,
    gender: "Female",
    dambulScore: 88,
    location: { lat: 37.7549, lng: -122.4394 },
  },
  {
    id: "5",
    name: "Mei Lin",
    photo: "https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc1NDAxNjMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    bio: "Software engineer | Music lover | Foodie 🍜",
    age: 25,
    gender: "Female",
    dambulScore: 95,
    location: { lat: 37.7949, lng: -122.3994 },
  },
];