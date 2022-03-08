import { ImageSet } from '../../../type/model/firestore-image-set.type';
import {
  timestampFromDateRecursively,
  toData,
} from '../0-base/server-firebase';
import { SettingServerFirebase } from '../0-base/setting-server-firebase';

export class ImageSetRepository {
  constructor(private firebase: SettingServerFirebase) {}

  async find(fileId: string): Promise<ImageSet> {
    const response = await toData<ImageSet>(
      this.firebase.collection('imageSets').doc(fileId).get(),
    ).catch((e) => {
      console.log({ e });
      throw e;
    });

    return response;
  }

  async register(fileId: string, data: ImageSet): Promise<void> {
    await this.firebase
      .collection('imageSets')
      .doc(fileId)
      .set(timestampFromDateRecursively(data))
      .catch((e) => console.log(`error occurred in firestore: ${e}`));
  }
}
