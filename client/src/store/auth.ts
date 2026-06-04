import { create } from 'zustand';
import { UserDto } from '@smartlaw/shared';

interface AuthState {
  user: UserDto | null;
  token: string | null;
  setAuth: (user: UserDto, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  token: localStorage.getItem('smartlaw_token'),
  setAuth: (user, token) => {
    localStorage.setItem('smartlaw_token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('smartlaw_token');
    set({ user: null, token: null });
  },
}));
