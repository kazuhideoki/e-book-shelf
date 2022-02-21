/* eslint-disable import/no-anonymous-default-export */
import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "../../../server/firebase-service";
import { ApiHelper } from "../../../server/helper/api-helper";
import { DisplaySet } from "../../../type/model/firestore-display-set.type";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const api = new ApiHelper(req, res);
  const userId = api.userId;

  return api.handler({
    get: async () => {
      try {
        const response = await firestore
          .collection("DisplaySets")
          .where("userId", "==", userId)
          .get()
          .then((qss) => qss.docs.map((e) => e.data()));

        // display-sets/{id}/files で storageからpdf表示ファイル取得できるようにする？？
        // 要検討

        res.status(200).json(response);
      } catch (error) {
        res.status(500).json(error);
      }
    },
    post: async () => {
      const data = api.data;
      const ref = firestore.collection("DisplaySets").doc();

      const firebaseData: DisplaySet = {
        userId: userId,
        displaySetId: ref.id,
        files: data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await ref.create(firebaseData);

      res.status(200).json(response);
    },
  });
};