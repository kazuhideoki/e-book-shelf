import { OAuth2Client } from "google-auth-library";
import { NextApiRequest } from "next";
import { AuthContext } from "../../server/helper/auth-context";
import { ContextHolder } from "../../server/helper/context";
import { AccountService } from "../../server/service/account.service";
import { AppUser } from "../../type/model/firestore-user.type";

const client = new OAuth2Client(process.env.CLIENT_ID);

export async function middleware(req: NextApiRequest) {
  console.log(`⭐ middleware`);

  const Authorization = (req.headers as any).authorization as string;
  const token = Authorization?.replace("Bearer ", "");

  console.log({ token });
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });
  console.log({ ticket });
  const payload: { name: string; email: string; picture?: string } =
    ticket.getPayload() as any;

  console.log({ payload });

  let account = await new AccountService({} as AppUser).findByEmail(
    payload.email
  );

  console.log(account);

  if (!account) {
    account = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };

    await new AccountService({} as AppUser).register(account);
  }

  ContextHolder.set(new AuthContext(account));
}
