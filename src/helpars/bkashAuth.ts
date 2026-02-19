import { httpClient } from "../config/httpClient";
import ApiError from "../errors/ApiErrors";
export interface IBkashConfig {
  baseUrl: string;
  username: string;
  password: string;
  appKey: string;
  appSecret: string;
  callbackURL: string;
}
export const bkashAuth = async (config: IBkashConfig) => {
  const res = await httpClient.post(
    `${config.baseUrl}/tokenized/checkout/token/grant`,
    {
      app_key: config.appKey,
      app_secret: config.appSecret,
    },
    {
      headers: {
        username: config.username,
        password: config.password,
      },
    },
  );
  // bKash returns id_token on success
  if (res.data?.statusCode !== "0000") {
    //console.error("bKash Auth failed:", res.data);
    throw new ApiError(404, res.data?.statusMessage);
  }
  return res.data.id_token;
};
