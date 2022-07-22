import {Client} from "aedes/types/client";
import {AuthenticateError} from "aedes/types/instance";
import {AuthErrorCode} from "aedes";
import {CONFIG} from "./config";


export const authHandler = (
  client: Client,
  username: Readonly<string>,
  password: Readonly<Buffer>,
  done: (error: AuthenticateError | null, success: boolean | null) => void
) => {
  if (credentialsAreValid(username, password)
  ) {
    done(null, true);
    console.debug(`Authenticated successfully: ${client.id}`);
  } else {
    const authenticate_error = new Error() as AuthenticateError;
    authenticate_error.returnCode = AuthErrorCode.BAD_USERNAME_OR_PASSWORD;
    done(authenticate_error, false);
  }
}

function credentialsAreValid(username: Readonly<string>, password: Readonly<Buffer>): boolean {
  try {
    return username === CONFIG.username && password.toString() === CONFIG.password
  } catch (e) {
    return false
  }
}
