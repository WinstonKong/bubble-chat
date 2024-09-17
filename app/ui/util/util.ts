const OneDay = 24 * 60 * 60 * 1000;

export function getDateOrTime(date: Date | number) {
  if (typeof date === 'number') {
    date = new Date(date);
  }
  const dateString = date.toDateString();
  const now = new Date();
  const yesterday = new Date(now.getTime() - OneDay);

  if (dateString === now.toDateString()) {
    return date.toLocaleTimeString([], {
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
    });
  } else if (dateString === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  }
}

export function getDateAndTime(date: Date | number, timeFirst?: boolean) {
  if (typeof date === 'number') {
    date = new Date(date);
  }
  const dateString = date.toDateString();
  const now = new Date();
  const yesterday = new Date(now.getTime() - OneDay);

  const time = date.toLocaleTimeString([], {
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
  });
  if (dateString === now.toDateString()) {
    return time;
  } else if (dateString === yesterday.toDateString()) {
    return timeFirst ? time + ' Yesterday' : 'Yesterday ' + time;
  } else {
    const dateStr = date.toLocaleDateString([], {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
    return timeFirst ? time + ' ' + dateStr : dateStr + ' ' + time;
  }
}

export function noFunc() {}