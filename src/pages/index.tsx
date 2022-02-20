import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  MenuItem,
  Typography,
} from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useRecoilState, useRecoilValue } from "recoil";
import { displaySetsState } from "../recoil/atom/display-set";
import { driveAuthState } from "../recoil/atom/drive-auth";
import { userAuthState } from "../recoil/atom/user-auth";
import { FrontPath, ServerPath } from "../server/helper/const";
import styles from "../styles/Home.module.css";
import { DisplaySet } from "../type/model/firestore-display-set.type";
import { useRequest } from "../utils/axios";
import { base64ToArrayBuffer } from "../utils/base64ToArrayBuffer";
import { FrontAuth } from "../utils/front-firebase";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface P {}

const sampleIds = [
  "14y_If6OunynA-KMIYiTPGNldfZ3z8WEb",
  "1gURMeOUJ1rtQ8ZYteWu_UZcoYv_fbQJu",
  "1-xVrIdceiJWuBTkYmq6HWar86owU98St",
];

const Home: NextPage<P> = () => {
  const request = useRequest();
  const userAuth = useRecoilValue(userAuthState);
  const driveAuth = useRecoilValue(driveAuthState);

  const [displaySets, setDisplaySets] = useRecoilState(displaySetsState);
  console.log({ displaySets });
  const [selectedDisplaySet, setSelectedDisplaySet] = useState<string | null>(
    null
  );
  const [showDialog, setShowDialog] = useState(false);
  console.log({ selectedDisplaySet });

  const [pdfs, setPdfs] = useState<any[]>([]);
  const [targetPDF, setTargetPDF] = useState<any>(null);

  useEffect(() => {
    if (userAuth && driveAuth) {
      try {
        request<DisplaySet[]>("GET", ServerPath.displaySets).then((res) => {
          setDisplaySets(res);
          setShowDialog(true);
        });
      } catch (error) {
        console.log(`Error occurred: ${error}`);
      }
    }
  }, [userAuth, driveAuth]);

  // 表示する画像を一定間隔で入れ替える
  useEffect(() => {
    let count = 1;
    const timer = setInterval(() => {
      console.log({
        count,
      });
      console.log({
        fileLength: pdfs?.length,
      });

      const fileNumber = count % (pdfs?.length || 3);
      console.log({ fileNumber });
      console.log({ targetFile: pdfs[fileNumber] });
      setTargetPDF(pdfs[fileNumber]);

      count++;
    }, 6000);

    return () => clearInterval(timer);
  }, [pdfs]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Typography variant="h6">
          Welcome to{" "}
          <Link href={process.env.NEXT_PUBLIC_WEB_SERVICE_URL}>
            E Book Shelf!
          </Link>
        </Typography>

        <Box style={{ height: 400 }}>
          <Grid item container>
            <Grid item justifyContent="center" direction="column">
              <Document file={targetPDF}>
                {<Page key={`page_${1}`} pageNumber={1} height={400} />}
              </Document>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={1} justifyContent="end">
          <Grid item>
            <Button onClick={() => setShowDialog(true)}>
              ディスプレイセット選択
            </Button>
            <Button onClick={async () => FrontAuth.signOut()}>
              サインアウト
            </Button>
          </Grid>
        </Grid>
      </main>
      {displaySets.length && (
        <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
          <DialogTitle>ディスプレイセットの選択</DialogTitle>
          <DialogContent>
            {displaySets.map((displaySet, i) => {
              console.log({ dsplaySetinMap: displaySet });

              return (
                <>
                  <MenuItem
                    key={i}
                    value={displaySet.displaySetId}
                    onClick={async (e) => {
                      const res = await Promise.all([
                        ...displaySet.files.map((e) =>
                          request<string>("GET", ServerPath.fileMedia(e.fileId))
                        ),
                      ]);

                      setPdfs(res.map((e) => base64ToArrayBuffer(e)));

                      setShowDialog(false);
                    }}
                  >
                    {" "}
                    {displaySet.displaySetId}
                  </MenuItem>
                  <MenuItem>
                    <Link href={FrontPath.settings}>設定する</Link>
                  </MenuItem>
                </>
              );
            })}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)}>閉じる</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default Home;
