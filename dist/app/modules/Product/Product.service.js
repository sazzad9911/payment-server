"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const generateFileUrl_1 = require("../../../helpars/generateFileUrl");
const Product_validation_1 = require("./Product.validation");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const parseImages = (images) => {
    if (!images)
        return [];
    // already array
    if (Array.isArray(images))
        return images;
    // JSON string: '["url1","url2"]'
    if (typeof images === "string" && images.startsWith("[")) {
        try {
            return JSON.parse(images);
        }
        catch (_a) {
            return [];
        }
    }
    // comma separated: "url1,url2"
    if (typeof images === "string") {
        return images
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean);
    }
    return [];
};
const addProduct = (payload, files, req, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // 1️⃣ Count products (transaction-safe)
        const totalProduct = yield tx.products.count({
            where: { userId },
        });
        // 2️⃣ Latest package
        const currentPackage = yield tx.package_buyers.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                package: true,
            },
        });
        // 3️⃣ Limit check
        if (!currentPackage) {
            const settings = yield tx.settings.findFirst();
            if (!settings)
                throw new ApiErrors_1.default(404, "Default settings not found");
            if (totalProduct >= settings.free_product_limit) {
                throw new ApiErrors_1.default(400, "Free product limit exceeded. Please buy a package.");
            }
        }
        else {
            //check package limit
            if (currentPackage.package.isYearly) {
                const createdAt = new Date(currentPackage.createdAt);
                const expiryDate = new Date(createdAt);
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                if (new Date() > expiryDate) {
                    throw new ApiErrors_1.default(400, "Your Package has expired!");
                }
            }
            if (totalProduct >= currentPackage.package.product_limit) {
                throw new ApiErrors_1.default(400, "Package product limit exceeded. Upgrade your package.");
            }
        }
        // 4️⃣ File validation
        if (!files || files.length === 0) {
            throw new ApiErrors_1.default(400, "At least one product image is required");
        }
        const images = files.map((file) => file.path);
        const urls = images.map((path) => (0, generateFileUrl_1.generateFileUrl)(req, path));
        // 5️⃣ Prepare product
        const product = Object.assign(Object.assign({}, payload), { images: urls, userId });
        // 6️⃣ Validate product
        const data = yield Product_validation_1.ProductValidation.ProductSchema.parseAsync(product);
        // 7️⃣ Create product
        const result = yield tx.products.create({ data });
        return result;
    }));
});
const updateProduct = (productId, payload, files, req) => __awaiter(void 0, void 0, void 0, function* () {
    // existing product
    const existing = yield prisma_1.default.products.findUnique({
        where: { id: productId },
    });
    if (!existing) {
        throw new Error("Product not found");
    }
    // new uploaded images
    const newImageUrls = (files === null || files === void 0 ? void 0 : files.length)
        ? files.map((f) => (0, generateFileUrl_1.generateFileUrl)(req, f.path))
        : [];
    // images user wants to keep (sent from frontend)
    const keepImages = parseImages(payload.images);
    // images to delete
    const imagesToDelete = existing.images.filter((img) => !keepImages.includes(img));
    // delete old files
    imagesToDelete.forEach(generateFileUrl_1.deleteFileByUrl);
    const updatedPayload = Object.assign(Object.assign(Object.assign({}, existing), payload), { images: [...keepImages, ...newImageUrls] });
    const validated = yield Product_validation_1.ProductValidation.ProductSchema.partial().parseAsync(updatedPayload);
    return prisma_1.default.products.update({
        where: { id: productId },
        data: validated,
    });
});
const deleteProduct = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield prisma_1.default.products.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw new Error("Product not found");
    }
    // delete images from filesystem
    product.images.forEach(generateFileUrl_1.deleteFileByUrl);
    // delete DB record
    return prisma_1.default.products.delete({
        where: { id: productId },
    });
});
const getProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search || "";
    const skip = (page - 1) * limit;
    const where = search
        ? {
            name: {
                contains: search,
                mode: "insensitive",
            },
        }
        : {};
    const [data, total] = yield Promise.all([
        prisma_1.default.products.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.products.count({ where }),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data,
    };
});
const getSingleProduct = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.products.findUnique({ where: { id: productId } });
    if (!result)
        throw new Error("Product not found");
    return result;
});
const addCustomer = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.customer_list.create({
        data: Object.assign(Object.assign({}, payload), { userId: userId }),
    });
    return result;
});
const updateCustomer = (payload, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.customer_list.update({
        where: { id: customerId },
        data: Object.assign({}, payload),
    });
    return result;
});
const deleteCustomer = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    // optional: check exists
    const exists = yield prisma_1.default.customer_list.findUnique({
        where: { id: customerId },
    });
    if (!exists) {
        throw new Error("Customer not found");
    }
    return prisma_1.default.customer_list.delete({
        where: { id: customerId },
    });
});
const getAllCustomers = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = (_a = query.search) === null || _a === void 0 ? void 0 : _a.trim();
    const skip = (page - 1) * limit;
    const where = {
        userId,
    };
    if (search) {
        where.OR = [
            {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                phone: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                email: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }
    const [data, total] = yield Promise.all([
        prisma_1.default.customer_list.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.customer_list.count({ where }),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data,
    };
});
const createSales = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const products = yield tx.products.findMany({
            where: {
                id: {
                    in: payload.products.map((p) => p.productId),
                },
            },
        });
        if (products.length !== payload.products.length) {
            throw new ApiErrors_1.default(404, "One or more products not found");
        }
        let subtotal = payload.subtotal;
        let tax = payload.tax;
        for (const product of products) {
            const item = payload.products.find((p) => p.productId === product.id);
            if (!item || item.quantity <= 0) {
                throw new ApiErrors_1.default(400, "Invalid product quantity");
            }
            // ✅ Proper stock check
            if (product.isStock && product.stock < item.quantity) {
                throw new ApiErrors_1.default(400, `${product.name} is stock out`);
            }
            subtotal += product.price * item.quantity;
            tax += ((product.tax * product.price) / 100) * item.quantity;
            // ✅ Safe stock decrement
            if (product.isStock) {
                yield tx.products.update({
                    where: { id: product.id },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }
        }
        const total = subtotal + tax - (payload.discount || 0);
        const result = yield tx.sales.create({
            data: {
                due: payload.due,
                paid: payload.paid,
                userId,
                subtotal,
                tax,
                total,
                customerId: payload.customerId,
                discount: payload.discount || 0,
                salesItems: {
                    createMany: {
                        data: payload.products.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                        })),
                    },
                },
            },
            include: {
                salesItems: true,
            },
        });
        return result;
    }));
});
const updateSale = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.sales.update({
        where: { id },
        data: {
            due: payload.due,
            paid: payload.paid,
        },
        include: {
            salesItems: true,
        },
    });
    return result;
});
const getSales = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const due = (query === null || query === void 0 ? void 0 : query.due) === "true";
    const skip = (page - 1) * limit;
    const customerId = query === null || query === void 0 ? void 0 : query.customerId;
    const where = { userId };
    if (due) {
        where.due = {
            gt: 0,
        };
    }
    if (customerId) {
        where.customerId = customerId;
    }
    const [data, total] = yield Promise.all([
        prisma_1.default.sales.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { salesItems: true, customer: true },
        }),
        prisma_1.default.sales.count({ where }),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data,
    };
});
const toggleStockProduct = (productId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield prisma_1.default.products.findUnique({
        where: { id: productId, userId: userId },
    });
    if (!product)
        throw new ApiErrors_1.default(404, "Product not found!");
    const result = yield prisma_1.default.products.update({
        where: { id: product.id },
        data: { isStock: !product.isStock },
    });
    return result;
});
const deleteSale = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const sale = yield prisma_1.default.sales.findUnique({
        where: { id: id, userId: userId },
    });
    if (!sale) {
        throw new ApiErrors_1.default(404, "Sale not found!");
    }
    const updateSale = yield prisma_1.default.sales.delete({
        where: { id },
    });
    return updateSale;
});
const getUserSales = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const customers = yield prisma_1.default.customer_list.findMany({
        where: { userId: userId },
        include: {
            sales: true,
        },
        orderBy: {
            sales: {
                _count: "desc",
            },
        },
    });
    const result = customers.map((doc) => {
        const total = doc.sales.reduce((acc, d) => acc + d.total, 0);
        const due = doc.sales.reduce((acc, d) => acc + d.due, 0);
        const paid = doc.sales.reduce((acc, d) => acc + d.paid, 0);
        return Object.assign(Object.assign({}, doc), { sales: { total, due, paid } });
    });
    return result;
});
exports.ProductService = {
    addProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getSingleProduct,
    getAllCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    createSales,
    updateSale,
    getSales,
    toggleStockProduct,
    deleteSale,
    getUserSales,
};
