import { application } from 'express';

import * as core from 'express-serve-static-core';
import { postStartup, resWriteOut, setCorsHeaders } from './HttpUtils';
import { dbGetUserAccount, dbInsertAlias, dbUpdateAlias } from './index-db';
import {auth} from 'express-oauth2-jwt-bearer';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';

export function setupAuth0(app: core.Express) {

  
  const checkJwt = auth({
    audience: 'https://tourjs.ca/',
    issuerBaseURL: `https://dev-enlwsasz.us.auth0.com/`,
  });

  app.get('/user-account', [checkJwt], async (req, res) => {
    console.log("a get happened");
    setCorsHeaders(req,res);
    const sub = req.auth?.payload?.sub as string
    if(!sub) {
      throw new Error("Sub not provided");
    }

    const user = await dbGetUserAccount(sub);

    resWriteOut(res, user);
  })

  app.post('/alias', [checkJwt], async (req, res) => {
    console.log("a post happened");
    const data = await postStartup(req, res);
    const {alias, user} = data;

    const sub = req.auth?.payload?.sub as string;
    let result;
    if(data.id >= 0) {
      // they're editing an existing alias
      result = await dbUpdateAlias(sub, alias);
    } else {
      console.log("they're not editing an alias");
      result = await dbInsertAlias(sub, alias, user);
    }
    resWriteOut(res, result);
  })

  console.log("auth0 API configured");
}