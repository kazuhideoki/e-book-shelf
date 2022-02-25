import { DriveFiles } from "../../type/model/google-drive-file.type";
import { BaseQuery } from "../helper/base-query";
import { ExternalPath } from "../helper/const";
import { BaseService } from "./base.service";

export type DriveFileQuery = {
  q?: string;
  pageToken?: string;
} & BaseQuery;

export class DriveFileService extends BaseService {
  async list({
    q,
    pageToken,
    pageSize,
    orderBy,
  }: DriveFileQuery): Promise<DriveFiles> {
    const response = await this.daxiosRequest<DriveFiles>(
      "GET",
      ExternalPath.files,
      {
        params: {
          pageSize: pageSize ?? 10,
          orderBy: orderBy?.join(","),
          q,
          pageToken,
        },
      }
    ).catch((e) => {
      console.log({ e });
      throw e;
    });

    return response;
  }

  async fetchMedia(fileId: string): Promise<string> {
    return await this.daxiosRequest<any>("GET", ExternalPath.file(fileId), {
      params: {
        alt: "media",
      },
      responseEncoding: "base64",
    });
  }
}
