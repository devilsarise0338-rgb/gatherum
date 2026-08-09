export default function Footer() {
  return (
    <footer className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 py-12 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-heading font-bold text-xl text-primary">Gatherum</span>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Connecting campus life, one event at a time.</p>
        </div>
        
        <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
          <a href="#" className="hover:text-primary transition-colors">About</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
