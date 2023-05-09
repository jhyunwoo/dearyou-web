import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="kr">
      <Head>
        <title>드려유</title>
        <meta property="og:title" content="드려유" key="title" />
      </Head>
      <body className="scrollbar-hide">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
