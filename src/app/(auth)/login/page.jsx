"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false); // new state
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || "Login failed");
                return;
            }

            if (data.token && data.user) {
                localStorage.setItem("authToken", data.token);
                localStorage.setItem(
                    "user",
                    JSON.stringify({ name: data.user.name, email: data.user.email })
                );
            }

            router.push("/music");
        } catch (err) {
            console.error(err);
            setMessage("Login failed. Please try again later.");
        }
    };

    const continueAsGuest = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        router.push("/music");
    };

    const togglePassword = () => setShowPassword(!showPassword);

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <Link className={styles.back} href="/">{`← Back Home`}</Link>
                    <h2>Welcome Back</h2>
                    <p>Login to your Playlistify account</p>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup} style={{ position: "relative" }}>
                            <label htmlFor="password">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                onClick={togglePassword}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "38px",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    fontSize: "18px",
                                }}
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </span>
                        </div>

                        <button type="submit" className={styles.btnLogin}>Login</button>
                    </form>

                    <button
                        onClick={continueAsGuest}
                        className={styles.btnGuest}
                    >
                        Continue as Guest
                    </button>

                    {message && <p className={styles.message}>{message}</p>}

                    <p className={styles.signupLink}>
                        Don't have an account? <Link href="/signup">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
