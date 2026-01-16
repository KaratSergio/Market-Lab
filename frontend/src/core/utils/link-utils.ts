export const withLocale = (path: string, locale: string): string => {
  const cleanPath = path.replace(/^\/|\/$/g, '');

  if (cleanPath.startsWith('uk/') || cleanPath.startsWith('en/')) {
    return `/${cleanPath}`;
  }

  return `/${locale}/${cleanPath}`;
};

export const createNavItems = (
  locale: string,
  translations: Record<string, string>
) => {
  const items = [
    { key: 'products', path: 'products' },
    { key: 'map', path: 'map' },
    { key: 'sellers', path: 'sellers' },
    { key: 'about', path: 'about' },
  ];

  return items.map(item => ({
    key: item.key,
    href: withLocale(`/${item.path}`, locale),
    label: translations[item.key] || item.key
  }));
};

export const isPathActive = (
  currentPath: string,
  targetPath: string
): boolean => {
  if (currentPath === targetPath) return true;
  if (currentPath.startsWith(`${targetPath}/`)) return true;

  if (targetPath === '/uk' || targetPath === '/en') {
    return currentPath === targetPath || currentPath === `${targetPath}/`;
  }

  return false;
};