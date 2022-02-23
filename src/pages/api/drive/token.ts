/* eslint-disable import/no-anonymous-default-export */
import type { NextApiRequest, NextApiResponse } from "next";
import { DriveAuth } from "../../../recoil/atom/drive-auth";
import { collection } from "../../../server/firebase-service";
import { ApiHelper } from "../../../server/helper/api-helper";
import { ExternalPath, FrontPath } from "../../../server/helper/const";
import { HttpsError } from "../../../server/helper/https-error";
import { axiosRequest } from "../../../utils/axios";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const api = new ApiHelper(req, res);

  return api.handler({
    get: async () => {
      const { code } = api.query;
      const userId = req.query.userId as string;

      if (!api.query.driveAuth) {
        throw new HttpsError("invalid-argument", `driveAuth is Empty`);
      }

      const userAuth = JSON.parse(api.query.driveAuth);

      const data = {
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_CLIENT_ID,
        client_secret: process.env.GOOGLE_DRIVE_API_CLIENT_SECRET,
        redirect_uri: process.env.NEXT_PUBLIC_WEB_SERVICE_URL,
        grant_type: "authorization_code",
      };

      const response = await axiosRequest<DriveAuth>(
        "POST",
        ExternalPath.googleapiToken,
        {
          data,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      await collection("users").doc(userId).set({
        id: userId,
        userAuth,
        DriveAuth: response,
      });

      res.writeHead(302, {
        Location: FrontPath.top,
      });
      res.end();
    },
  });
};
