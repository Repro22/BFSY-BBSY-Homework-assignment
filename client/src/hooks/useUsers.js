import { useEffect, useState } from "react";
import { userService } from "../services/userService";

export function useUsers() {
    const [userMap, setUserMap] = useState({});

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const users = await userService.listUsers();
                if (cancelled) return;

                const map = {};
                for (const u of users) {
                    map[u.id] = u.name;
                }
                setUserMap(map);
            } catch (e) {
                console.error("Failed to load users:", e);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return userMap;
}
