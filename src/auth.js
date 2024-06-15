import { JWT } from "google-auth-library";
import credentials from "../durable-micron-426402-a1-017fe82ead1e.json" assert { type: "json" };

const auth = () => {
  return new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
};

export { auth };
