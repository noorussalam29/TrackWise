import create from 'zustand'

const useAuth = create((set, get) => ({
  user: null,
  accessToken: null,
  
  setAuth: (user, accessToken) => {
    set({ user, accessToken })
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('accessToken', accessToken)
  },
  
  logout: () => {
    set({ user: null, accessToken: null })
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
  
  // Load from localStorage on app start
  hydrate: () => {
    const user = localStorage.getItem('user')
    const accessToken = localStorage.getItem('accessToken')
    if (user && accessToken) {
      try {
        set({ user: JSON.parse(user), accessToken })
      } catch (err) {
        console.error('Error hydrating auth:', err)
      }
    }
  }
}))

export default useAuth

