/** 10자 이상의 긴 텍스트를 자르는 함수 */
export default function cutLongText(text) {
  let cutedText = text
  if (cutedText.length > 10) {
    cutedText = cutedText.substring(0, 10) + "..."
  }
  return cutedText
}
