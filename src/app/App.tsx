import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useEffect } from "react";
import { Toaster } from "sonner";

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster theme="dark" position="top-center" richColors />
    </>
  );
}