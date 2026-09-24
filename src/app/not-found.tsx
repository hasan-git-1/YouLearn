import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center px-4 text-center"
      style={{ minHeight: '80dvh' }}
    >
      <div
        className="font-black mb-4 gradient-text"
        style={{ fontSize: 'clamp(5rem, 15vw, 10rem)', fontFamily: 'var(--font-display)', lineHeight: 1 }}
      >
        404
      </div>
      <h1 className="font-bold text-2xl mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
        Page not found
      </h1>
      <p className="mb-8" style={{ color: 'var(--text-secondary)', maxWidth: 360 }}>
        The page you&apos;re looking for doesn&apos;t exist or the content hasn&apos;t been indexed yet.
      </p>
      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
