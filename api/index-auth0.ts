import { application } from 'express';

import * as core from 'express-serve-static-core';
import { postStartup, resWriteOut, setCorsHeaders } from './HttpUtils';
import { dbCreateUserAccount, dbGetUserAccount, dbInsertAlias, dbUpdateAlias, dbUpdateHandicap } from './index-db';
import {auth} from 'express-oauth2-jwt-bearer';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';
import {auth as openIdAuth} from 'express-openid-connect'

export function setupAuth0(app: core.Express) {

  const sessionSecret = 'bf5011f63a3bfbb7ab87f6e767f14a6989218179b97d80609cb4d8db4726a75d';
  
  const checkJwt = auth({
    audience: 'https://tourjs.ca/',
    issuerBaseURL: `https://dev-enlwsasz.us.auth0.com/`,
  });

  /*
  const secondAuth = openIdAuth({
    issuerBaseURL: `https://dev-enlwsasz.us.auth0.com/`,
    baseURL: 'http://localhost:8081',
    clientID: 'EbWcX7H3Jr9TMWZHFEd1QcLuQasfsWEK',
    secret: sessionSecret,
    authRequired: false,
    auth0Logout: true,
    clientSecret: 'qO9kMYUn48DTkokeq2X27021Fs1_d4vI5jymgNYUtwn62EAxI20Fhk1hcvA2B6LH',
    authorizationParams: {
      response_type: "code",
      audience: 'https://tourjs.ca/',
    },
  });
  */

  app.get('/user-account', [checkJwt], async (req, res) => {
    setCorsHeaders(req,res);
    const sub = req.auth?.payload?.sub as string
    if(!sub) {
      throw new Error("Sub not provided");
    }
    if(!req.query.nickname) {
      throw new Error("You need to supply a nickname whenever you call user-account in case we have to create one on the spot");
    }

    let user;
    try {
      user = await dbGetUserAccount(sub);
    } catch(e) {
      // no user?  ok, well let's create one
      user = await dbCreateUserAccount(sub, req.query.nickname.split('@')[0]);
    }

    resWriteOut(res, user);
  })

  app.post('/alias', [checkJwt], async (req, res) => {
    const data = await postStartup(req, res);
    const {alias, user} = data;

    const sub = req.auth?.payload?.sub as string;
    let result;
    if(alias.id >= 0) {
      // they're editing an existing alias
      result = await dbUpdateAlias(sub, alias);

      // this is redun
    } else {
      result = await dbInsertAlias(sub, alias, user);
    }
    resWriteOut(res, result);
  })

  console.log("auth0 API configured");
}