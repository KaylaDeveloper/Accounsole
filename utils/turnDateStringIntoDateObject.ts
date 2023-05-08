export default function turnDateStringIntoDateObject(date: string) {
  const [day, month, year] = date.split("/");
  return new Date(`${year}-${month}-${day}`);
}

export function turnDateStringIntoISOStandard(date: string) {
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
}
