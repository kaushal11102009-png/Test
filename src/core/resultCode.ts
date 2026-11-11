export const generateResultCode = (score, total, studentName = 'student') => {
  const base = `${studentName.trim() || 'student'}:${score}:${total}`;
  return btoa(base).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
