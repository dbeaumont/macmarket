export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MacMarket. Tous droits reserves.</p>
        <p className="mt-1">Projet de demonstration — les produits ne sont pas a vendre.</p>
      </div>
    </footer>
  );
}
