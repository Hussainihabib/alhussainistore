import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";


const slugify = (text) => {
  return `${text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Date.now()
    .toString()
    .slice(-5)}`;
};


// ===============================
// GET ALL PRODUCTS
// ===============================

export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      categoryName,
      minPrice,
      maxPrice,
      size,
      color,
      inStock,
      sort = "newest",
      featured,
      bestSeller,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {
      isActive: true
    };


    // Search
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i"
          }
        },
        {
          tags: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }


    // Category by ID
    if (category) {
      filter.category = category;
    }


    // Category by Name
    if (categoryName) {
      const categoryDoc = await Category.findOne({
        name: {
          $regex: `^${categoryName}$`,
          $options: "i"
        },
        isActive: true
      });

      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        return res.json({
          products: [],
          total: 0,
          page: Number(page),
          pages: 0
        });
      }
    }


    // Price Filter
    if (minPrice || maxPrice) {
      filter.sellingPrice = {};

      if (minPrice) {
        filter.sellingPrice.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.sellingPrice.$lte = Number(maxPrice);
      }
    }


    // Featured
    if (featured === "true") {
      filter.isFeatured = true;
    }


    // Best Seller
    if (bestSeller === "true") {
      filter.isBestSeller = true;
    }


    // Size / Color / In Stock — supports comma-separated multi-select,
    // matched against the product's variants array. Combined into a single
    // $elemMatch so "size X AND color Y AND stock>0" refers to the same
    // variant, not three independent array conditions.
    if (size || color || inStock === "true") {
      const variantMatch = {};
      if (size) variantMatch.size = { $in: String(size).split(",").map(s => s.trim()).filter(Boolean) };
      if (color) variantMatch.color = { $in: String(color).split(",").map(c => c.trim()).filter(Boolean) };
      if (inStock === "true") variantMatch.stock = { $gt: 0 };
      filter.variants = { $elemMatch: variantMatch };
    }


    // Sorting
    const sorts = {
      "price-asc": {
        sellingPrice: 1
      },

      "price-desc": {
        sellingPrice: -1
      },

      newest: {
        createdAt: -1
      },

      rating: {
        rating: -1
      },

      sold: {
        totalSold: -1
      }
    };


    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 20);

    const skip =
      (pageNumber - 1) *
      limitNumber;


    const [products, total] =
      await Promise.all([

        Product.find(filter)
          .populate("category")
          .sort(
            sorts[sort] ||
            sorts.newest
          )
          .skip(skip)
          .limit(limitNumber),

        Product.countDocuments(filter)

      ]);


    res.json({
      products,
      total,
      page: pageNumber,
      pages: Math.ceil(
        total / limitNumber
      )
    });

  } catch (error) {

    console.error(
      "Get Products Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load products"
    });
  }
};


// ===============================
// GET SINGLE PRODUCT
// BY MONGODB ID OR SLUG
// ===============================

export const getProduct = async (req, res) => {
  try {

    const { id } = req.params;

    let product = null;


    // Search by MongoDB ID
    // ONLY if valid ObjectId

    if (
      mongoose.Types.ObjectId.isValid(id)
    ) {

      product =
        await Product.findOne({
          _id: id,
          isActive: true
        })
          .populate(
            "category subcategory"
          );

    }


    // Search by slug

    if (!product) {

      product =
        await Product.findOne({
          slug: id,
          isActive: true
        })
          .populate(
            "category subcategory"
          );

    }


    if (!product) {

      return res.status(404).json({
        message:
          "Product not found"
      });

    }


    res.json(product);

  } catch (error) {

    console.error(
      "Get Product Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load product"
    });

  }
};


// ===============================
// CREATE PRODUCT
// ===============================

