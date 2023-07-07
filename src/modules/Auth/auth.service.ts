import { Injectable } from '@nestjs/common';
import * as jsforce from 'jsforce';
import { Connection } from 'jsforce';
// import { extractText } from 'office-text-extractor'
import * as fs from 'fs';
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { Document } = require('docxtemplater');
const officeParser = require('officeparser');
const expressionParser = require('docxtemplater/expressions.js');
const axios = require('axios');
@Injectable()
export class AuthService {
  private conn2: any;
  private oauth2: any;
  connections: Map<string, Connection>;
  public constructor() {
    this.connections = new Map<string, Connection>();
    console.log(this.connections);
  }

  async salesforceOauth2(req: any, res: any) {
    this.oauth2 = new jsforce.OAuth2({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: `${req.protocol}://${req.get('host')}/getAccessToken`,
    });
    res.redirect(this.oauth2.getAuthorizationUrl({}));
  }

  async getAccessToken(req: any, response: any) {
    const conn = new jsforce.Connection({ oauth2: this.oauth2 });
    console.log(this.connections, 1);
    const _this = this;
    // const ress=response
    conn.authorize(req.query.code, function (err, userInfo) {
      if (err) {
        return console.error(err);
      }
      console.log(_this.connections, 2);
      _this.conn2 = new jsforce.Connection({
        instanceUrl: conn.instanceUrl,
        accessToken: conn.accessToken,
      });
      _this.conn2.identity(function (err, res) {
        console.log(_this.connections);
        if (err) {
          return console.error(err);
        }
        response.send({
          userID: res.user_id,
          success: true,
          message: 'User Authorised',
        });
      });
    });
  }

  async getConnection(userId: string): Promise<any> {
    console.log();
    return this.connections.get(userId);
  }
  async getalldata(connection: Connection) {
    try {
      const data = await connection.query(
        'SELECT Id, Name FROM Account',
        async function (err, result) {
          if (err) {
            return console.error(err);
          }
          console.log('total : ' + result.totalSize);
          console.log('fetched : ' + result.records.length);
          let tempObj2 = {
            total: result.totalSize,
            fetched: result.records.length,
          };
          return tempObj2;
        },
      );
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  async GenerageDocxFile(body) {
    let arrayBuffer: any;
    const sourceContentVersionFile = await this.conn2
      .query(`SELECT Id, Title, ContentSize, VersionData, PathOnClient
    FROM ContentVersion 
    ORDER BY CreatedDate DESC
    LIMIT 1`);
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      responseType: 'arraybuffer',
      url:
        this.conn2.instanceUrl +
        sourceContentVersionFile.records[0].VersionData,
      headers: {
        Authorization: 'Bearer ' + this.conn2.accessToken,
      },
    };
    const hh = await axios
      .request(config)
      .then((response) => {
        arrayBuffer = response.data;
        // fs.writeFileSync('fff.docx', response.data)
        return 'done';
      })
      .catch((error) => {
        console.log(error);
      });

    const data = await officeParser.parseOfficeAsync(arrayBuffer);
    const regex = /\{(.*?)\}/g;
    const matches = data.match(regex);
    const variableNames = Array.from(
      new Set(
        matches
          .map((mergeField) => {
            return mergeField.replace(/[{}]/g, '').trim();
          })
          .filter((item) => !item.endsWith('_c')),
      ),
    );
    console.log(variableNames);
    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      parser: expressionParser,
    });
    const accountQuery = ` SELECT ${variableNames.join(',')}
FROM Quote Where id ='0Q02t000000YnEeCAK'`;
    const accountdata = await this.conn2.query(accountQuery);
    doc.render(accountdata['records'][0]);
    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
    fs.writeFileSync(`report-${Date.now()}.docx`, buf);
    return {
      "templateId":body
    }
  }
}
