import React, {createContext, useState, useEffect, ReactNode} from 'react';

export interface User {
    userId: number;
    username: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
}

interface UserProviderProps {
    children: ReactNode;
}

export const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => {},
});

// @ts-ignore
export const UserProvider: FC<UserProviderProps> = ({ children }) => {
    const [user, setUserState] = useState<User | null>(null);

    // 尝试从 localStorage 中加载用户信息
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserState(JSON.parse(storedUser));
        }
    }, []);

    const setUser = (user: User | null) => {
        setUserState(user);
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
