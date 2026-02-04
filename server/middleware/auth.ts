import { sendRedirect } from "h3";
import { tryCatch } from "@eoussama/core";

import { isLoggedIn } from "../utils";



export default defineEventHandler(async (e) => {
  const url = getRequestURL(e);
  const [err, loggedIn] = await tryCatch(async () => await isLoggedIn(e));

  // If the user is navigating to any page other than /login
  if (url.pathname.indexOf("login") === -1) {
    if (err || !loggedIn) {
      sendRedirect(e, "/login", 302);
    }
  } else {
    // if the user is navigating to /login
    if (loggedIn) {
      sendRedirect(e, "/", 302);
    }
  }
});
