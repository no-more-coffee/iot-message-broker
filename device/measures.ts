export function probe(): object {
  const measure = Math.floor(Math.random() * 100);
  return {"some-measure": measure};
}
