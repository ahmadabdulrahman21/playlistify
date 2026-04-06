"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./deleteUser.module.css";

export default function DeleteUserPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            router.push("/login");
        }
    }, [router]);

    const handleDelete = async () => {
        if (!password) {
            setError("Please enter your password to confirm.");
            return;
        }

        setLoading(true);
        setError("");

        const token = localStorage.getItem("authToken");
        if (!token) {
            setError("You are not logged in.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/delete-user", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ password }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "Failed to delete account.");
                setLoading(false);
                return;
            }

            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            localStorage.removeItem("likedSongs");

            router.push("/");
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again later.");
            setLoading(false);
        }
    };

    return (
        <div className={styles.deletePage}>
            <div className={styles.card}>
                <h2>Delete Your Account</h2>
                <p>Enter your password to permanently delete your account. This action cannot be undone.</p>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.passwordWrapper}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className={styles.eyeToggle}
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={loading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        <span className={showPassword ? styles.eyeClosed : styles.eyeOpen} />
                    </button>
                </div>

                <div className={styles.buttons}>
                    <button
                        className={styles.cancelBtn}
                        onClick={() => router.push("/music")}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.deleteBtn}
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete Account"}
                    </button>
                </div>
            </div>
        </div>
    );
}
