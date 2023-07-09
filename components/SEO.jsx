import Head from "next/head"

export default function SEO(props) {
  const { title } = props
  return (
    <Head>
      <title>드려유 | {title}</title>
      <meta
        name="description"
        content="충남삼성고등학교 교내 물품 나눔 플랫폼"
      />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="드려유" />
      <meta
        property="og:description"
        content="충남삼성고등학교 교내 물품 나눔 플랫폼"
      />
      <meta property="og:url" content="https://dearyou.moveto.kr" />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:image" content="https://dearyou.moveto.kr/og.png" />
    </Head>
  )
}
