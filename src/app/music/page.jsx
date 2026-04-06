"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./music.module.css";

export default function MusicPage() {
    const router = useRouter();
    const carouselRef = useRef(null);

    const [musicList, setMusicList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("");
    const [likedSongs, setLikedSongs] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showCarouselArrows, setShowCarouselArrows] = useState(false);
    const [loading, setLoading] = useState(true);

    /* ---------------- MOUNT CHECK ---------------- */
    useEffect(() => setMounted(true), []);

    /* ---------------- CLOSE MENU ON OUTSIDE CLICK ---------------- */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                menuOpen &&
                !e.target.closest(`.${styles.hamburger}`) &&
                !e.target.closest(`.${styles.dropdownMenu}`)
            ) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    /* ---------------- AUTH + LIKED SONGS ---------------- */
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const liked = JSON.parse(localStorage.getItem("likedSongs") || "[]");

        setLikedSongs(liked.map((s) => s.id));

        if (token && user.name) {
            setIsLoggedIn(true);
            setUserName(user.name);
        }
    }, []);

    /* ---------------- LOGOUT ---------------- */
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setUserName("");
        setMenuOpen(false);
    };

    /* ---------------- FETCH MUSIC ---------------- */
    useEffect(() => {
        const fetchMusic = async () => {
            setLoading(true); // start loading
            const cached = localStorage.getItem("musicList");
            if (cached) {
                setMusicList(JSON.parse(cached));
                setLoading(false); // stop loading
                return;
            }

            const res = await fetch("/api/music");
            const data = await res.json();
            setMusicList(data);
            localStorage.setItem("musicList", JSON.stringify(data));
            setLoading(false); // stop loading
        };
        fetchMusic();
    }, []);

    /* ---------------- SEARCH FILTER ---------------- */
    const filteredMusic = musicList.filter(
        (song) =>
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const likedMusic = filteredMusic.filter((song) =>
        likedSongs.includes(song.id)
    );

    const showLikedSection = isLoggedIn && likedMusic.length > 0;

    // Now we include liked songs in the main grid as well
    const displayedMusic = filteredMusic;

    /* ---------------- CHECK CAROUSEL OVERFLOW ---------------- */
    useEffect(() => {
        const checkOverflow = () => {
            if (!carouselRef.current) return;
            const el = carouselRef.current;
            setShowCarouselArrows(el.scrollWidth > el.clientWidth);
        };

        checkOverflow();
        window.addEventListener("resize", checkOverflow);
        return () => window.removeEventListener("resize", checkOverflow);
    }, [likedMusic]);

    /* ---------------- LIKE TOGGLE ---------------- */
    const toggleLikeSong = (song) => {
        if (!isLoggedIn) return;

        let liked = JSON.parse(localStorage.getItem("likedSongs") || "[]");

        if (likedSongs.includes(song.id)) {
            liked = liked.filter((s) => s.id !== song.id);
        } else {
            liked.push(song);
        }

        localStorage.setItem("likedSongs", JSON.stringify(liked));
        setLikedSongs(liked.map((s) => s.id));
    };

    /* ---------------- PLAYER NAV ---------------- */
    const goToPlayer = (song) => {
        const query = new URLSearchParams({
            songId: song.id,
            title: song.title,
            artist: song.artist,
            image: song.image,
        }).toString();

        router.push(`/player?${query}`);
    };

    /* ---------------- CAROUSEL SCROLL ---------------- */
    const scrollCarousel = (dir) => {
        if (!carouselRef.current) return;
        const cardWidth = carouselRef.current.firstChild.offsetWidth + 16; // 16 = gap
        carouselRef.current.scrollBy({
            left: dir === "left" ? -cardWidth * 2 : cardWidth * 2,
            behavior: "smooth",
        });
    };

    return (
        <div className={styles.musicPage}>
            {/* ================= NAVBAR ================= */}
            <header className={styles.navbar}>
                <Link href={isLoggedIn ? "/music" : "/"} className={styles.logoLink}>
                    <h1 className={styles.logo}>Playlistify</h1>
                </Link>

                {mounted && isLoggedIn && (
                    <div className={styles.welcomeCenter}>Welcome, {userName}!</div>
                )}

                {mounted &&
                    (isLoggedIn ? (
                        <div className={styles.hamburgerContainer}>
                            <div
                                className={styles.hamburger}
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                ☰
                            </div>

                            <div
                                className={`${styles.dropdownMenu} ${menuOpen ? styles.open : ""}`}
                            >
                                <button
                                    className={styles.dropdownItem}
                                    onClick={() => router.push("/edit-profile")}
                                >
                                    Edit Profile
                                </button>

                                <button
                                    className={styles.dropdownItem}
                                    onClick={() => router.push("/change-password")}
                                >
                                    Change Password
                                </button>

                                <button
                                    className={styles.dropdownItem}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>

                                <button
                                    className={styles.dropdownItem}
                                    onClick={() => router.push("/delete-user")}
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login" className={styles.navLink}>
                            Login / Signup
                        </Link>
                    ))}
            </header>

            {/* ================= TITLE ================= */}
            <h1 className={styles.title}>Music List</h1>

            {/* ================= SEARCH ================= */}
            <input
                type="text"
                placeholder="Search songs or artists..."
                className={styles.searchBar}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* ================= LIKED SONGS CAROUSEL ================= */}
            {showLikedSection && (
                <div className={styles.likedSection}>
                    <h2 className={styles.likedHeader}>Liked Songs ❤️</h2>

                    <div className={styles.carouselWrapper}>
                        {showCarouselArrows && (
                            <button
                                className={styles.arrowBtn}
                                onClick={() => scrollCarousel("left")}
                            >
                                ◀
                            </button>
                        )}

                        <div className={styles.carousel} ref={carouselRef}>
                            {likedMusic.map((song) => (
                                <div key={song.id} className={styles.carouselCard}>
                                    <div
                                        className={styles.musicLink}
                                        onClick={() => goToPlayer(song)}
                                    >
                                        <Image
                                            src={song.image}
                                            alt={song.title}
                                            width={150}
                                            height={150}
                                        />
                                        <h4>{song.title}</h4>
                                        <p>{song.artist}</p>
                                    </div>

                                    <button
                                        className={`${styles.likeBtn} ${styles.liked}`}
                                        onClick={() => toggleLikeSong(song)}
                                    >
                                        ♥
                                    </button>
                                </div>
                            ))}
                        </div>

                        {showCarouselArrows && (
                            <button
                                className={styles.arrowBtn}
                                onClick={() => scrollCarousel("right")}
                            >
                                ▶
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ================= MUSIC GRID ================= */}
            <div className={styles.musicGrid}>
                {displayedMusic.map((song) => (
                    <div key={song.id} className={styles.musicCard}>
                        <div className={styles.musicLink} onClick={() => goToPlayer(song)}>
                            <Image
                                src={song.image}
                                alt={song.title}
                                width={200}
                                height={200}
                            />
                            <h2>{song.title}</h2>
                            <p>{song.artist}</p>
                        </div>

                        {isLoggedIn && (
                            <button
                                className={`${styles.likeBtn} ${likedSongs.includes(song.id) ? styles.liked : ""
                                    }`}
                                onClick={() => toggleLikeSong(song)}
                            >
                                {likedSongs.includes(song.id) ? "♥" : "♡"}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {loading ? (
                <p className={styles.songsNotFound}>Loading songs...</p>
            ) : displayedMusic.length === 0 ? (
                <p className={styles.songsNotFound}>No songs found.</p>
            ) : null}
        </div>
    );
}
