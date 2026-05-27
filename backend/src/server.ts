import { env } from "./config/env";
import { app } from "./app";

app.listen(env.PORT, () => {
  console.log(`Farm NFT backend listening on port ${env.PORT}`);
});
