import { jwtDecode } from 'jwt-decode';

export const getValidToken = () => {
    const raw = localStorage.getItem("token");
    if (!raw || typeof raw !== "string") return null;

    const token = raw.trim();
    try {
        const decoded = jwtDecode(token);

        // Optional: Check token expiration
        if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
            console.warn("JWT expired");
            return null;
        }

        // Basic sanity check (you can add more if needed)
        if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
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
        const decoded = jwtDecode(token);
        return decoded?.userId || null;
    } catch {
        return null;
    }
};
