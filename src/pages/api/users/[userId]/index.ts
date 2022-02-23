/* eslint-disable import/no-anonymous-default-export */
import type { NextApiRequest, NextApiResponse } from "next";
import { collection, toData } from "../../../../server/firebase-service";
import { ApiHelper } from "../../../../server/helper/api-helper";
import { RegisterAppUser } from "../../../../type/api/firestore-user-api.type";
import { AppUser } from "../../../../type/model/firestore-user.type";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const api = new ApiHelper(req, res);

  return api.handler({
    get: async () => {
      const userId = api.userId;
      const userAuth = api.userAuth;

      try {
        const user = await toData<AppUser>(
          collection("users").doc(userId).get()
        ).catch((e) => {
          console.log({ e });

          console.log(`error occurred in fetch appUser: ${e}`);
        });

        console.log(`Fetched appUser: ${user}`);

        if (user) {
          return res.status(200).json(user);
        }

        const data: RegisterAppUser = { userId, userAuth };
        console.log({ data });

        await collection("users").doc(userId).create(data);

        return res.status(200).json(data);
      } catch (error) {
        console.log({ error });

        res.status(500);
        res.end();
      }
    },
  });
};
