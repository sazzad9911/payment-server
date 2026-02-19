import admin from "../config/firebase";

export const sendPush = async (token: string, title: string, body: string) => {
  await admin.messaging().send({
    token,
    notification: {
      title,
      body,
    },
    android: {
      priority: "high",
    },
    webpush: {
      notification: {
        icon: "https://i.ibb.co.com/Q3mtZDZK/appstore.jpg",
      },
    },
  });
};
export const sendPushMultiple = async (
  tokens: string[],
  title: string,
  body: string,
) => {
  await admin.messaging().sendEachForMulticast({
    tokens,
    notification: {
      title,
      body,
    },
    webpush: {
      notification: {
        icon: "https://i.ibb.co.com/Q3mtZDZK/appstore.jpg",
      },
    },
  });
};
