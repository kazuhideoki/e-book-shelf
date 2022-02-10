import type { NextApiRequest, NextApiResponse } from "next";
import { ServerDriveService } from "../../../server/google-drive.service";
import { GetAccessToken } from "../../../type/google-drive-api.type";

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { code } = req.body as GetAccessToken;

    try {
      const res = ServerDriveService.getAccessToken(code);

      console.log(res);
    } catch (error) {
      console.log({ error });
    }
    res.status(200).json({ name: "John Doe" });
  }
};
