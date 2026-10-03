// Petites icônes rondes du menu en haut à droite.

const PATHS = {
  conseils: (
    <path d="M12 2a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2Zm-2.5 18h5a.5.5 0 0 1 .5.5 1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 20.5a.5.5 0 0 1 .5-.5Z" />
  ),
  lettres: (
    <path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V9h5.5L13 3.5ZM8 13h8v1.6H8V13Zm0 3.5h8v1.6H8v-1.6Z" />
  ),
  tarifs: (
    <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h6.38a1.5 1.5 0 0 1 1.06.44l8.62 8.62a1.5 1.5 0 0 1 0 2.12l-6.38 6.38a1.5 1.5 0 0 1-2.12 0L3.44 11.94A1.5 1.5 0 0 1 3 10.88V4.5Zm4.5 4.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" />
  ),
  compte: (
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.69-8 6v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-3.31-3.58-6-8-6Z" />
  ),
};

export type NavIconName = keyof typeof PATHS;

export default function NavIcon({ name }: { name: NavIconName }) {
  return (
    <span className="nav-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        {PATHS[name]}
      </svg>
    </span>
  );
}
