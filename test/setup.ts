// Load test model metadata so direct function calls work
import { setModelMeta } from '../src/helpers'
import { modelsMeta } from '../src/generated/prisma/metadata'

setModelMeta(modelsMeta)