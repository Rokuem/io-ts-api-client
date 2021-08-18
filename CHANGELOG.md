# 0.15.0
- Fix audit issues.
- Use webpack and mark peerDependencies as externals.
- Update install script in README.md

# 0.14.1
- Fix payloadConstructor missing from Operation options. (thanks @AlgisSulcas)
- use sideEffects: false in package.json

# 0.14.0
- t.schema will now accept optional attributes values as either null or undefined.

# 0.13.0
- It is now possible to ignore mocks by returning Promise.resolve(false).
- Fixed strictTypes response

# 0.12.0
- It is now possible to declare global headers.
- Headers can now be either a function or an object.

# 0.11.0
- Added sample operations to the Model class (createSample, extendSample)
- Improved docs for mocks

# 0.10.0
- Allow Client.base to be a function.
- Allow Client.debug to be a function.
- Allow Client.strictTypes to be a function.
- Allow Client.throwErrors to be a function.