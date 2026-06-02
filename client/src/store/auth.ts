import { create } from 'zustand';
import { UserDto } from '@lexflow/shared';

interface AuthState {
  user: UserDto | null;
  token: string | null;
  setAuth: (user: UserDto, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  token: localStorage.getItem('lexflow_token'),
  setAuth: (user, token) => {
    localStorage.setItem('lexflow_token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('lexflow_token');
    set({ user: null, token: null });
  },
}));
