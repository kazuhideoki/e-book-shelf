import { OAuth2Client } from "google-auth-library";
import { NextApiRequest } from "next";
import { AccountService } from "../../../../server/src/1-repositories/account.service";
import { AuthContext } from "../../server/helper/auth-context";
import { ContextHolder } from "../../server/helper/context";

const client = new OAuth2Client(process.env.CLIENT_ID);

export async function middleware(req: NextApiRequest) {
  console.log(`⭐ middleware`);

  const Authorization = (req.headers as any).authorization as string;
  const tokens = Authorization?.replace("Bearer ", "").split("/");
  const idToken = tokens[0];
  const accessToken = tokens[1];

  console.log({ idToken });

  // tokenが古いと Token used too late のエラーになる -> どう処理する？
  const [ticket] = await Promise.all([
    client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    }),
  ]);

  console.log({ ticket });

  const payload: { name: string; email: string; picture?: string } =
    ticket.getPayload() as any;

  console.log({ payload });

  let account = await AccountService.initFind(payload.email);
  console.log(account);

  const authContext = new AuthContext({
    ...account,
    accountId: account?.id,
    accessToken,
  });
  ContextHolder.set(authContext);

  if (!account) {
    const data = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };

    await new AccountService(authContext).register(data);
  }
}
