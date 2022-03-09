import {
  Body,
  Controller,
  Get,
  Injectable,
  Post,
  UseGuards,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { RegisterDispalySet } from '../../../type/api/firestore-display-set-api.type';
import { DisplaySet } from '../../../type/model/firestore-display-set.type';
import { AuthContext } from '../0-base/auth-context';
import { DisplaySetRepository } from '../1-repositories/display-set.repository';
import { AuthGuard } from '../security/auth-guard';

@Controller('display-sets')
@Injectable()
@UseGuards(AuthGuard)
export class DisplaySetController {
  constructor(
    private readonly displaySetService: DisplaySetRepository,
    private readonly authContext: AuthContext,
  ) {}

  @Get()
  getDisplaySets(): Promise<DisplaySet[]> {
    return this.displaySetService.list();
  }

  @Post()
  registerDisplaySet(@Body() data: RegisterDispalySet): Promise<DisplaySet> {
    const displaySet: DisplaySet = {
      accountId: this.authContext.instance().auth.accountId,
      displaySetId: `dpset_${v4()}`,
      name: data.name,
      files: data.files,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.displaySetService.register(displaySet);
  }
}
