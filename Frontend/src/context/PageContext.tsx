import { createContext, useContext, useState, ReactNode } from 'react';

type Page = 'landing' | 'chat' | 'auth' | 'operator';  

interface PageContextType {
  currentPage: Page;
  setPage: (page: Page) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  return (
    <PageContext.Provider value={{ currentPage, setPage: setCurrentPage }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
}
