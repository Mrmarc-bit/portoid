"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { person } from "@/resources";

export const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  interface DbProfile {
    appName?: string;
    appIcon?: string;
    appDescription?: string;
    email?: string;
    xUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
  }
  interface DbSettings {
    appName?: string;
    appIcon?: string;
    appDescription?: string;
    xUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
  }
  interface DbSettingsState {
    profile?: DbProfile;
    settings?: DbSettings;
  }
  const [dbSettings, setDbSettings] = useState<DbSettingsState | null>(null);

  useEffect(() => {
    // Fetch live settings and profile from the database
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          setDbSettings({
            profile: data.profile,
            settings: data.settings,
          });
        }
      })
      .catch((err) => console.error("Footer settings fetch failed:", err));
  }, []);

  // Hide the footer on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Resolve values dynamically, falling back to static config values if database fetch is pending
  const displayName = dbSettings?.settings?.appName || dbSettings?.profile?.appName || person.appName || person.name || "Maruf Muchlisin";
  const displayIcon = dbSettings?.settings?.appIcon || dbSettings?.profile?.appIcon || person.appIcon || person.avatar || "/uploads/1782947031367-h25xie8.jpg";
  const displayDesc = dbSettings?.settings?.appDescription || dbSettings?.profile?.appDescription || person.appDescription || "Design Engineer yang berfokus pada pembuatan sistem desain modular, arsitektur web modern yang bersih, dan pengalaman pengguna yang interaktif.";

  const email = dbSettings?.profile?.email || person.email;
  const xUrl = dbSettings?.settings?.xUrl || dbSettings?.profile?.xUrl || person.xUrl;
  const instagramUrl = dbSettings?.settings?.instagramUrl || dbSettings?.profile?.instagramUrl || person.instagramUrl;
  const linkedinUrl = dbSettings?.settings?.linkedinUrl || dbSettings?.profile?.linkedinUrl || person.linkedinUrl;
  const githubUrl = dbSettings?.settings?.githubUrl || dbSettings?.profile?.githubUrl || person.githubUrl;

  return (
    <footer className="w-full px-4 py-8 mt-16">
      <div className="w-full max-w-6xl mx-auto bg-background border border-border rounded-3xl p-6 sm:p-10 shadow-sm transition-colors duration-300">
        {/* Top Section */}
        <div className="grid grid-cols-12 gap-8 md:gap-12">
          {/* Brand Info & Description */}
          <div className="col-span-12 md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <img 
                  src={displayIcon} 
                  alt={`${displayName} Logo`} 
                  className="w-8 h-8 object-cover rounded-full border border-border"
                  onError={(e) => {
                    e.currentTarget.src = "/uploads/1782947031367-h25xie8.jpg";
                  }}
                />
                <span className="font-bold text-lg text-foreground tracking-wide">{displayName}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-sm">
                {displayDesc}
              </p>
            </div>
            {/* Social Media Links */}
            <div className="flex items-center gap-4 mt-6">
              {xUrl && (
                <a 
                  href={xUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-link transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <title>X (Twitter)</title>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {instagramUrl && (
                <a 
                  href={instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-link transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <title>Instagram</title>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              )}
              {linkedinUrl && (
                <a 
                  href={linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-link transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <title>LinkedIn</title>
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              )}
              {githubUrl && (
                <a 
                  href={githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-link transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <title>GitHub</title>
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links Grid */}
          <div className="col-span-12 md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Navigasi Column */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-4">Navigasi</h4>
              <ul className="space-y-3 list-none p-0 m-0">
                <li>
                  <Link href="/" className="text-sm footer-link transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/work" className="text-sm footer-link transition-colors">
                    Proyek Porto
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm footer-link transition-colors">
                    Artikel Blog
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="text-sm footer-link transition-colors">
                    Galeri Foto
                  </Link>
                </li>
                <li>
                  <Link href="/guestbook" className="text-sm footer-link transition-colors">
                    Buku Tamu
                  </Link>
                </li>
              </ul>
            </div>

            {/* Proyek Pilihan Column */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-4">Proyek Pilihan</h4>
              <ul className="space-y-3 list-none p-0 m-0">
                <li>
                  <Link href="/work/automate-design-handovers-with-a-figma-to-code-pipeline" className="text-sm footer-link transition-colors">
                    Figma-to-Code
                  </Link>
                </li>
                <li>
                  <Link href="/work/building-portoid-a-customizable-design-system" className="text-sm footer-link transition-colors">
                    Portoid System
                  </Link>
                </li>
                <li>
                  <Link href="/work/simple-portfolio-builder" className="text-sm footer-link transition-colors">
                    SaaS Porto Builder
                  </Link>
                </li>
              </ul>
            </div>

            {/* Hubungi Saya Column */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-4">Hubungi Saya</h4>
              <ul className="space-y-3 list-none p-0 m-0">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className="text-sm footer-link transition-colors">
                      Kirim Email
                    </a>
                  </li>
                )}
                {githubUrl && (
                  <li>
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm footer-link transition-colors">
                      GitHub Profile
                    </a>
                  </li>
                )}
                {linkedinUrl && (
                  <li>
                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm footer-link transition-colors">
                      LinkedIn
                    </a>
                  </li>
                )}
                <li>
                  <Link href="/guestbook" className="text-sm footer-link transition-colors">
                    Tulis Buku Tamu
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-muted-foreground">
            © {currentYear} {person.name || "Maruf Muchlisin"}. All rights reserved.
          </span>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/privacy" className="footer-link transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="footer-link transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
