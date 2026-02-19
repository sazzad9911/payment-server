import { Request } from "express";
import {
  deleteFileByUrl,
  generateFileUrl,
} from "../../../helpars/generateFileUrl";
import {
  CustomerType,
  ProductType,
  ProductValidation,
  SaleType,
  SaleUpdateType,
} from "./Product.validation";
import prisma from "../../../shared/prisma";
import {
  customer_listWhereInput,
  productsWhereInput,
  salesWhereInput,
} from "../../../generated/prisma/models";
import ApiError from "../../../errors/ApiErrors";

const parseImages = (images: unknown): string[] => {
  if (!images) return [];

  // already array
  if (Array.isArray(images)) return images;

  // JSON string: '["url1","url2"]'
  if (typeof images === "string" && images.startsWith("[")) {
    try {
      return JSON.parse(images);
    } catch {
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

const addProduct = async (
  payload: ProductType,
  files: Express.Multer.File[],
  req: Request,
  userId: string,
) => {
  return prisma.$transaction(async (tx) => {
    // 1️⃣ Count products (transaction-safe)
    const totalProduct = await tx.products.count({
      where: { userId },
    });

    // 2️⃣ Latest package
    const currentPackage = await tx.package_buyers.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        package: true,
      },
    });

    // 3️⃣ Limit check
    if (!currentPackage) {
      const settings = await tx.settings.findFirst();
      if (!settings) throw new ApiError(404, "Default settings not found");

      if (totalProduct >= settings.free_product_limit) {
        throw new ApiError(
          400,
          "Free product limit exceeded. Please buy a package.",
        );
      }
    } else {
      //check package limit
      if (currentPackage.package.isYearly) {
        const createdAt = new Date(currentPackage.createdAt);
        const expiryDate = new Date(createdAt);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        if (new Date() > expiryDate) {
          throw new ApiError(400, "Your Package has expired!");
        }
      }

      if (totalProduct >= currentPackage.package.product_limit) {
        throw new ApiError(
          400,
          "Package product limit exceeded. Upgrade your package.",
        );
      }
    }

    // 4️⃣ File validation
    if (!files || files.length === 0) {
      throw new ApiError(400, "At least one product image is required");
    }

    const images = files.map((file) => file.path);
    const urls = images.map((path) => generateFileUrl(req, path));

    // 5️⃣ Prepare product
    const product = {
      ...payload,
      images: urls,
      userId,
    };

    // 6️⃣ Validate product
    const data = await ProductValidation.ProductSchema.parseAsync(product);

    // 7️⃣ Create product
    const result = await tx.products.create({ data });

    return result;
  });
};

const updateProduct = async (
  productId: string,
  payload: Partial<ProductType>,
  files: Express.Multer.File[],
  req: Request,
) => {
  // existing product
  const existing = await prisma.products.findUnique({
    where: { id: productId },
  });

  if (!existing) {
    throw new Error("Product not found");
  }

  // new uploaded images
  const newImageUrls = files?.length
    ? files.map((f) => generateFileUrl(req, f.path))
    : [];

  // images user wants to keep (sent from frontend)
  const keepImages = parseImages(payload.images);

  // images to delete
  const imagesToDelete = existing.images.filter(
    (img) => !keepImages.includes(img),
  );

  // delete old files
  imagesToDelete.forEach(deleteFileByUrl);

  const updatedPayload = {
    ...existing,
    ...payload,
    images: [...keepImages, ...newImageUrls],
  };

  const validated =
    await ProductValidation.ProductSchema.partial().parseAsync(updatedPayload);

  return prisma.products.update({
    where: { id: productId },
    data: validated,
  });
};
const deleteProduct = async (productId: string) => {
  const product = await prisma.products.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // delete images from filesystem
  product.images.forEach(deleteFileByUrl);

  // delete DB record
  return prisma.products.delete({
    where: { id: productId },
  });
};
const getProducts = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search || "";

  const skip = (page - 1) * limit;

  const where: productsWhereInput = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.products.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.products.count({ where }),
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
};
const getSingleProduct = async (productId: string) => {
  const result = await prisma.products.findUnique({ where: { id: productId } });
  if (!result) throw new Error("Product not found");
  return result;
};
const addCustomer = async (payload: CustomerType, userId: string) => {
  const result = await prisma.customer_list.create({
    data: {
      ...payload,
      userId: userId,
    },
  });
  return result;
};
const updateCustomer = async (
  payload: Partial<CustomerType>,
  customerId: string,
) => {
  const result = await prisma.customer_list.update({
    where: { id: customerId },
    data: {
      ...payload,
    },
  });
  return result;
};
const deleteCustomer = async (customerId: string) => {
  // optional: check exists
  const exists = await prisma.customer_list.findUnique({
    where: { id: customerId },
  });

  if (!exists) {
    throw new Error("Customer not found");
  }

  return prisma.customer_list.delete({
    where: { id: customerId },
  });
};
const getAllCustomers = async (query: any, userId: string) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search?.trim();

  const skip = (page - 1) * limit;

  const where: customer_listWhereInput = {
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

  const [data, total] = await Promise.all([
    prisma.customer_list.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer_list.count({ where }),
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
};
const createSales = async (payload: SaleType, userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const products = await tx.products.findMany({
      where: {
        id: {
          in: payload.products.map((p) => p.productId),
        },
      },
    });

    if (products.length !== payload.products.length) {
      throw new ApiError(404, "One or more products not found");
    }

    let subtotal = payload.subtotal;
    let tax = payload.tax;

    for (const product of products) {
      const item = payload.products.find((p) => p.productId === product.id);

      if (!item || item.quantity <= 0) {
        throw new ApiError(400, "Invalid product quantity");
      }

      // ✅ Proper stock check
      if (product.isStock && product.stock < item.quantity) {
        throw new ApiError(400, `${product.name} is stock out`);
      }

      subtotal += product.price * item.quantity;
      tax += ((product.tax * product.price) / 100) * item.quantity;

      // ✅ Safe stock decrement
      if (product.isStock) {
        await tx.products.update({
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

    const result = await tx.sales.create({
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
  });
};

const updateSale = async (id: string, payload: SaleUpdateType) => {
  const result = await prisma.sales.update({
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
};
const getSales = async (query: any, userId: string) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const due = query?.due === "true";
  const skip = (page - 1) * limit;
  const customerId = query?.customerId;
  const where: salesWhereInput = { userId };
  if (due) {
    where.due = {
      gt: 0,
    };
  }
  if (customerId) {
    where.customerId = customerId;
  }

  const [data, total] = await Promise.all([
    prisma.sales.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { salesItems: true, customer: true },
    }),
    prisma.sales.count({ where }),
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
};
const toggleStockProduct = async (productId: string, userId: string) => {
  const product = await prisma.products.findUnique({
    where: { id: productId, userId: userId },
  });
  if (!product) throw new ApiError(404, "Product not found!");
  const result = await prisma.products.update({
    where: { id: product.id },
    data: { isStock: !product.isStock },
  });
  return result;
};
const deleteSale = async (id: string, userId: string) => {
  const sale = await prisma.sales.findUnique({
    where: { id: id, userId: userId },
  });
  if (!sale) {
    throw new ApiError(404, "Sale not found!");
  }
  const updateSale = await prisma.sales.delete({
    where: { id },
  });
  return updateSale;
};
const getUserSales = async (userId: string) => {
  const customers = await prisma.customer_list.findMany({
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
    return { ...doc, sales: { total, due, paid } };
  });
  return result;
};
export const ProductService = {
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
