import { jwtDecode } from 'jwt-decode';

export const getValidToken = () => {
    const token = localStorage.getItem("token")?.trim();
    if (!token || typeof token !== 'string') {
        return null;
    }

    try {
        const decoded = jwtDecode(token);
        if (!decoded?.userId) {
            return null;
        }
        return token;
    } catch {
        return null;
    }
};

export const getUserIdFromToken = () => {
    const token = getValidToken();
    if (!token) return null;

    try {
        return jwtDecode(token).userId;
    } catch {
        return null;
    }
};