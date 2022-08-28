import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrenUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    return request.user['sub'];
  },
);
