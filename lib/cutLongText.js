export default function cutLongText(text) {
  let cutedText = text
  if (cutedText.length > 10) {
    cutedText = cutedText.substring(0, 10) + "..."
  }
  return cutedText
}
