import {
    getCreditByUserService
    , addCreditService
    , deductCreditService
    , getTransactionsByUserService
    , createTransactionService
    , getTransactionsService
    , getCreditByIdService
} from "../services/creditService.js";
import { ApiError } from "../errors/ApiError.js";


const getCreditByUser = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            throw new ApiError("Invalid user ID", 400);
        }

        // Only allow access if admin or the user themselves
        if (req.user.role !== "admin" && req.user.id !== userId) {
            throw new ApiError("Forbidden: insufficient rights", 403);
        }

        const creditBalance = await getCreditByUserService(userId);

        res.json({ userId, balance: creditBalance });
    } catch (err) {
        next(err);
    }
};

const addCredit = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        // Validate input
        if (!amount || amount <= 0) {
            throw new ApiError("Invalid amount", 400);
        }

        const credit = await addCreditService({ userId: parseInt(userId), amount });

        res.status(200).json({ message: "Credit added successfully", credit });
    } catch (err) {
        next(err);
    }
};

const deductCredit = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            throw new ApiError("Amount must be a positive number", 400);
        }

        const updatedCredit = await deductCreditService({ userId: Number(userId), amount });

        res.status(200).json(updatedCredit);
    } catch (err) {
        next(err);
    }
};

const getTransactionsByUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { type, page = 1, limit = 10 } = req.query;

        // Normal user can only access their own transactions
        if (req.user.role !== "admin" && req.user.id !== Number(userId)) {
            throw new ApiError("Forbidden: insufficient rights", 403);
        }

        const transactions = await getTransactionsByUserService({
            userId: Number(userId),
            type,
            page: Number(page),
            limit: Number(limit),
        });

        res.status(200).json(transactions);
    } catch (err) {
        next(err);
    }
};

const createTransaction = async (req, res, next) => {
    try {
        const { userId, amount, type } = req.body;

        if (!userId || !amount || !type) {
            throw new ApiError("Missing required fields: userId, amount, type", 400);
        }

        if (!["CREDIT", "REFUND"].includes(type.toUpperCase())) {
            throw new ApiError("Invalid transaction type. Must be CREDIT or REFUND", 400);
        }

        const transaction = await createTransactionService({ userId, amount, type: type.toUpperCase() });

        res.status(201).json(transaction);
    } catch (err) {
        next(err);
    }
};

const getTransactions = async (req, res, next) => {
    try {
        const { type, page = 1, limit = 10 } = req.query;

        const transactions = await getTransactionsService({
            page: Number(page),
            limit: Number(limit),
            type
        });

        res.json(transactions);
    } catch (err) {
        next(err);
    }
};

const getCreditById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const transaction = await getCreditByIdService({ id, user });

        res.json(transaction);
    } catch (err) {
        next(err);
    }
};

export {
    getCreditByUser
    , addCredit
    , deductCredit
    , getTransactionsByUser
    , createTransaction
    , getTransactions
    , getCreditById
};
