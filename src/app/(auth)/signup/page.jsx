"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./signup.module.css";

export default function SignUpPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        // Strong password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            setMessage(
                "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (!@#$%^&*)."
            );
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        // Capitalize name
        const capitalizedName = name
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: capitalizedName, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || "Something went wrong!");
                return;
            }

            // Save token and user info
            if (data.token) {
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("user", JSON.stringify({ name: capitalizedName, email }));
            }

            // Redirect to music page
            router.push("/music");

        } catch (error) {
            setMessage("Failed to sign up. Please try again later.");
        }
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <div className={styles.signupPage}>
            <div className={styles.signupContainer}>
                <div className={styles.signupCard}>
                    <Link className={styles.back} href="/">{`← Back Home`}</Link>
                    <h2>Create Account</h2>
                    <p>Sign up for a new Playlistify account</p>

                    <form onSubmit={handleSubmit}>
                        {/* Name */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => {
                                    // Remove numbers and capitalize
                                    const filtered = e.target.value.replace(/[0-9]/g, "");
                                    const capitalized = filtered
                                        .split(" ")
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(" ");
                                    setName(capitalized);
                                }}
                                required
                            />
                        </div>

                        {/* Email */}
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

                        {/* Password */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <span
                                    className={styles.eyeIcon}
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </span>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <span
                                    className={styles.eyeIcon}
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {showConfirmPassword ? "🙈" : "👁️"}
                                </span>
                            </div>
                        </div>

                        <button type="submit" className={styles.btnSignup}>Sign Up</button>
                    </form>

                    {message && <p className={styles.message}>{message}</p>}

                    <p className={styles.loginLink}>
                        Already have an account? <Link href="/login">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
