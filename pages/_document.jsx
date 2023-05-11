import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="kr">
      <Head />
      <body className="scrollbar-hide">
        <Main />
        <NextScript />
        {process.env.NODE_ENV !== "development" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
              `,
            }}
          />
        )}
      </body>
    </Html>
  );
}
