import { Router } from 'express';
import { getBranches, getDegrees, getPlacementCellForStudentRegister } from '../controllers/public.controller';

const router = Router();

// No auth middleware applied here
router.get('/branches', getBranches);
router.get('/degrees', getDegrees);
router.get('/placement_cells_list', getPlacementCellForStudentRegister)

export default router;