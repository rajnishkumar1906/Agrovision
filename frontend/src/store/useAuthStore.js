// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// const useAuthStore = create(
//   persist(
//     (set) => ({
//       user: null,
//       token: null,
//       isAuthenticated: false,
      
//       setAuth: (user, token) => set({ 
//         user, 
//         token, 
//         isAuthenticated: !!token 
//       }),
      
//       logout: () => {
//         localStorage.removeItem('auth-storage');
//         set({ user: null, token: null, isAuthenticated: false });
//       },
//     }),
//     {
//       name: 'auth-storage',
//     }
//   )
// );

// export default useAuthStore;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true
        });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);

export default useAuthStore;