import { Module } from '@nestjs/common';
import { RouterModule as NestJsRouterModule } from '@nestjs/core';
import { AuthModule } from 'src/modules/Auth/auth.module';

@Module({
    imports:[
        AuthModule,
        NestJsRouterModule.register([
            {
                path: '/',
                module: AuthModule
            }
        ]),
    ]
})
export class RouterModule {}
