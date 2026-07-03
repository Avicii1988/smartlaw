import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { SidebarProvider, useSidebar } from './SidebarContext';

function LayoutInner({ children }: { children: ReactNode }) {
  const { open, close } = useSidebar();
  return (
    <div className="flex min-h-screen bg-gray-50">
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={close} />
      )}
      <Sidebar />
      <main className="flex-1 lg:ml-[220px] flex flex-col min-h-screen w-full overflow-x-hidden">
        <div className="flex-1">{children}</div>
        <footer className="lg:ml-0 border-t border-gray-100 px-6 py-3 flex items-center justify-between text-xs text-gray-400">
          <span>smartlaw · Schweizer Kanzleisoftware</span>
          <span>© 2025</span>
        </footer>
      </main>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  );
}
