import { FolderOpen } from "@mui/icons-material";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Icon,
  Typography,
} from "@mui/material";
import type { NextPage } from "next";
// import Link from 'next/link';
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { pdfjs } from "react-pdf";
import { FrontPath, ServerPath } from "../server/helper/const";
import { RegisterDispalySet } from "../type/api/firestore-display-set-api.type";
import { ListDriveFiles } from "../type/api/google-drive-api.type";
import { DriveFile, DriveFiles } from "../type/model/google-drive.type";
import { useRequest } from "../utils/axios";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface P {
  code?: string;
}

const Settings: NextPage<P> = () => {
  const router = useRouter();
  const request = useRequest();

  const [values, setValues] = useState<{
    folderData: {
      folders: (DriveFile & { files?: DriveFile[]; pageToken?: string })[];
      pageToken: string;
    } | null;
    selectedFiles: { file: DriveFile; index: number }[];
  }>({
    folderData: null,
    selectedFiles: [],
  });

  console.log({ values });

  const handleFetchFolderList = useCallback(async () => {
    try {
      const res = await request<DriveFiles, ListDriveFiles>(
        "GET",
        ServerPath.files,
        {
          params: {
            q: "mimeType = 'application/vnd.google-apps.folder'",
            pageToken: values.folderData?.pageToken,
          },
        }
      );

      setValues({
        ...values,
        folderData: {
          folders: values.folderData?.folders
            ? [...values.folderData?.folders, ...res.files]
            : res.files,
          pageToken: res.nextPageToken,
        },
      });
    } catch (error) {
      console.log(`Error occurred ${error}`);
    }
  }, [values]);

  const handleFetchFileList = useCallback(
    async (folder: DriveFile) => {
      const targetFolder = values.folderData?.folders.find(
        (e) => e.id === folder.id
      )!;

      try {
        const res = await request<DriveFiles, ListDriveFiles>(
          "GET",
          ServerPath.files,
          {
            params: {
              q: `mimeType = 'application/pdf' and '${folder.id}' in parents`,
              pageToken: targetFolder?.pageToken,
            },
          }
        );

        const files = targetFolder?.files
          ? [...targetFolder.files, ...res.files]
          : res.files;

        // folderのfileを追加
        const updatedFolders: (DriveFile & {
          files?: DriveFile[];
          pageToken?: string;
        })[] = values.folderData?.folders.map((folder) => {
          if (folder.id === targetFolder.id) {
            return {
              ...folder,
              files: files,
              pageToken: res.nextPageToken,
            };
          }
          return folder;
        })!;

        setValues({
          ...values,
          folderData: {
            ...values.folderData!,
            folders: updatedFolders,
          },
        });
      } catch (error) {
        console.log(`Error occurred: ${error}`);
      }
    },
    [values]
  );

  const handleSubmitDisplaySets = useCallback(async () => {
    try {
      await request<any, RegisterDispalySet>("POST", ServerPath.displaySets, {
        data: values.selectedFiles.map((e) => ({
          fileId: e.file.id,
          index: e.index,
        })),
      });

      console.log("Successfully saved display set!");
    } catch (error) {
      console.log(`Error occurred: ${error}`);
    }
  }, [values]);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item container spacing={1}>
        <Grid item>
          <Icon sx={{ fontSize: 40 }}>
            <SettingsApplicationsIcon sx={{ fontSize: 40 }} />
          </Icon>
        </Grid>
        <Grid item container spacing={2} alignItems="end">
          <Grid item>
            <Typography variant="h3">表示設定</Typography>
          </Grid>
          <Grid item>
            <Button onClick={() => router.push(FrontPath.top)}>
              <Typography variant="h5">ディスプレイページに戻る</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={handleFetchFolderList}>
          フォルダーの読み込み
        </Button>
      </Grid>
      <Grid item container direction="column" spacing={1}>
        {values.folderData &&
          values.folderData.folders.map((folder, i) => {
            const files = values.folderData?.folders.find(
              (e) => e.id === folder.id
            )?.files;
            return (
              <Grid item container key={i} spacing={2}>
                <Grid item>
                  <Icon>
                    <FolderOpen />
                  </Icon>
                </Grid>
                <Grid item>
                  <Typography variant="h5">{folder.name}</Typography>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    onClick={() => handleFetchFileList(folder)}
                  >
                    ファイルの読み込み
                  </Button>
                </Grid>
                {files?.length && (
                  <Grid item container direction="column">
                    <FormGroup>
                      {files?.map((file, i) => (
                        <FormControlLabel
                          key={i}
                          control={<Checkbox />}
                          onClick={(e) => {
                            const index = values.selectedFiles.length + 1;

                            setValues({
                              ...values,
                              selectedFiles: (e.target as any).checked
                                ? [...values.selectedFiles, { file, index }]
                                : values.selectedFiles.filter(
                                    (e) => e.file.id !== file.id
                                  ),
                            });
                          }}
                          label={file.name}
                        />
                      ))}
                    </FormGroup>
                  </Grid>
                )}
              </Grid>
            );
          })}
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={handleSubmitDisplaySets}>
          設定を登録
        </Button>
      </Grid>
    </Grid>
  );
};

export default Settings;
