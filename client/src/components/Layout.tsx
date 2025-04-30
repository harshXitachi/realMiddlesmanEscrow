import { ReactNode } from "react";
import Navbar from "./Navbar";

type LayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-poppins font-bold">{title}</h1>
          </div>
        )}
        
        {children}
      </main>
      
      <footer className="py-4 border-t border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Middlesman. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
