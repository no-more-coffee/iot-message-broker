
export function probe(): string {
  const measure = Math.floor(Math.random() * 100);
  const message = {"some-measure": measure};
  return JSON.stringify(message)
}
