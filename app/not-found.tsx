export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="text-muted-foreground text-center max-w-md">
        The page you are looking for does not exist.
      </p>
      <a
        href="/"
        className="mt-2 px-4 py-2 bg-secondary text-background rounded-lg 
                   hover:bg-accent transition font-medium"
      >
        Go Home
      </a>
    </div>
  );
}
