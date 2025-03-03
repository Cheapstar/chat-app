import moment from "moment"


export function timeAgo(date:Date | string) {
  const inputDate = moment(date);
  const now = moment();

  const diffInDays = now.diff(inputDate, 'days');
  const diffInWeeks = now.diff(inputDate, 'weeks');
  const diffInMonths = now.diff(inputDate, 'months');
  const diffInYears = now.diff(inputDate, 'years');

  if (diffInDays === 0) {
    return inputDate.format('HH:mm'); // Same day, return hour
  } else if (diffInDays === 1) {
    return 'Yesterday'; // Yesterday
  } else if (diffInDays <= 7) {
    return `${diffInDays} days ago`; // Less than a week, X days ago
  } else if (diffInWeeks <= 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`; // Less than a month, X weeks ago
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`; // Less than a year, X months ago
  } else {
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`; // More than a year, X years ago
  }
}


export function ModifiedTimeAgo(date:Date | string){
  const inputDate = moment(date);
  const now = moment();

  if (inputDate.isSame(now, 'day')) {
    return inputDate.format('HH:mm'); // If today, show time (e.g., 14:30)
  } else if (inputDate.isSame(now.subtract(1, 'day'), 'day')) {
    return 'Yesterday'; // If yesterday, show "Yesterday"
  } else if (inputDate.isAfter(now.subtract(6, 'days'), 'day')) {
    return inputDate.format('dddd'); // If within the last week, show day name (e.g., Monday)
  } else if (inputDate.isSame(now, 'year')) {
    return inputDate.format('D MMM'); // If within the same year, show day and month (e.g., 12 Jan)
  } else {
    return inputDate.format('D MMM YYYY'); // If in a different year, show full date (e.g., 12 Jan 2023)
  }

}
