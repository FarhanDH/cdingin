export const formattedDate = (date: Date, time = false) => {
  const formatDate = new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formatTime = `${new Date(date).getHours()}:${new Date(
    date,
  ).getMinutes()}`;

  return `${formatDate} ${time ? formatTime : ''}`;
};
