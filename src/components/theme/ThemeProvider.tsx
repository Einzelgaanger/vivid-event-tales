
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'vault';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('vault');

  useEffect(() => {
    const savedTheme = localStorage.getItem('memvault-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('memvault-theme', theme);
    
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark', 'vault');
    document.documentElement.classList.add(theme);
    
    // Update CSS custom properties for vault theme
    if (theme === 'vault') {
      document.documentElement.style.setProperty('--primary', '213 89% 55%'); // Blue
      document.documentElement.style.setProperty('--secondary', '222 84% 5%'); // Near black
      document.documentElement.style.setProperty('--accent', '213 89% 65%'); // Light blue
      document.documentElement.style.setProperty('--background', '222 84% 4%'); // Dark background
      document.documentElement.style.setProperty('--foreground', '210 40% 98%'); // Light text
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
