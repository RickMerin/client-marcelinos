export const data = [
  { id: 1, label: "Slide 1", name: "Kaye", amount: 200 },
  { id: 2, label: "Slide 2", name: "John", amount: 150 },
  { id: 3, label: "Slide 3", name: "Jane", amount: 100 },
];

export function handleClick(data) {
  alert(
    `Hello ${data.name}, here's your ID${data.id} and amount $${data.amount}`
  );
}
