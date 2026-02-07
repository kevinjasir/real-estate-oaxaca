"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check current session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowUserMenu(false);
  };

  // Get user's first name or email
  const getUserDisplayName = () => {
    if (!user) return "";
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
    if (fullName) {
      return fullName.split(" ")[0]; // First name only
    }
    return user.email?.split("@")[0] || "Usuario";
  };

  // Get user's avatar or initials
  const getUserAvatar = () => {
    if (!user) return null;
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    if (avatarUrl) {
      return avatarUrl;
    }
    return null;
  };

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/95 shadow-sm backdrop-blur-md"
        : "bg-transparent"
        }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className={`text-xl font-bold transition-colors ${isScrolled ? "text-[var(--foreground)]" : "text-white"
              }`}
          >
            Costa Oaxaca
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#proyectos"
              className={`text-sm font-medium transition-colors ${isScrolled
                ? "text-[var(--foreground)] hover:text-[var(--primary)]"
                : "text-white/90 hover:text-white"
                }`}
            >
              Proyectos
            </a>
            <a
              href="#contacto"
              className={`text-sm font-medium transition-colors ${isScrolled
                ? "text-[var(--foreground)] hover:text-[var(--primary)]"
                : "text-white/90 hover:text-white"
                }`}
            >
              Contacto
            </a>
            <a
              href="#contacto"
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${isScrolled
                ? "btn-primary"
                : "bg-white text-[var(--foreground)] hover:bg-white/90"
                }`}
            >
              Hablar con asesor
            </a>

            {/* User Menu or Login Button */}
            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${isScrolled
                    ? "text-[var(--foreground)] hover:text-[var(--primary)]"
                    : "text-white hover:text-white/80"
                    }`}
                >
                  {getUserAvatar() ? (
                    <img
                      src={getUserAvatar()!}
                      alt={getUserDisplayName()}
                      className="h-8 w-8 rounded-full object-cover border-2 border-white/50"
                    />
                  ) : (
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${isScrolled ? "bg-emerald-100 text-emerald-700" : "bg-white/20 text-white"
                      }`}>
                      {getInitials()}
                    </div>
                  )}
                  <span className="hidden lg:inline">{getUserDisplayName()}</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.user_metadata?.full_name || getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${isScrolled
                  ? "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                  : "text-white/70 hover:text-white"
                  }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Iniciar sesión
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden ${isScrolled ? "text-[var(--foreground)]" : "text-white"
              }`}
            aria-label="Abrir menú"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-[var(--border)] bg-white pb-4 pt-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a
                href="#proyectos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
              >
                Proyectos
              </a>
              <a
                href="#contacto"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
              >
                Contacto
              </a>
              <a
                href="#contacto"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary mx-4 rounded-lg px-5 py-2.5 text-center text-sm font-semibold"
              >
                Hablar con asesor
              </a>

              {/* Mobile User Menu */}
              {user ? (
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <div className="px-4 py-2 flex items-center gap-3">
                    {getUserAvatar() ? (
                      <img
                        src={getUserAvatar()!}
                        alt={getUserDisplayName()}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                        {getInitials()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 mt-2"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header >
  );
}
