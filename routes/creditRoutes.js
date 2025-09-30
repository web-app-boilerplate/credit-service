import express from "express";
import {
    getCreditByUser
    , addCredit
    , deductCredit
    , getTransactionsByUser
    , createTransaction
    , getTransactions
    , getCreditById
} from "../controllers/creditController.js";
import { verifyToken } from "../middlewares/jwtMiddleware.js";
import authorizeRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

//  Get credit info for a specific user 
router.route('/user/:userId').get(verifyToken, authorizeRole(["admin", "user"]), getCreditByUser);
//  Add credit to a user’s account 
router.route('/user/:userId/add').post(verifyToken, authorizeRole(["service"]), addCredit);
//  Deduct credit from a user’s account 
//TODO REMOVE USER ROLE ONCE STRIPE ADDED
router.route('/user/:userId/deduct').post(verifyToken, authorizeRole(["admin", "user"]), deductCredit);

//  Get all credit transactions for a user 
router.route('/transactions/user/:userId').get(verifyToken, authorizeRole(["admin", "user"]), getTransactionsByUser);
//  Create a manual transaction (top-up/refund) 
router.route('/transactions').post(verifyToken, authorizeRole(["admin"]), createTransaction);
//  Get all credit transactions (paginated) 
router.route('/transactions').get(verifyToken, authorizeRole(["admin"]), getTransactions);

//  Get a specific credit transaction by ID 
router.route('/:id').get(verifyToken, authorizeRole(["admin", "user"]), getCreditById);


export default router;
