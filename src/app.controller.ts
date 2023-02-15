import { Controller, Get } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const pkg = readFileSync(resolve(process.cwd(), 'package.json'));
const { version, name } = JSON.parse(pkg.toString());

@Controller()
export class AppController {
  @Get('')
  getInfo() {
    return { version, name };
  }
}
