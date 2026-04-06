import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import "./globals.css";
import Footer from "./components/footer/footer";

export default function Home() {
  const images = [
    {
      imageUrl: "/images/playlist.png",
      alt: "playlist",
      title: "Create Playlists",
      description: "Build and personalize playlists with a few clicks.",
    },
    {
      imageUrl: "/images/music.png",
      alt: "Music",
      title: "Vast Music Library",
      description: "Explore a wide collection of songs from external sources.",
    },
    {
      imageUrl: "/images/player.png",
      alt: "Player",
      title: "Smooth Player",
      description: "Enjoy animations, responsive design, and user-friendly controls.",
    }
  ];

  return (
    <div className={styles.homePage}>
      <header>
        <nav className={styles.navbar}>
          <Link href="/" className={styles.logoLink}>
            <h1 className={styles.logo}>Playlistify</h1>
          </Link>

          <ul className={styles.navLinks}>
            <li>
              <Link href="/login">Get Started</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <section className={styles.featuresHero}>
          <div>
            <h1>
              Welcome to <span>Playlistify</span>
            </h1>
            <p>
              Create your own playlists, explore music from external sources,
              and enjoy a smooth listening experience.
            </p>
            <Link href="/music">
              <button className={styles.btnStart}>Start Listening</button>
            </Link>
          </div>
          <div className={styles.featuresHeroImage}>
            <Image
              src="/images/music-hero.png"
              alt="Music Illustration"
              width={500}
              height={200}
              priority
            />
          </div>
        </section>

        <section id="features" className={styles.features}>
          <h2>Why Playlistify?</h2>
          <div className={styles.featuresGrid}>
            {images.map((image) => (
              <div key={image.alt} className={styles.featureCard}>
                <Image
                  src={image.imageUrl}
                  alt={image.alt}
                  width={100}
                  height={100}
                  loading="lazy"
                />
                <h3>{image.title}</h3>
                <p>{image.description}</p>
              </div>
            ))}
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