export const createProduct =
  async (req, res) => {

    try {

      const data = {
        ...req.body
      };


      data.slug =
        data.slug ||
        slugify(data.name);


      if (
        typeof data.variants ===
        "string"
      ) {

        data.variants =
          JSON.parse(
            data.variants
          );

      }


      if (
        typeof data.images ===
        "string"
      ) {

        data.images =
          JSON.parse(
            data.images
          );

      }


      const product =
        await Product.create(
          data
        );


      res.status(201).json(
        product
      );

    } catch (error) {

      console.error(
        "Create Product Error:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Failed to create product"
      });

    }

  };


// ===============================
// UPDATE PRODUCT
// ===============================

export const updateProduct =
  async (req, res) => {

    try {

      const data = {
        ...req.body
      };


      if (
        typeof data.variants ===
        "string"
      ) {

        data.variants =
          JSON.parse(
            data.variants
          );

      }


      if (
        typeof data.images ===
        "string"
      ) {

        data.images =
          JSON.parse(
            data.images
          );

      }


      // Update slug if name changed

      if (data.name) {

        data.slug =
          slugify(
            data.name
          );

      }


      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          data,
          {
            new: true,
            runValidators: true
          }
        );


      if (!product) {

        return res.status(404).json({
          message:
            "Product not found"
        });

      }


      res.json(product);

    } catch (error) {

      console.error(
        "Update Product Error:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Failed to update product"
      });

    }

  };


// ===============================
// DELETE PRODUCT
// ===============================

export const deleteProduct =
  async (req, res) => {

    try {

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid product ID"
        });

      }


      const product =
        await Product.findByIdAndDelete(
          req.params.id
        );


      if (!product) {

        return res.status(404).json({
          message:
            "Product not found"
        });

      }


      res.json({
        message:
          "Product deleted"
      });

    } catch (error) {

      console.error(
        "Delete Product Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete product"
      });

    }

  };


// ===============================
// GET RELATED PRODUCTS
// Same category, active, excluding current
// ===============================

export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(8, Math.max(4, Number(req.query.limit) || 8));

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findOne({ _id: id, isActive: true });
    }
    if (!product) {
      product = await Product.findOne({ slug: id, isActive: true });
    }
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    })
      .sort({ isBestSeller: -1, totalSold: -1, createdAt: -1 })
      .limit(limit)
      .populate("category");

    res.json(related);
  } catch (error) {
    console.error("Get Related Products Error:", error);
    res.status(500).json({ message: "Failed to load related products" });
  }
};


// ===============================
// GET CATEGORIES
// ===============================

export const getCategories =
  async (req, res) => {

    try {

      const categories =
        await Category.find({
          isActive: true
        })
          .sort({
            sortOrder: 1,
            name: 1
          });


      res.json(categories);

    } catch (error) {

      console.error(
        "Get Categories Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load categories"
      });

    }

  };


// ===============================
// CREATE CATEGORY
// ===============================

export const createCategory =
  async (req, res) => {

    try {

      const slug =
        req.body.slug ||
        req.body.name
          .toLowerCase()
          .trim()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /(^-|-$)/g,
            ""
          );


      const category =
        await Category.create({

          ...req.body,

          slug

        });


      res
        .status(201)
        .json(category);

    } catch (error) {

      console.error(
        "Create Category Error:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Failed to create category"
      });

    }

  };


// ===============================
// UPDATE CATEGORY
// ===============================

export const updateCategory =
  async (req, res) => {

    try {

      const category =
        await Category.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true
          }
        );


      if (!category) {

        return res.status(404).json({
          message:
            "Category not found"
        });

      }


      res.json(category);

    } catch (error) {

      console.error(
        "Update Category Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update category"
      });

    }

  };


// ===============================
// DELETE CATEGORY
// ===============================

export const deleteCategory =
  async (req, res) => {

    try {

      const category =
        await Category.findByIdAndDelete(
          req.params.id
        );


      if (!category) {

        return res.status(404).json({
          message:
            "Category not found"
        });

      }


      res.json({
        message:
          "Category deleted"
      });

    } catch (error) {

      console.error(
        "Delete Category Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete category"
      });

    }

  };