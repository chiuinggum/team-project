export const generateTimestamp = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 月份是从0开始的
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export function getTimeDiff(timestamp) {
  timestamp = new Date(timestamp).getTime();
  const now = new Date();
  const timeDiff = now - timestamp;

  const minuteDiff = Math.floor(timeDiff / 1000 / 60);
  const hourDiff = Math.floor(minuteDiff / 60);
  const dayDiff = Math.floor(hourDiff / 24);
  const monthDiff = Math.floor(dayDiff / 30);
  const yearDiff = Math.floor(monthDiff / 12);

  // 設定時間顯示格式
  let time = "";
  if (yearDiff > 0) {
    time = `${yearDiff} years ago`;
  } else if (monthDiff > 0) {
    time = `${monthDiff} months ago`;
  } else if (dayDiff > 0) {
    time = `${dayDiff} days ago`;
  } else if (hourDiff > 0) {
    time = `${hourDiff} hours ago`;
  } else if (minuteDiff > 0) {
    time = `${minuteDiff} minutes ago`;
  } else {
    time = "just now";
  }
  return time;
}
