import { Injectable, Scope } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { DateTime } from 'luxon';
import { PDFDocument } from 'pdf-lib';
import { AuthContext } from '../0-base/auth-context';
import { DriveFileRepository } from '../1-repositories/drive-file-repository';
import { ImageSetRepository } from '../1-repositories/image-set.repository';
import { StorageRepository } from '../1-repositories/storage-repository';
import { ImageSet, ImageSetMeta } from '../type/model/firestore-image-set.type';
import { BaseService } from './helper/base.service';
import { convertPDFToImage } from './helper/convert-pdf-to-image';

const expiryTime = 60 * 60 * 24 * 7; // 1 week

@Injectable({ scope: Scope.REQUEST })
export class FileService extends BaseService {
  constructor(
    private readonly imageSetRepository: ImageSetRepository,
    private readonly driveFileRepository: DriveFileRepository,
    private readonly storageRepository: StorageRepository,
    private readonly authContext: AuthContext,
  ) {
    super();
  }

  async findImageSet(fileId: string): Promise<ImageSet> {
    const imageSet = await this.imageSetRepository.find(fileId);

    if (imageSet && DateTime.now() < DateTime.fromJSDate(imageSet.expiredAt)) {
      // TODO Drive側で更新されていたら取得し直す処理も必要
      console.log(`imageSet exists and not expired`);

      return imageSet;
    }

    if (
      !imageSet ||
      !(DateTime.now() < DateTime.fromJSDate(imageSet.expiredAt))
    )
      console.log(`imageSet not found`);

    const media = await this.driveFileRepository.fetchMedia(
      fileId,
      this.authContext.auth.accessToken,
    );
    console.log({ media });

    const buf = Buffer.from(media);
    writeFileSync(`./tmp/${fileId}.pdf`, buf);

    // const parseResult = await PdfParse(buf); // 文字、メタデータなど取れる。注釈は取れない。。。

    const base64 = buf.toString('base64');

    const doc = await PDFDocument.load(base64);
    const pages = doc.getPages().length;
    const page = doc.getPage(0);

    const width = page.getWidth();
    const height = page.getHeight();

    console.log({ width, height });

    console.log(`PDF downloaded from Google Drive`);

    const image = await convertPDFToImage(fileId, base64, {
      width,
      height,
    });

    await this.storageRepository.save(fileId, image);

    const expires = DateTime.fromJSDate(new Date())
      .plus({
        seconds: expiryTime,
      })
      .toJSDate();
    const url = await this.storageRepository.getSignedUrl(fileId, expires);

    const meta: ImageSetMeta = {
      // pages: parseResult.numpages,555
      pages,
    };

    // if (parseResult.info.Title) meta.title = parseResult.info.Title;

    const data: ImageSet = {
      accountId: this.authContext.auth.accountId,
      fileId,
      path: url,
      meta: meta,
      expiredAt: expires,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log({ data });

    await this.imageSetRepository.register(fileId, data);
    console.log(`cache path saved in Firestore`);

    return data;
  }
}
