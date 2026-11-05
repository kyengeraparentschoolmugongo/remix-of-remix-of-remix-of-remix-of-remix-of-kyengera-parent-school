import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import menu from '@/data/navigation/menu.json';
import { AppBar } from '@/components/navigation/app-bar';
import { SideDrawer } from '@/components/navigation/side-drawer';
import { activeBranch } from '@/components/navigation/nav-tree';

export function LibraryShell({ children }: { children: ReactNode }) {
  const pathname = useLocation({ select: location => location.pathname });
  const [openPath, setOpenPath] = useState<number[]>(() => activeBranch(menu, pathname));
  const previousPathname = useRef(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopClosed, setDesktopClosed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => { setIsMobile(media.matches); setMobileOpen(false); };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    setMobileOpen(false); setProfileOpen(false);
    if (previousPathname.current !== pathname) {
      setOpenPath([]);
      previousPathname.current = pathname;
    }
  }, [pathname]);
  const navigate = useCallback(() => { setOpenPath([]); setMobileOpen(false); setProfileOpen(false); }, []);
  const toggleBranch = useCallback((path: number[]) => {
    setOpenPath(current => path.every((index, level) => current[level] === index) ? path.slice(0, -1) : path);
  }, []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);
  const toggleProfile = useCallback(() => setProfileOpen(value => !value), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const closeMobileAndFocus = useCallback(() => {
    setMobileOpen(false);
    trigger.current?.focus();
  }, []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileOpen) closeMobileAndFocus();
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [mobileOpen, closeMobileAndFocus]);
  const toggle = useCallback(() => {
    setProfileOpen(false);
    if (window.matchMedia('(max-width: 767px)').matches) setMobileOpen(value => !value);
    else setDesktopClosed(value => !value);
  }, []);
  return <div className={`library-shell ${mobileOpen ? 'library-mobile-open' : ''} ${desktopClosed ? 'library-desktop-closed' : ''}`}>
    <AppBar triggerRef={trigger} menuExpanded={isMobile ? mobileOpen : !desktopClosed} profileOpen={profileOpen} onToggleMenu={toggle} onToggleProfile={toggleProfile} onCloseProfile={closeProfile} />
    <SideDrawer mobileOpen={mobileOpen} pathname={pathname} openPath={openPath} onClose={closeMobile} onCloseAndFocus={closeMobileAndFocus} onToggleBranch={toggleBranch} onNavigate={navigate} />
    <main className="library-content">{children}</main>
  </div>;
}