import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
const jsforce = require('jsforce');

@Controller()
export class AuthController{
    constructor(private authService : AuthService){}
    @Get('/oauth2/auth')
    salesforceOauth2(@Req() req:any,@Res() res:any){
      return this.authService.salesforceOauth2(req, res)
    }
  
  
    @Get('/getAccessToken')
   async getAccessToken(@Req() req:any,@Res() res:any){
        return this.authService.getAccessToken(req, res)
    }

    @Post('/GenerateReport')
    async GenerateReport(@Body() body){
      console.log(body)
      return await this.authService.GenerageDocxFile(body)
    }
    
}