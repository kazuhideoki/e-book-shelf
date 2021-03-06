import { Module, Scope } from '@nestjs/common';
import { AuthContext } from '../0-base/auth-context';
import { FirebaseSetting } from '../0-base/initialize-firebaes';
import { AccountRepository } from '../1-repositories/account.repository';
import { SelfController } from '../3-controllers/self.controller';

@Module({
  controllers: [SelfController],
  providers: [
    AccountRepository,
    AuthContext,
    FirebaseSetting,
    {
      provide: 'AUTH_CONTEXT_INIT',
      useValue: {},
      scope: Scope.REQUEST,
    },
  ],
})
export class SelfModule {}
