import { PrismaClient } from "@prisma/client";
import logger from "../utils/logger.js";
import { ApiError } from "../errors/ApiError.js";

const prisma = new PrismaClient();

const getCreditByUserService = async (userId) => {
    const credit = await prisma.credit.findUnique({
        where: { userId },
    });

    return credit ? credit.balance : 0;
};

const addCreditService = async ({ userId, amount }) => {
    // Check if user's credit account exists
    let credit = await prisma.credit.findUnique({ where: { userId } });

    if (!credit) {
        // Create a new credit account with initial balance
        credit = await prisma.credit.create({
            data: {
                userId,
                balance: amount,
            },
        });

        // Create initial transaction record
        await prisma.creditTransaction.create({
            data: {
                creditId: credit.id,
                type: "CREDIT",
                amount,
            },
        });

        return credit;
    }

    // Update balance if credit account exists
    const updatedCredit = await prisma.credit.update({
        where: { userId },
        data: { balance: credit.balance + amount },
    });

    // Create transaction record
    await prisma.creditTransaction.create({
        data: {
            creditId: updatedCredit.id,
            type: "CREDIT",
            amount,
        },
    });

    return updatedCredit;
};

const deductCreditService = async ({ userId, amount }) => {
    // Find the user's credit account
    const credit = await prisma.credit.findUnique({ where: { userId } });

    if (!credit) {
        throw new ApiError("Credit account not found for this user", 404);
    }

    if (credit.balance < amount) {
        throw new ApiError("Insufficient credit balance", 400);
    }

    // Deduct the amount
    const updatedCredit = await prisma.credit.update({
        where: { userId },
        data: { balance: credit.balance - amount },
    });

    // Create DEBIT transaction
    await prisma.creditTransaction.create({
        data: {
            creditId: updatedCredit.id,
            type: "DEBIT",
            amount,
        },
    });

    return updatedCredit;
};

const getTransactionsByUserService = async ({ userId, type, page, limit }) => {
    const where = { creditId: undefined }; // will set dynamically below

    // First, get the user's credit account
    const credit = await prisma.credit.findUnique({ where: { userId } });
    if (!credit) {
        throw new ApiError("Credit account not found for this user", 404);
    }

    // Filter by creditId (relation) and optional type
    where.creditId = credit.id;
    if (type) {
        where.type = type.toUpperCase();
    }

    const transactions = await prisma.creditTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });

    return transactions;
};

const createTransactionService = async ({ userId, amount, type }) => {
    // Get or create user's credit account
    let credit = await prisma.credit.findUnique({ where: { userId } });
    if (!credit) {
        credit = await prisma.credit.create({
            data: { userId, balance: 0 },
        });
    }

    // Update balance based on transaction type
    let newBalance;
    if (type === "CREDIT") {
        newBalance = credit.balance + amount;
    } else if (type === "REFUND") {
        newBalance = credit.balance - amount;
        if (newBalance < 0) {
            throw new ApiError("Insufficient balance for refund", 400);
        }
    } else {
        throw new ApiError("Invalid transaction type. Must be CREDIT or REFUND", 400);
    }

    const updatedCredit = await prisma.credit.update({
        where: { userId },
        data: { balance: newBalance },
    });

    // Create transaction record
    const transaction = await prisma.creditTransaction.create({
        data: {
            creditId: updatedCredit.id,
            amount,
            type,
        },
    });

    return transaction;
};


const getTransactionsService = async ({ page = 1, limit = 20, type }) => {
    const skip = (page - 1) * limit;
    const where = {}
    if (type) {
        where.type = type.toUpperCase();
    }

    const [totalCount, transactions] = await Promise.all([
        prisma.creditTransaction.count(),
        prisma.creditTransaction.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
    ]);

    return {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        transactions,
    };
};

const getCreditByIdService = async ({ id, user }) => {
    const transaction = await prisma.creditTransaction.findUnique({
        where: { id: parseInt(id) },
    });

    if (!transaction) {
        throw new ApiError("Transaction not found", 404);
    }

    // Role check: if user is not admin, ensure they own the transaction
    if (user.role !== "admin" && transaction.userId !== user.id) {
        throw new ApiError("Forbidden: insufficient rights", 403);
    }

    return transaction;
};

export {
    getCreditByUserService
    , addCreditService
    , deductCreditService
    , getTransactionsByUserService
    , createTransactionService
    , getTransactionsService
    , getCreditByIdService
}