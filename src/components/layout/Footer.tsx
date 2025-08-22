export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} <span className="font-medium">Actionsys</span>. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Portal de Propostas Comerciais
          </p>
        </div>
      </div>
    </footer>
  );
}