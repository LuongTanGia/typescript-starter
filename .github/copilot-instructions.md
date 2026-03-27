# Copilot instructions for this codebase

## Big picture architecture

- This is a NestJS 11 REST API with feature modules wired in [src/app.module.ts](../src/app.module.ts).
- Main bounded contexts:
  - `auth`: login/signup + JWT issuing ([src/auth/auth.controller.ts](../src/auth/auth.controller.ts), [src/auth/auth.service.ts](../src/auth/auth.service.ts))
  - `user`: CRUD over MongoDB users ([src/user/user.controller.ts](../src/user/user.controller.ts), [src/user/user.service.ts](../src/user/user.service.ts))
- Data layer is Mongoose with one schema model (`User`) defined in [src/schemas/user.schema.ts](../src/schemas/user.schema.ts), injected via `@InjectModel(User.name)` in services.
- Request flow pattern: `Controller` -> `Service` -> Mongoose model. Controllers stay thin; business logic lives in services.

## API contract conventions (project-specific)

- Responses are wrapped in custom envelope classes, not raw objects:
  - `APIObjectResponse` for single object
  - `APIListResponse` for arrays
  - `APIErrorResponse` for domain-style errors
  - See [src/common/interfaces/api-response.interface.ts](../src/common/interfaces/api-response.interface.ts).
- Error semantics use `ERROR_CODE` + `ERROR_MESSAGE` constants ([src/common/constants/error-code.constant.ts](../src/common/constants/error-code.constant.ts), [src/common/constants/error-message.constant.ts](../src/common/constants/error-message.constant.ts)).
- Keep these wrappers/constants when adding endpoints so clients receive consistent `DataError` / `DataResult` / `DataResults` fields.

## Auth and security flow

- JWT is configured globally in [src/app.module.ts](../src/app.module.ts); route protection uses `JwtGuard` from [src/jwt/jwt.guard.ts](../src/jwt/jwt.guard.ts).
- Guard extracts `Authorization: Bearer <token>`, verifies token, then attaches payload to `request.user` (`RequestWithUser`).
- Protected user endpoints use `@UseGuards(JwtGuard)` in [src/user/user.controller.ts](../src/user/user.controller.ts).
- `AuthService.login()` intentionally includes a 5-second artificial delay before signing token (see [src/auth/auth.service.ts](../src/auth/auth.service.ts)). Do not remove unless task asks for performance change.

## Validation, docs, and DTO usage

- Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) is set in [src/main.ts](../src/main.ts). DTO decorators are enforced strictly.
- DTOs use `class-validator` + Swagger decorators (examples in [src/auth/dto/login.dto.ts](../src/auth/dto/login.dto.ts), [src/user/dto/user.dto.ts](../src/user/dto/user.dto.ts)).
- Swagger docs are enabled at `/api` in [src/main.ts](../src/main.ts). Add `@ApiTags` and `@ApiOperation` for new routes to stay consistent.

## Workflow commands

- Install: `npm install`
- Dev server (watch): `npm run start:dev`
- Debug watch mode: `npm run start:debug`
- Build: `npm run build`
- Lint/fix: `npm run lint`
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`

## Important repository quirks

- Imports commonly use `src/...` absolute paths (enabled by `baseUrl` in [tsconfig.json](../tsconfig.json)). Prefer this style over deep relative paths.
- Existing e2e test expects `GET /` -> `Hello World!` ([test/app.e2e-spec.ts](../test/app.e2e-spec.ts)), but current app is auth/user focused; update tests if you add/remove root routes.
- Project strings/messages include Vietnamese; keep language and tone consistent with existing constants unless explicitly asked to internationalize.
