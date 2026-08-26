// Theme management service (Light / Dark mode)

export type Theme = 'light' | 'dark';

class ThemeEngine {
  private currentTheme: Theme = 'light';
  private listeners: Set<(theme: Theme) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = (localStorage.getItem('quickpair_theme') || localStorage.getItem('simplesavr_theme')) as Theme;
      if (saved === 'dark' || saved === 'light') {
        this.currentTheme = saved;
      } else {
        this.currentTheme = 'light'; // Light mode is default
      }
      this.applyTheme();
    }
  }

  public getTheme(): Theme {
    return this.currentTheme;
  }

  public toggleTheme(): Theme {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem('quickpair_theme', this.currentTheme);
    } catch {}
    this.applyTheme();
    this.notify();
    return this.currentTheme;
  }

  public setTheme(theme: Theme) {
    this.currentTheme = theme;
    try {
      localStorage.setItem('quickpair_theme', this.currentTheme);
    } catch {}
    this.applyTheme();
    this.notify();
  }

  public subscribe(cb: (theme: Theme) => void): () => void {
    this.listeners.add(cb);
    cb(this.currentTheme);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public applyTheme() {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    if (this.currentTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.backgroundColor = '#121214';
      root.style.color = '#F3F3F5';
      if (body) {
        body.classList.add('dark');
        body.style.backgroundColor = '#121214';
        body.style.color = '#F3F3F5';
      }
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', '#121214');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.backgroundColor = '#F7F7F5';
      root.style.color = '#111111';
      if (body) {
        body.classList.remove('dark');
        body.style.backgroundColor = '#F7F7F5';
        body.style.color = '#111111';
      }
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', '#F7F7F5');
    }
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.currentTheme));
  }
}

export const themeManager = new ThemeEngine();
