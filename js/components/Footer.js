export function Footer() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="footer-brand">
      <span class="footer-brand-icon"></span>
      <span>moments</span>
    </div>
    <span class="footer-tagline">the app for those we love</span>
    <span class="footer-copy">&copy; 2026 moments</span>
  `;
  return footer;
}
