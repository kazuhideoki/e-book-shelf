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
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useGoogleLogout } from "react-google-login";
import { pdfjs } from "react-pdf";
import { useRecoilState } from "recoil";
import { authState } from "../recoil/atom/auth";
import { displaySetsState } from "../recoil/atom/display-set";
import { FrontPath, ServerPath } from "../server/helper/const";
import styles from "../styles/Home.module.css";
import { DisplaySet } from "../type/model/firestore-display-set.type";
import { ImageSet } from "../type/model/firestore-image-set.type";
import { useRequest } from "../utils/axios";
import { useWithLoading } from "../utils/with-loading";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface P {}

const Home: NextPage<P> = () => {
  const router = useRouter();
  const request = useRequest();
  const withLoading = useWithLoading();

  const { signOut } = useGoogleLogout({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_CLIENT_ID!,
  });
  const [auth, setAuth] = useRecoilState(authState);

  const [displaySets, setDisplaySets] = useRecoilState(displaySetsState);
  const [showDialog, setShowDialog] = useState(false);

  const [imgs, setImgs] = useState<ImageSet[]>([]);
  const [targetImg, setTargetImg] = useState<ImageSet | null>(null);

  useEffect(() => {
    if (auth.initialized) {
      request<DisplaySet[]>("GET", ServerPath.displaySets)
        .then((res) => {
          setDisplaySets(res);
          setShowDialog(true);
        })
        .catch((error) => {
          console.log({ error });
          console.log(`Error occurred: ${error}`);
        });
    }
  }, []);

  // 表示する画像を一定間隔で入れ替える
  useEffect(() => {
    let count = 1;
    const timer = setInterval(() => {
      if (imgs.length) {
        const fileNumber = count % imgs.length;

        setTargetImg(imgs[fileNumber]);

        count++;
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [imgs]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Typography variant="h6">
          <Link href={process.env.NEXT_PUBLIC_WEB_SERVICE_URL}>
            E Book Shelf
          </Link>
        </Typography>

        <Box>
          <Grid item container justifyContent="center" direction="column">
            <Grid item>
              <img
                src={targetImg?.path}
                style={{ maxWidth: 400, maxHeight: 400 }}
              />
            </Grid>
            <Grid item>
              <Typography>{targetImg?.meta.title}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={1} justifyContent="end">
          <Grid item>
            <Button onClick={() => setShowDialog(true)}>
              ディスプレイセット選択
            </Button>
            <Button
              onClick={() => {
                signOut();
                setAuth({ auth: undefined, initialized: false });
              }}
            >
              サインアウト
            </Button>
          </Grid>
        </Grid>
      </main>
      {
        <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
          <DialogTitle>ディスプレイセットの選択</DialogTitle>
          <DialogContent>
            <>
              {displaySets.length === 0 ? (
                <Typography>登録なし</Typography>
              ) : (
                displaySets.map((displaySet, i) => {
                  return (
                    <>
                      <MenuItem
                        key={i}
                        value={displaySet.displaySetId}
                        onClick={async (e) => {
                          const res = await Promise.all([
                            ...displaySet.files.map((e) =>
                              withLoading(
                                request<ImageSet>(
                                  "GET",
                                  ServerPath.file(e.fileId)
                                )
                              )
                            ),
                          ]);

                          setImgs(res);
                          setShowDialog(false);
                        }}
                      >
                        {" "}
                        {displaySet.name}
                      </MenuItem>
                    </>
                  );
                })
              )}
              <Box mt={2} />
              <Button onClick={() => router.push(FrontPath.settings)}>
                設定する
              </Button>
            </>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)}>閉じる</Button>
          </DialogActions>
        </Dialog>
      }
    </div>
  );
};

export default Home;
