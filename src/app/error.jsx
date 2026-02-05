"use client";
import styles from "./error.module.css";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }) {

    useEffect(() => {
        console.error("Playlistify Error:", error);
    }, [error]);

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorCard}>
                <h1>Something went wrong 🎧</h1>
                <p>We hit a bad note while loading this page.</p>

                <div className={styles.buttons}>
                    <button onClick={() => reset()} className={styles.retryBtn}>
                        Try Again
                    </button>

                    <Link href="/" className={styles.homeBtn}>
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
