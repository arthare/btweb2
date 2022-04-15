import mysql from 'mysql2';
import fs from 'fs';
import { TourJsAccount, TourJsAlias } from './tourjs-shared/signin-types';


function createConfig() {
  const config = JSON.parse(fs.readFileSync('./db-config.json', 'utf8'));
  return config;
}

const config = createConfig();

function getDb():Promise<mysql.Connection> {

  function reconnect():Promise<mysql.Connection> {
    return new Promise((resolve, reject) => {
      const connection = mysql.createConnection(config);
      connection.connect((err) => {
        if(err) {
          reject(err);
        } else {
          resolve(connection);
        }
      })
      
    })
  }
  return reconnect();
}


export async function dbCreateUserAccount(sub:string, nickname:string):Promise<TourJsAccount> {
  console.log("creating user account with stats ", sub, nickname);
  let db;
  try {
    db = await getDb();

    await new Promise<void>((resolve, reject) => {
      db.query(`insert into users (sub, username) values (?,?)`, [sub, nickname], (err, res:any) => {
        if(err) {
          reject(err);
        } else {
          resolve();
        }
      })
    })

  } catch(e) {
    throw e;
  } finally {
    if(db) {
      db.end();
    }
  }

  console.log("created user account with stats ", sub, nickname);

  // all user accounts need an alias
  const firstAlias:TourJsAlias = {
    name:nickname,
    handicap:150,
    imageBase64:'',
    id:-1,
  }
  await dbInsertAlias(sub, firstAlias, nickname);

  return dbGetUserAccount(sub);
}

export async function dbGetUserAccount(sub:string):Promise<TourJsAccount> {
  
  console.log("getting user account with sub ", sub);
  interface RawRowResult {
    users_username:string;
    users_sub:string;
    users_id:number;
    alias_id:number;
    alias_name:string;
    alias_handicap:number;
    alias_image:string;
  }

  let db;
  try {
    db = await getDb();

    return await new Promise<TourJsAccount>((resolve, reject) => {
      db.query(`SELECT 
                    users.username as users_username,
                    users.sub as users_sub,
                    users.id as users_id,
                    aliases.id as alias_id,
                    aliases.name as alias_name,
                    aliases.handicap as alias_handicap,
                    aliases.image as alias_image
                FROM
                    aliases,
                    users
                WHERE
                    aliases.userid = users.id
                        AND users.sub = ?`, [sub], (err, res:RawRowResult[]) => {
        console.log("dbGetUserAccount got results for sub ", sub, err, res);
        if(err) {
          reject(err);
        } else if(res.length >= 1) {
          let ret:TourJsAccount = {
            username: res[0].users_username,
            sub: res[0].users_sub,
            accountid: res[0].users_id,
            aliases: res.map((resRow) => {
              return {
                id:resRow.alias_id,
                name:resRow.alias_name,
                handicap:resRow.alias_handicap,
                imageBase64:resRow.alias_image,
              }
            })
          }
          resolve(ret);
        } else {
          // hmmm, no user exists.  or possible just no aliases exist

          db.query(`SELECT 
                        users.username as users_username,
                        users.sub as users_sub,
                        users.id as users_id
                    FROM
                        users
                    WHERE
                        users.sub = ?`, [sub], (err, res:RawRowResult[]) => {
            if(err) {
              reject(err);
            } else if(res.length >= 1) {
              let ret:TourJsAccount = {
                username: res[0].users_username,
                sub: res[0].users_sub,
                accountid: res[0].users_id,
                aliases: [],
              }
              resolve(ret);
            } else {
              reject("No DB users exist");
            }
          })
        }
      })
    })

  } catch(e) {
    console.log("dbGetUserAccount error ", e);
    throw e;
  } finally {
    if(db) {
      console.log("dbGetUserAccount closing db");
      db.end();
      console.log("dbGetUserAccount closed db");
    }
  }
}


export async function dbUpdateAlias(sub:string, alias:TourJsAlias):Promise<TourJsAlias> {
  
  let db;
  const user = await dbGetUserAccount(sub);
  if(!user) {
    throw new Error("You are not signed into the right account in order to modify that alias");
  }
  const foundAlias = user.aliases.find((oldAlias) => oldAlias.id === alias.id);
  if(!foundAlias) {
    throw new Error("There doesn't appear to be an alias on that account with that id");
  }

  try {
    db = await getDb();

    return new Promise<TourJsAlias>((resolve, reject) => {
      db.query(`UPDATE aliases set name=?, handicap=?, image=? where id=?`, [alias.name, alias.handicap, alias.imageBase64, alias.id], (err, res:any) => {
        if(err) {
          reject(err);
        } else {
          // updated!
          resolve(alias);
        }
      })
    })

  } catch(e) {
    throw e;
  } finally {
    if(db) {
      db.end();
    }
  }
}

export async function dbInsertAlias(sub:string, alias:TourJsAlias, nicknameOfUserAccount:string):Promise<TourJsAlias> {
  
  console.log("dbInsertAlias start");
  let db;
  let user:TourJsAccount;
  try {
    user = await dbGetUserAccount(sub);
    console.log("dbInsertAlias got user ", user);
  } catch(e) {
    // no user exists.  so let's create one
    console.log("dbInsertAlias got error ", e);
    user = await dbCreateUserAccount(sub, nicknameOfUserAccount);
    console.log("dbInsertAlias tried fresh insert");
  }

  try {
    db = await getDb();

    return new Promise<TourJsAlias>((resolve, reject) => {
      db.query(`insert into aliases (name, handicap, image, userid) values (?,?,?,?)`, [alias.name, alias.handicap, alias.imageBase64, user.accountid], (err, res:any) => {
        if(err) {
          reject(err);
        } else {
          // updated!
          alias.id = res.insertId;
          resolve(alias);
        }
      })
    })

  } catch(e) {
    throw e;
  } finally {
    if(db) {
      db.end();
    }
  }
}