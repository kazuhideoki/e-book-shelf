import { Button } from "@material-ui/core";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { AuthResponse, driveAuthState } from "../recoil/atom/drive-auth";
import styles from "../styles/Home.module.css";
import { DriveFiles } from "../type/google-drive-api.type";
import { axiosRequest } from "../utils/axios";
import { base64ToArrayBuffer } from "../utils/base64ToArrayBuffer";
import { getAuthUrl } from "../utils/get-auth-url";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const fileId = "1etL4N_wtxozkzGoKcMlmY_md0jGrDwmK";

interface P {
  code?: string;
  // authResponse?: AuthResponse;
}

const Home: NextPage<P> = ({ code }) => {
  const [driveFiles, setDriveFiles] = useState<DriveFiles | null>(null);
  const [file, setFile] = useState<any>(null);
  const authResponse = useRecoilValue(driveAuthState);
  const setDriveAuth = useSetRecoilState(driveAuthState);

  const handleFetchFileList = useCallback(async () => {
    console.log({ frontAccessToken: authResponse?.access_token });

    const res = await axiosRequest<DriveFiles>("GET", `api/drive/files`, {
      params: {
        ...authResponse,
      },
    });

    console.log({ res });

    setDriveFiles(res);
  }, [authResponse]);

  const handleFetchFile = useCallback(
    async (fileId: string) => {
      const res = await axiosRequest<string>(
        "GET",
        `api/drive/files/${fileId}/media`,
        {
          params: {
            ...authResponse,
            fileId,
          },
        }
      );

      setFile(base64ToArrayBuffer(res));
    },
    [authResponse]
  );

  useEffect(() => {
    if (code) {
      axiosRequest<AuthResponse>("GET", `api/drive/token`, {
        params: {
          code,
        },
      }).then((authResponse) => setDriveAuth(authResponse));
    }
  }, [code]);

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

        <Button variant="contained" onClick={handleFetchFileList}>
          ファイル一覧取得
        </Button>

        {driveFiles?.files.map((file, i) => {
          return (
            <Button
              variant="outlined"
              key={i}
              onClick={() => handleFetchFile(file.id)}
            >
              {file.name}
            </Button>
          );
        })}

        <Button
          onClick={async () => {
            if (window == null) return;

            try {
              let res = await axiosRequest<string>(
                "GET",
                `api/drive/files/${fileId}/media`,
                {
                  params: {
                    ...authResponse,
                  },
                }
              );

              setFile(base64ToArrayBuffer(res));
            } catch (error) {
              console.log({ error });
            }
          }}
        >
          Get ScanSnap file test
        </Button>
        {
          <Document file={file}>
            {<Page key={`page_${1}`} pageNumber={1} />}
          </Document>
        }
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = context.query?.code as string;

  if (!code) {
    const url = getAuthUrl();
    context.res.setHeader("location", url);
    context.res.statusCode = 302;
    context.res.end();
    return { props: {} };
  }

  return { props: { code } };
};

export default Home;
