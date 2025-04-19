import React, {createContext, useState, useEffect, ReactNode} from 'react';
// 用户信息
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
export const UserProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUserState(JSON.parse(stored));
        setReady(true);
    }, []);

    const setUser = (u: User | null) => {
        setUserState(u);
        u ? localStorage.setItem('user', JSON.stringify(u))
            : localStorage.removeItem('user');
    };

    if (!ready) return null;

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

