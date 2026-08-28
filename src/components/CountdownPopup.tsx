"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, ShieldCheck } from "lucide-react";
import CryptoJS from "crypto-js";

const OPENING_TIME = new Date("2026-08-29T09:00:00+07:00").getTime();
const AUTH_ROUTES = ["/signin", "/signup", "/verify-email", "/forgot-password", "/reset-password"];
const EXEMPT_ROLES = ["admin", "superadmin"];

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft | null {
  const difference = OPENING_TIME - Date.now();
  if (difference <= 0) return null;

  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

function hasLoginToken() {
  const localToken = window.localStorage.getItem("token");
  const cookieToken = document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith("token="));

  return Boolean(localToken || cookieToken);
}

function getCookieValue(name: string) {
  const cookie = document.cookie
    .split(";")
    .find((item) => item.trim().startsWith(`${name}=`));

  if (!cookie) return null;
  return decodeURIComponent(cookie.trim().slice(name.length + 1));
}

type LoggedInUser = {
  role?: string;
  fullName?: string;
};

function getLoggedInUser(): LoggedInUser | null {
  const encryptedUserData = window.localStorage.getItem("userData") ?? getCookieValue("userData");
  if (!encryptedUserData) return null;

  try {
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || "elobright_secret_key";
    const bytes = CryptoJS.AES.decrypt(encryptedUserData, secretKey);
    const user = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return {
      role: typeof user?.role === "string" ? user.role.toLowerCase() : undefined,
      fullName: typeof user?.fullName === "string" ? user.fullName : undefined,
    };
  } catch {
    return null;
  }
}

export default function CountdownPopup() {
  const pathname = usePathname();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [shouldBlock, setShouldBlock] = useState(false);
  const [userName, setUserName] = useState("Pengguna");

  useEffect(() => {
    const isAuthRoute = AUTH_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
    const loggedInUser = getLoggedInUser();
    const isExemptRole = Boolean(loggedInUser?.role && EXEMPT_ROLES.includes(loggedInUser.role));
    const isBlocked = hasLoginToken()
      && !isAuthRoute
      && !isExemptRole
      && Date.now() < OPENING_TIME;

    const initializationTimer = window.setTimeout(() => {
      setShouldBlock(isBlocked);
      setTimeLeft(isBlocked ? getTimeLeft() : null);
      setUserName(loggedInUser?.fullName || "Pengguna");
    }, 0);

    if (!isBlocked) return () => window.clearTimeout(initializationTimer);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setInterval(() => {
      const nextTimeLeft = getTimeLeft();
      setTimeLeft(nextTimeLeft);

      if (!nextTimeLeft) {
        setShouldBlock(false);
        document.body.style.overflow = previousOverflow;
        window.clearInterval(timer);

        const userRole = loggedInUser?.role;
        if (userRole === "student" || userRole === "students" || userRole === "user") {
          router.push("/exams/8bcb5815-143b-489d-852c-aaa9134a7cd3/introduction");
        }
      }
    }, 1_000);

    return () => {
      window.clearTimeout(initializationTimer);
      window.clearInterval(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [pathname]);

  const handleBackToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "userData=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "userId=; path=/; max-age=0; SameSite=Lax";
    setShouldBlock(false);
    router.push("/signin");
    router.refresh();
  };

  if (!shouldBlock || !timeLeft) return null;

  const countdownItems = [
    { label: "Hari", value: timeLeft.days },
    { label: "Jam", value: timeLeft.hours },
    { label: "Menit", value: timeLeft.minutes },
    { label: "Detik", value: timeLeft.seconds },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/90 p-4 backdrop-blur-lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certification-countdown-title"
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-white p-6 text-center shadow-2xl sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-100/70 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-cyan-100/70 blur-2xl" />

        <div className="relative">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-200">
            <CalendarDays size={30} />
          </div>

          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
            <ShieldCheck size={13} /> Informasi Ujian
          </span>
          <p className="mb-2 text-sm font-semibold text-blue-600">Selamat datang, {userName}</p>
          <h2 id="certification-countdown-title" className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Ujian Belum Dibuka
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
            Ujian sertifikasi bahasa Inggris akan dibuka pada tanggal{" "}
            <strong className="text-slate-900">29 Agustus 2026 pukul 09.00 WIB</strong>.
          </p>

          <div className="my-7 grid grid-cols-4 gap-2 sm:gap-3" aria-label="Waktu menuju pembukaan ujian">
            {countdownItems.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-1 py-3 sm:py-4">
                <div className="font-mono text-2xl font-black tabular-nums text-blue-600 sm:text-3xl">
                  {item.value.toString().padStart(2, "0")}
                </div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:text-[10px]">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
            <Clock3 size={15} className="text-blue-500" />
            Halaman akan terbuka otomatis setelah hitung mundur selesai.
          </div>

          <button
            type="button"
            onClick={handleBackToLogin}
            className="mx-auto mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <ArrowLeft size={16} /> Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  );
}
