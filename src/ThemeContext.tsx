import React, { createContext, useState, useEffect, useContext } from 'react';

    interface ThemeContextProps {
      darkMode: boolean;
      toggleDarkMode: () => void;
    }
    
    const ThemeContext = createContext<ThemeContextProps>({
      darkMode: false,
      toggleDarkMode: () => {},
    });
    
    export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [darkMode, setDarkMode] = useState(false);
    
      useEffect(() => {
        const storedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(storedDarkMode);
        if (storedDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, []);
    
      useEffect(() => {
        localStorage.setItem('darkMode', String(darkMode));
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, [darkMode]);
    
      const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
      };
    
      return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
          {children}
        </ThemeContext.Provider>
      );
    };
    
    export const useTheme = () => useContext(ThemeContext);
