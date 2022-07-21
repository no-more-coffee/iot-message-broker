import {Client} from "aedes/types/client";
import {AuthenticateError} from "aedes/types/instance";
import {AuthErrorCode} from "aedes";

const validUsername = process.env.USERNAME || "brokerusername";
const validPassword = process.env.PASSWORD || "brokerpassword";

export const authHandler = (
  client: Client,
  username: Readonly<string>,
  password: Readonly<Buffer>,
  done: (error: AuthenticateError | null, success: boolean | null) => void
) => {
  if (credentialsAreValid(username, password)
  ) {
    done(null, true);
    console.debug(`Client authenticated successfully: ${client.id}`);
  } else {
    const authenticate_error = new Error() as AuthenticateError;
    authenticate_error.returnCode = AuthErrorCode.BAD_USERNAME_OR_PASSWORD;
    done(authenticate_error, false);
  }

}

function credentialsAreValid(username: Readonly<string>, password: Readonly<Buffer>): boolean {
  try {
    return username === validUsername && password.toString() === validPassword
  } catch (e) {
    return false
  }
}
