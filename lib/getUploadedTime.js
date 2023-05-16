export default function getUploadedTime(time) {
  let uploadedTime = Date.parse(time);
  let currentTime = new Date().getTime();
  let gap = currentTime - uploadedTime;
  if (gap < 1000 * 60) {
    return `${Math.floor(gap / 1000)}초 전`;
  } else if (gap < 1000 * 60 * 10) {
    return `${Math.floor(gap / (1000 * 60))}분 전`;
  } else if (gap < 1000 * 60 * 60) {
    return `${Math.floor(gap / (1000 * 60 * 10))}0분 전`;
  } else if (gap < 1000 * 60 * 60 * 24) {
    return `${Math.floor(gap / (1000 * 60 * 60))}시간 전`;
  } else if (gap < 1000 * 60 * 60 * 24 * 7) {
    return `${Math.floor(gap / (1000 * 60 * 60 * 24))}일 전`;
  } else if (gap < 1000 * 60 * 60 * 24 * 30) {
    return `${Math.floor(gap / (1000 * 60 * 60 * 24 * 7))}주 전`;
  } else if (gap < 1000 * 60 * 60 * 24 * 365) {
    return `${Math.floor(gap / (1000 * 60 * 60 * 24 * 30))}달 전`;
  } else {
    return `${Math.floor(gap < 1000 * 60 * 60 * 24 * 365)}년 전`;
  }
}
