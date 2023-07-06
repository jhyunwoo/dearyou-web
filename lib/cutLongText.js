export default function cutLongText(text) {
  let cutedText = text
  console.log(cutedText.length)
  if (cutedText.length > 10) {
    cutedText = cutedText.substring(0, 10) + "..."
  }
  return cutedText
}
