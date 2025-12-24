export default function Footer() {
  return (
    <footer className="w-full border-t border-t-muted/30 mt-10 text-center">
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Reliance Web Solutions. All rights reserved.
      </p>
    </footer>
  )
}
