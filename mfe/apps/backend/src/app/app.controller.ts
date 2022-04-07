import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/flights')
  getData() {
    return this.appService.getData();
  }

  @Post('/login')
  login() {
    return this.appService.login();
  }
}
