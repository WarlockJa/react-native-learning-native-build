import { createContext, ReactNode, useState } from "react";
import { Appearance } from "react-native";
import { Colors } from "@/constants/Colors";

type TColorScheme = "light" | "dark" | null | undefined;

interface IThemeContext {
  colorScheme: TColorScheme;
  setColorScheme: (colorScheme: TColorScheme) => void;
  theme: typeof Colors.light;
}

export const ThemeContext = createContext<IThemeContext | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
