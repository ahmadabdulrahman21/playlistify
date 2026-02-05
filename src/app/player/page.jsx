"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./player.module.css";

export default function PlayerPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const songId = searchParams.get("songId");
    const title = searchParams.get("title");
    const artist = searchParams.get("artist");
    const image = searchParams.get("image");

    const [musicList, setMusicList] = useState([]);
    const [songData, setSongData] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [likedSongs, setLikedSongs] = useState([]);

    const audioRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const liked = JSON.parse(localStorage.getItem("likedSongs") || "[]");

        setIsLoggedIn(!!token && !!user.name);
        setLikedSongs(liked.map(s => s.id));
    }, []);

    const toggleLikeSong = (song) => {
        if (!isLoggedIn) return;
        let liked = JSON.parse(localStorage.getItem("likedSongs") || "[]");
        if (likedSongs.includes(song.id)) {
            liked = liked.filter(s => s.id !== song.id);
        } else {
            liked.push(song);
        }
        localStorage.setItem("likedSongs", JSON.stringify(liked));
        setLikedSongs(liked.map(s => s.id));
    };

    useEffect(() => {
        const fetchMusicList = async () => {
            try {
                const res = await fetch("/api/music");
                const data = await res.json();
                setMusicList(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMusicList();
    }, []);

    useEffect(() => {
        if (!songId) return;
        const fetchSong = async () => {
            try {
                const res = await fetch(`/api/music/${songId}`);
                const data = await res.json();
                setSongData(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSong();
    }, [songId]);

    useEffect(() => {
        if (songData && audioRef.current) {
            const audio = audioRef.current;
            audio.src = songData.preview;
            audio.volume = volume;
            audio.muted = false;
            audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    }, [songData]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (!audio.duration || isNaN(audio.duration)) return;
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration);
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("loadedmetadata", updateProgress);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("loadedmetadata", updateProgress);
        };
    }, [songData]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => {
        if (!audioRef.current) return;
        const newTime = (e.target.value / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setProgress(e.target.value);
    };

    const handleVolumeChange = (e) => {
        const value = e.target.value / 100;
        setVolume(value);
        if (audioRef.current) {
            audioRef.current.volume = value;
            audioRef.current.muted = value === 0;
            setIsMuted(value === 0);
        }
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const changeSong = (direction) => {
        if (!musicList.length || !songData) return;
        const index = musicList.findIndex((s) => s.id.toString() === songData.id.toString());
        const newIndex =
            direction === "prev"
                ? (index - 1 + musicList.length) % musicList.length
                : (index + 1) % musicList.length;
        const newSong = musicList[newIndex];
        const query = new URLSearchParams({
            songId: newSong.id,
            title: newSong.title,
            artist: newSong.artist,
            image: newSong.image,
        }).toString();
        router.push(`/player?${query}`);
    };

    const handleSongEnd = () => changeSong("next");

    const playSelectedSong = (song) => {
        const query = new URLSearchParams({
            songId: song.id,
            title: song.title,
            artist: song.artist,
            image: song.image,
        }).toString();
        router.push(`/player?${query}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.musicList}>
                <h3>All Songs</h3>
                {musicList.map((song) => (
                    <div
                        key={song.id}
                        className={`${styles.musicListItem} ${song.id === songData?.id ? styles.activeSong : ""}`}
                        onClick={() => playSelectedSong(song)}
                    >
                        <Image src={song.image} alt={song.title} width={50} height={50} />
                        <div className={styles.songInfo}>
                            <span>{song.title}</span>
                            <span>{song.artist}</span>
                        </div>
                        {isLoggedIn && (
                            <button
                                className={`${styles.likeBtn} ${likedSongs.includes(song.id) ? styles.liked : ""}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLikeSong(song);
                                }}
                            >
                                {likedSongs.includes(song.id) ? "❤️" : "🤍"}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className={styles.playerCard}>
                <button className={styles.backBtn} onClick={() => router.push("/music")}>
                    ← Back
                </button>

                <Image
                    src={image || "/placeholder.png"}
                    alt={title || "Unknown Song"}
                    width={300}
                    height={300}
                    className={styles.albumArt}
                />

                <div className={styles.trackInfo}>
                    <h2 className={styles.songTitle}>{title || "Loading..."}</h2>
                    <p className={styles.artist}>{artist || "Unknown Artist"}</p>

                    {isLoggedIn && songData && (
                        <button
                            className={`${styles.likeBtn} ${likedSongs.includes(songData.id) ? styles.liked : ""}`}
                            onClick={() => toggleLikeSong(songData)}
                        >
                            {likedSongs.includes(songData.id) ? "❤️ Liked" : "🤍 Like"}
                        </button>
                    )}
                </div>

                <audio ref={audioRef} onEnded={handleSongEnd} />

                <div className={styles.progressContainer}>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={progress}
                        className={styles.progressBar}
                        onChange={handleSeek}
                    />
                    <div className={styles.timeRow}>
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className={styles.controls}>
                    <button onClick={() => changeSong("prev")} className={styles.controlBtn}>⏮</button>
                    <button onClick={togglePlay} className={styles.playBtn}>{isPlaying ? "⏸" : "▶"}</button>
                    <button onClick={() => changeSong("next")} className={styles.controlBtn}>⏭</button>
                </div>

                <div className={styles.volumeWrapper}>
                    <button onClick={toggleMute} className={styles.volumeBtn}>
                        {isMuted || volume === 0 ? "🔇" : "🔊"}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={isMuted ? 0 : volume * 100}
                        onChange={handleVolumeChange}
                        className={styles.volumeSlider}
                    />
                </div>
            </div>
        </div>
    );
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
