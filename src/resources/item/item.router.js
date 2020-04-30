import { Router } from 'express'

const noop = async (req, res) => {}

const router = Router()

router
  .route('/')
  .get(noop)
  .post(noop)

router
  .route('/:id')
  .get(noop)
  .put(noop)
  .delete(noop)

export default router
