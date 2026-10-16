import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center px-5 text-center">
      <div>
        <div className="text-7xl md:text-9xl font-black bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
          404
        </div>
        <p className="mt-4 text-slate-300">This page took a wrong turn.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-white text-black px-5 py-3 font-semibold hover:bg-slate-200"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
