"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./editProfile.module.css";

export default function EditProfilePage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        if (userData.name) {
            setName(userData.name);
            setEmail(userData.email || "");
        }
        setLoading(false);
    }, []);

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Name cannot be empty");
            return;
        }

        setSaving(true);
        setError("");

        const token = localStorage.getItem("authToken");
        if (!token) {
            setError("You are not logged in");
            setSaving(false);
            return;
        }

        try {
            const res = await fetch("/api/update-user", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Failed to update profile");
                setSaving(false);
                return;
            }

            // Update localStorage
            localStorage.setItem("user", JSON.stringify(data.user));

            router.push("/music"); // go back to music page
        } catch (err) {
            console.error(err);
            setError("Server error. Please try again.");
            setSaving(false);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Edit Profile</h1>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.formGroup}>
                <label>Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                    disabled={saving}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    disabled
                    className={styles.inputDisabled}
                />
            </div>

            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
            </button>

            <button className={styles.cancelBtn} onClick={() => router.push("/music")} disabled={saving}>
                Cancel
            </button>
        </div>
    );
}
