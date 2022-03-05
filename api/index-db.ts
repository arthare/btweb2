import mysql from 'mysql2';
import fs from 'fs';
import { TourJsAccount } from './tourjs-shared/signin-types';


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


export async function dbGetUserAccount(sub:string):Promise<TourJsAccount> {
  
  interface RawRowResult {
    users_username:string;
    alias_id:number;
    alias_name:string;
    alias_handicap:number;
    alias_image:string;
  }

  let db;
  try {
    db = await getDb();

    return new Promise<TourJsAccount>((resolve, reject) => {
      db.query(`SELECT 
                    users.username as users_username,
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
        if(err) {
          reject(err);
        } else if(res.length >= 1) {
          let ret:TourJsAccount = {
            username: res[0].users_username,
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
          // hmmm, no user exists.
          reject("No database user exists.  Todo: create new users");
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