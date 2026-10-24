import { Router } from 'express'
import { create, getByCode, list } from '../controllers/roomController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

router.use(requireAuth)

router.post('/', create)
router.get('/', list)
router.get('/:code', getByCode)

export default router
