export interface ISurveyTheme {
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textLight: string;
    border: string;
    error: string;
    success: string;
    placeholder: string;
    accent: string;
  };
  typography: {
    fontFamily?: string;
    sizeHeader: number;
    sizeTitle: number;
    sizeBody: number;
    sizeSmall: number;
  };
  spacing: {
    xsmall: number;
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
}

export const defaultTheme: ISurveyTheme = {
  colors: {
    primary: "#19b394", // Classic SurveyJS teal
    background: "#f3f3f3",
    surface: "#ffffff",
    text: "#333333",
    textLight: "#666666",
    border: "#dcdcdc",
    error: "#d9534f",
    success: "#5cb85c",
    placeholder: "#a9a9a9",
    accent: "#e7f6f3"
  },
  typography: {
    sizeHeader: 22,
    sizeTitle: 16,
    sizeBody: 14,
    sizeSmall: 12
  },
  spacing: {
    xsmall: 4,
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 24
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12
  }
};

let currentTheme: ISurveyTheme = defaultTheme;

export function getTheme(): ISurveyTheme {
  return currentTheme;
}

export function setTheme(theme: Partial<ISurveyTheme>): void {
  currentTheme = {
    ...defaultTheme,
    ...theme,
    colors: { ...defaultTheme.colors, ...theme.colors },
    typography: { ...defaultTheme.typography, ...theme.typography },
    spacing: { ...defaultTheme.spacing, ...theme.spacing },
    borderRadius: { ...defaultTheme.borderRadius, ...theme.borderRadius }
  };
}
