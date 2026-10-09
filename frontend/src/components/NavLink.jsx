// A normal <a> that uses the app's navigate() so pages change without a reload.
// Ctrl/Cmd-click and middle-click still open a new tab as usual.
export default function NavLink({ href, onNavigate, children, ...props }) {
  const handleClick = (event) => {
    if (
      !onNavigate ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    onNavigate(href);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}