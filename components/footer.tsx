export default function Footer() {
  return (
    <footer className="w-full border-t border-t-muted/30 p-10 text-center">
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} <a className="underline" href="https://relianceit.lk">Reliance Web Solutions</a>. All rights reserved.
      </p>
    </footer>
  )
}
