"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./changePassword.module.css";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Toggle visibility
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) router.push("/login");
    }, [router]);

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*[\d\W]).{8,}$/;

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            setError(
                "New password must be at least 8 characters long and include at least 1 letter and 1 number or special character"
            );
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        const token = localStorage.getItem("authToken");
        if (!token) {
            setError("You are not logged in");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/change-password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to change password");
                setLoading(false);
                return;
            }

            setSuccess(data.message);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Server error. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Change Password</h1>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            {/* Current Password */}
            <div className={styles.formGroup}>
                <label>Current Password</label>
                <div className={styles.passwordWrapper}>
                    <input
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={styles.input}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowCurrent(!showCurrent)}
                    >
                        {showCurrent ? "🙈" : "👁️"}
                    </button>
                </div>
            </div>

            {/* New Password */}
            <div className={styles.formGroup}>
                <label>New Password</label>
                <div className={styles.passwordWrapper}>
                    <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={styles.input}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowNew(!showNew)}
                    >
                        {showNew ? "🙈" : "👁️"}
                    </button>
                </div>
            </div>

            {/* Confirm Password */}
            <div className={styles.formGroup}>
                <label>Confirm New Password</label>
                <div className={styles.passwordWrapper}>
                    <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.input}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowConfirm(!showConfirm)}
                    >
                        {showConfirm ? "🙈" : "👁️"}
                    </button>
                </div>
            </div>

            <button
                className={styles.saveBtn}
                onClick={handleChangePassword}
                disabled={loading}
            >
                {loading ? "Changing..." : "Change Password"}
            </button>

            <button
                className={styles.cancelBtn}
                onClick={() => router.push("/music")}
                disabled={loading}
            >
                Cancel
            </button>
        </div>
    );
}
