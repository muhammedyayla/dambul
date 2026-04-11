import { motion } from "motion/react";

export function LoginScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <h1 className="mb-2 text-5xl font-black tracking-tight text-white">Dambul</h1>
        <p className="mb-2 text-zinc-400">Yakınındaki insanları keşfet</p>
        <p className="mb-8 text-sm text-zinc-500">
          E-posta/şifre yok. İlk Google girişinde hesap otomatik oluşur.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="http://localhost:3001/api/auth/google"
            className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-white text-base font-semibold text-zinc-900 transition hover:bg-zinc-100"
          >
            Google ile Giriş Yap
          </a>
          <a
            href="http://localhost:3001/api/auth/google"
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-zinc-600 bg-transparent text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
          >
            Google ile Kayıt Ol
          </a>
        </div>
        <p className="mt-6 text-xs text-zinc-600">
          Her iki düğme de aynı güvenli Google girişine gider; kayıt ve giriş tek adımdır.
        </p>
      </motion.div>
    </div>
  );
}
