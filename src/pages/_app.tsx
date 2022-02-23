import { Box, CircularProgress } from "@mui/material";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { SignIn } from "../components/Signin";
import { driveAuthState } from "../recoil/atom/drive-auth";
import { loadingState } from "../recoil/atom/loading";
import { userAuthState } from "../recoil/atom/user-auth";
import { ServerPath } from '../server/helper/const';
import { AppUser } from '../type/model/firestore-user.type';
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
  const [driveAuth, setDriveAuth] = useRecoilState(driveAuthState);

  useEffect(() => {
    return FrontFirebaseHelper.listenFirebaseAuth((user) => {
      setAuthState(user);

        request<AppUser>('GET', ServerPath.user(user.uid),{headers: {
        userAuth: user,
      }}).then(appUser => {
        setDriveAuth(appUser.driveAuth)
      })

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
