export default function Footer() {
  return (
    <footer className="bg-gatherum-base border-t border-gatherum-surface-secondary py-16 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-display font-medium text-2xl uppercase tracking-widest text-gatherum-text-light">Gatherum</span>
          <p className="text-gatherum-text-muted text-sm mt-2 font-light">Sophisticated event discovery.</p>
        </div>
        
        <div className="flex gap-8 text-xs font-medium uppercase tracking-widest text-gatherum-text-muted">
          <a href="#" className="hover:text-gatherum-amber transition-colors">About</a>
          <a href="#" className="hover:text-gatherum-amber transition-colors">Privacy</a>
          <a href="#" className="hover:text-gatherum-amber transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
