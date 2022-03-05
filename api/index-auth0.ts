import { application } from 'express';

import * as core from 'express-serve-static-core';
import { resWriteOut, setCorsHeaders } from './HttpUtils';
import { dbGetUserAccount } from './index-db';

export function setupAuth0(app: core.Express) {

  app.get('/user-account', async (req, res) => {
    setCorsHeaders(req,res);
    const sub = req.query?.sub;
    if(!sub) {
      throw new Error("Sub not provided");
    }

    const user = await dbGetUserAccount(sub);

    resWriteOut(res, user);
  })

  console.log("auth0 API configured");
}