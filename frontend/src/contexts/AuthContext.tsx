import { createContext, useContext, ReactNode, useState } from 'react';
import { AuthContextType, User, UserRole } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('transitops_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string) => {
    // Mock login - in real app, call API
    const mockUsers: Record<string, { password: string; name: string; role: UserRole; department: string }> = {
      'admin@transitops.com': { password: 'admin123', name: 'Super Admin', role: 'admin', department: 'Administration' },
      'manager@transitops.com': { password: 'manager123', name: 'Alex Manager', role: 'fleet_manager', department: 'Operations' },
      'dispatcher@transitops.com': { password: 'disp123', name: 'John Dispatcher', role: 'dispatcher', department: 'Dispatch' },
      'safety@transitops.com': { password: 'safety123', name: 'Sarah Officer', role: 'safety_officer', department: 'Safety' },
      'analyst@transitops.com': { password: 'analyst123', name: 'Mike Analyst', role: 'financial_analyst', department: 'Finance' },
    };

    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password) {
      const newUser: User = {
        id: Math.random().toString(),
        email,
        name: mockUser.name,
        role: mockUser.role,
        department: mockUser.department,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      };
      setUser(newUser);
      localStorage.setItem('transitops_user', JSON.stringify(newUser));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('transitops_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
