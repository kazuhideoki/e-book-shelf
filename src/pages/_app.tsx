import { Box, CircularProgress } from "@mui/material";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { SignIn } from "../components/Signin";
import { displaySetsState } from "../recoil/atom/display-set";
import { driveAuthState } from "../recoil/atom/drive-auth";
import { loadingState } from "../recoil/atom/loading";
import { userAuthState } from "../recoil/atom/user-auth";
import { useRequest } from "../utils/axios";
import { FrontFirebaseHelper } from "../utils/front-firebase";

interface P {
  code?: string;
}

export default function App(props: AppProps) {
  return (
    <RecoilRoot>
      <_App {...props} />
    </RecoilRoot>
  );
}

function _App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const request = useRequest();

  const loading = useRecoilValue(loadingState);
  const [userAuth, setAuthState] = useRecoilState(userAuthState);
  const [displaySets, setDisplaySets] = useRecoilState(displaySetsState);
  const driveAuth = useRecoilValue(driveAuthState);

  useEffect(() => {
    return FrontFirebaseHelper.listenFirebaseAuth((user) => {
      setAuthState(user);
    });
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={96} />
      </Box>
    );
  }

  console.log({ userAuth, driveAuth });

  if (!userAuth || !driveAuth) {
    return <SignIn />;
  }

  return (
    <>
      <Component {...pageProps} />
    </>
  );
}
