import { Button } from "@material-ui/core";
import { google } from "googleapis";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { ServerDriveService } from "../server/google-drive.service";
import styles from "../styles/Home.module.css";
import { AuthResponse, DriveResponse } from "../type/google-drive-api.type";
import { axiosRequest } from "../utils/axios";

interface P {
  code?: string;
  authResponse?: AuthResponse;
}

const Home: NextPage<P> = ({ code, authResponse }) => {
  const router = useRouter();
  const [data, setData] = useState<DriveResponse | null>();

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{" "}
          <code className={styles.code}>pages/index.tsx</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>

        <Button
          onClick={async () => {
            if (window == null) return;

            console.log({ authResponse });

            try {
              const res = await axiosRequest<DriveResponse>(
                "GET",
                `api/files`,
                {
                  params: {
                    authResponse,
                    access_token: authResponse?.access_token,
                  },
                }
              );

              console.log({ data: res });

              setData(res);
            } catch (error) {
              console.log({ error });
            }
          }}
        >
          Get ScanSnap file list
        </Button>
        {data?.files?.map((e: any, i: number) => (
          <p key={i}>{e.name}</p>
        ))}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by <span className={styles.logo}>E Book Shelf</span>
        </a>
      </footer>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = context.query?.code as string;
  if (!code) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_CLIENT_ID,
      process.env.GOOGLE_DRIVE_API_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_WEB_SERVICE_URL
    );

    const scopes = ["https://www.googleapis.com/auth/drive"];

    const url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: "offline",
      scope: scopes,
    });

    // const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_WEB_SERVICE_URL}&scope=https://www.googleapis.com/auth/drive&response_type=code&approval_prompt=force`;

    context.res.setHeader("location", url);
    context.res.statusCode = 302;
    context.res.end();
  }

  if (code) {
    let res: AuthResponse;
    try {
      res = await ServerDriveService.getAccessToken(code);

      console.log({ res });
      return { props: { code, authResponse: res } };
    } catch (error) {
      console.log({ error: (error as any).message });
      console.log({ error });
      return { props: {} };
    }
  }
  return { props: {} };
};

export default Home;
