import { useEffect, useState } from "react";
import api from "../api";

const makeEmpty = () => ({
  name: "",
  sellingPrice: "",
  purchaseCost: "",
  category: "",
  description: "",
  variants: [
    {
      size: "",
      color: "Default",
      stock: 0,
    },
  ],
  images: [],
  isFeatured: false,
  isBestSeller: false,
});

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(makeEmpty());
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");

      const [productsResponse, categoriesResponse] =
        await Promise.all([
          api.get("/products?limit=100"),
          api.get("/categories"),
        ]);

      setProducts(
        Array.isArray(productsResponse.data?.products)
          ? productsResponse.data.products
          : Array.isArray(productsResponse.data)
          ? productsResponse.data
          : []
      );

      setCats(
        Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : Array.isArray(categoriesResponse.data?.categories)
          ? categoriesResponse.data.categories
          : []
      );
    } catch (err) {
      console.error("Load products error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load products."
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateForm = (patch) => {
    setForm((previous) => ({
      ...previous,
      ...patch,
    }));
  };

  const uploadImages = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setBusy(true);
    setError("");

    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await api.post(
        "/upload/images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedImages = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.images)
        ? response.data.images
        : [];

      setForm((previous) => ({
        ...previous,
        images: [
          ...previous.images,
          ...uploadedImages.map((image, index) => ({
            ...image,
            isCover:
              previous.images.length === 0 &&
              index === 0,
          })),
        ],
      }));
    } catch (err) {
      console.error("Image upload error:", err);

      setError(
        err?.response?.data?.message ||
          "Image upload failed."
      );
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    setBusy(true);
    setError("");

    try {
      const payload = {
        ...form,

        sellingPrice: Number(form.sellingPrice),

        purchaseCost:
          Number(form.purchaseCost) || 0,

        variants: form.variants.map(
          (variant) => ({
            ...variant,
            stock:
              Number(variant.stock) || 0,
          })
        ),
      };

      if (editingId) {
        await api.patch(
          `/products/${editingId}`,
          payload
        );
      } else {
        await api.post(
          "/products",
          payload
        );
      }

      setForm(makeEmpty());
      setEditingId(null);

      await load();
    } catch (err) {
      console.error(
        "Save product error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save product."
      );
    } finally {
      setBusy(false);
    }
  };

  const editProduct = (product) => {
    setEditingId(product._id);

    setForm({
      name: product.name || "",

      sellingPrice:
        product.sellingPrice ?? "",

      purchaseCost:
        product.purchaseCost ?? "",

      category:
        product.category?._id ||
        product.category ||
        "",

      description:
        product.description || "",

      variants:
        Array.isArray(product.variants) &&
        product.variants.length > 0
          ? product.variants.map(
              (variant) => ({
                size:
                  variant.size || "",

                color:
                  variant.color ||
                  "Default",

                stock:
                  Number(
                    variant.stock
                  ) || 0,
              })
            )
          : [
              {
                size: "",
                color: "Default",
                stock: 0,
              },
            ],

      images: Array.isArray(
        product.images
      )
        ? product.images
        : [],

      isFeatured:
        Boolean(
          product.isFeatured
        ),

      isBestSeller:
        Boolean(
          product.isBestSeller
        ),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(makeEmpty());
    setError("");
  };

  const removeImage = (index) => {
    setForm((previous) => {
      const newImages =
        previous.images.filter(
          (_, imageIndex) =>
            imageIndex !== index
        );

      return {
        ...previous,

        images: newImages.map(
          (image, imageIndex) => ({
            ...image,
            isCover:
              imageIndex === 0,
          })
        ),
      };
    });
  };

  const addVariant = () => {
    updateForm({
      variants: [
        ...form.variants,
        {
          size: "",
          color: "Default",
          stock: 0,
        },
      ],
    });
  };

  const updateVariant = (
    index,
    field,
    value
  ) => {
    updateForm({
      variants: form.variants.map(
        (variant, variantIndex) =>
          variantIndex === index
            ? {
                ...variant,
                [field]: value,
              }
            : variant
      ),
    });
  };

  const removeVariant = (index) => {
    if (form.variants.length === 1) {
      return;
    }

    updateForm({
      variants: form.variants.filter(
        (_, variantIndex) =>
          variantIndex !== index
      ),
    });
  };

  const deleteProduct = async (id) => {
    const confirmed =
      window.confirm(
        "Delete this product permanently?"
      );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(
        `/products/${id}`
      );

      await load();
    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete product."
      );
    }
  };

  const getTotalStock = (product) => {
    if (
      typeof product.totalStock ===
      "number"
    ) {
      return product.totalStock;
    }

    if (!Array.isArray(product.variants)) {
      return 0;
    }

    return product.variants.reduce(
      (total, variant) =>
        total +
        (Number(variant.stock) || 0),
      0
    );
  };

  return (
    <div className="w-full max-w-full">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">

          <h1 className="text-2xl sm:text-3xl font-serif break-words">
            PRODUCT MANAGEMENT
          </h1>

          <p className="text-sm text-stone-500 mt-1">
            Create, edit, manage images and
            size/color stock.
          </p>

        </div>

        {editingId && (
          <button
            type="button"
            className="btn border w-full sm:w-auto"
            onClick={cancelEdit}
          >
            CANCEL EDIT
          </button>
        )}

      </div>


      {/* ERROR */}

      {error && (
        <div className="mt-4 p-3 rounded-lg border border-red-200 text-red-600 text-sm break-words">
          {error}
        </div>
      )}


      {/* PRODUCT FORM */}

      <form
        onSubmit={saveProduct}
        className="card p-4 sm:p-5 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
      >

        {/* PRODUCT NAME */}

        <div className="w-full">

          <label className="text-sm font-medium mb-1 block">
            Product Name
          </label>

          <input
            className="field w-full"
            required
            placeholder="Product Name"
            value={form.name}
            onChange={(event) =>
              updateForm({
                name:
                  event.target.value,
              })
            }
          />

        </div>


        {/* SELLING PRICE */}

        <div className="w-full">

          <label className="text-sm font-medium mb-1 block">
            Selling Price
          </label>

          <input
            className="field w-full"
            required
            type="number"
            min="0"
            placeholder="Selling Price"
            value={form.sellingPrice}
            onChange={(event) =>
              updateForm({
                sellingPrice:
                  event.target.value,
              })
            }
          />

        </div>


        {/* PURCHASE COST */}

        <div className="w-full">

          <label className="text-sm font-medium mb-1 block">
            Purchase Cost
          </label>

          <input
            className="field w-full"
            type="number"
            min="0"
            placeholder="Purchase Cost"
            value={form.purchaseCost}
            onChange={(event) =>
              updateForm({
                purchaseCost:
                  event.target.value,
              })
            }
          />

        </div>


        {/* CATEGORY */}

        <div className="w-full">

          <label className="text-sm font-medium mb-1 block">
            Category
          </label>

          <select
            className="field w-full"
            required
            value={form.category}
            onChange={(event) =>
              updateForm({
                category:
                  event.target.value,
              })
            }
          >

            <option value="">
              Select Category
            </option>

            {cats.map(
              (category) => (
                <option
                  value={category._id}
                  key={category._id}
                >
                  {category.name}
                </option>
              )
            )}

          </select>

        </div>


        {/* DESCRIPTION */}

        <div className="md:col-span-2 w-full">

          <label className="text-sm font-medium mb-1 block">
            Description
          </label>

          <textarea
            className="field w-full min-h-[120px] resize-y"
            placeholder="Description"
            value={form.description}
            onChange={(event) =>
              updateForm({
                description:
                  event.target.value,
              })
            }
          />

        </div>


        {/* CHECKBOXES */}

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">

          <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer">

            <input
              type="checkbox"
              checked={
                form.isFeatured
              }
              onChange={(event) =>
                updateForm({
                  isFeatured:
                    event.target.checked,
                })
              }
            />

            <div>
              <b className="text-sm">
                Featured Product
              </b>

              <p className="text-xs text-stone-500">
                Show product in featured section
              </p>
            </div>

          </label>


          <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer">

            <input
              type="checkbox"
              checked={
                form.isBestSeller
              }
              onChange={(event) =>
                updateForm({
                  isBestSeller:
                    event.target.checked,
                })
              }
            />

            <div>
              <b className="text-sm">
                Best Seller
              </b>

              <p className="text-xs text-stone-500">
                Mark this product as best seller
              </p>
            </div>

          </label>

        </div>


        {/* PRODUCT IMAGES */}

        <div className="md:col-span-2 w-full">

          <div className="flex flex-col gap-1 mb-3">

            <b className="text-base">
              Product Images
            </b>

            <span className="text-xs text-stone-500">
              Select one or multiple images
            </span>

          </div>


          <label className="block border-2 border-dashed rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-stone-50 transition text-center">

            <span className="text-sm font-medium block">
              Click to select images
            </span>

            <span className="text-xs text-stone-500 mt-1 block">
              JPG, PNG, WEBP and other image formats
            </span>

            <input
              className="hidden"
              type="file"
              multiple
              accept="image/*"
              onChange={
                uploadImages
              }
            />

          </label>


          {busy && (
            <p className="text-sm mt-3 text-stone-500">
              Uploading / saving...
            </p>
          )}


          {/* IMAGE PREVIEW */}

          {form.images.length > 0 && (

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">

              {form.images.map(
                (image, index) => (

                  <div
                    key={
                      image.publicId ||
                      image.url ||
                      index
                    }
                    className="relative aspect-[4/5] rounded-xl overflow-hidden border bg-stone-100"
                  >

                    <img
                      className="w-full h-full object-cover"
                      src={image.url}
                      alt="Product"
                    />

                    {image.isCover && (
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-white px-2 py-1 rounded">
                        COVER
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          index
                        )
                      }
                      className="absolute top-1 right-1 rounded-full bg-white shadow border w-8 h-8 flex items-center justify-center text-red-600 font-bold"
                      aria-label="Remove image"
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* VARIANTS */}

        <div className="md:col-span-2 w-full">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">

            <div>

              <b className="text-base">
                Variants / Size / Color / Stock
              </b>

              <p className="text-xs text-stone-500 mt-1">
                Add different sizes and colors with individual stock.
              </p>

            </div>

          </div>


          <div className="grid gap-3">

            {form.variants.map(
              (variant, index) => (

                <div
                  className="border rounded-xl p-3 sm:p-4"
                  key={index}
                >

                  <div className="flex items-center justify-between mb-3">

                    <b className="text-sm">
                      Variant {index + 1}
                    </b>

                    <button
                      type="button"
                      className="text-red-600 text-sm font-medium disabled:opacity-40"
                      disabled={
                        form.variants.length ===
                        1
                      }
                      onClick={() =>
                        removeVariant(
                          index
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>


                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    <div>

                      <label className="text-xs text-stone-500 mb-1 block">
                        Size
                      </label>

                      <input
                        className="field w-full"
                        required
                        placeholder="e.g. Small"
                        value={
                          variant.size
                        }
                        onChange={(
                          event
                        ) =>
                          updateVariant(
                            index,
                            "size",
                            event.target
                              .value
                          )
                        }
                      />

                    </div>


                    <div>

                      <label className="text-xs text-stone-500 mb-1 block">
                        Color
                      </label>

                      <input
                        className="field w-full"
                        placeholder="e.g. Red"
                        value={
                          variant.color
                        }
                        onChange={(
                          event
                        ) =>
                          updateVariant(
                            index,
                            "color",
                            event.target
                              .value
                          )
                        }
                      />

                    </div>


                    <div>

                      <label className="text-xs text-stone-500 mb-1 block">
                        Stock
                      </label>

                      <input
                        className="field w-full"
                        required
                        type="number"
                        min="0"
                        placeholder="Stock"
                        value={
                          variant.stock
                        }
                        onChange={(
                          event
                        ) =>
                          updateVariant(
                            index,
                            "stock",
                            Number(
                              event.target
                                .value
                            ) || 0
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

              )
            )}

          </div>


          <button
            type="button"
            onClick={
              addVariant
            }
            className="mt-4 w-full sm:w-auto border border-brand text-brand rounded-lg px-4 py-3 text-sm font-semibold hover:bg-brand hover:text-white transition"
          >
            + ADD VARIANT
          </button>

        </div>


        {/* SAVE BUTTON */}

        <div className="md:col-span-2 pt-2">

          <button
            type="submit"
            disabled={busy}
            className="btn-brand w-full py-3 sm:py-4"
          >
            {busy
              ? "SAVING..."
              : editingId
              ? "UPDATE PRODUCT"
              : "SAVE PRODUCT"}
          </button>

        </div>

      </form>


      {/* PRODUCTS HEADING */}

      <div className="flex items-center justify-between mt-8 mb-4">

        <div>

          <h2 className="text-xl sm:text-2xl font-serif">
            ALL PRODUCTS
          </h2>

          <p className="text-sm text-stone-500 mt-1">
            Total Products: {products.length}
          </p>

        </div>

      </div>


      {/* DESKTOP TABLE */}

      <div className="card overflow-x-auto hidden lg:block">

        <table className="admin-table min-w-[750px] w-full">

          <thead>

            <tr>

              <th>Product</th>

              <th>Category</th>

              <th>Price</th>

              <th>Stock</th>

              <th>Actions</th>

            </tr>

          </thead>


          <tbody>

            {products.length === 0 ? (

              <tr>

                <td
                  colSpan="5"
                  className="text-center py-10 text-stone-500"
                >
                  No products found.
                </td>

              </tr>

            ) : (

              products.map(
                (product) => (

                  <tr
                    key={
                      product._id
                    }
                  >

                    <td>

                      <div className="flex items-center gap-3">

                        {product.images?.[0]
                          ?.url && (

                          <img
                            src={
                              product
                                .images[0]
                                .url
                            }
                            alt={
                              product.name
                            }
                            className="w-12 h-14 rounded object-cover border"
                          />

                        )}

                        <b>
                          {
                            product.name
                          }
                        </b>

                      </div>

                    </td>


                    <td>

                      {
                        product.category
                          ?.name ||
                          "-"
                      }

                    </td>


                    <td>

                      PKR{" "}

                      {Number(
                        product.sellingPrice ||
                          0
                      ).toLocaleString()}

                    </td>


                    <td>

                      {
                        getTotalStock(
                          product
                        )
                      }

                    </td>


                    <td>

                      <div className="flex gap-4">

                        <button
                          type="button"
                          onClick={() =>
                            editProduct(
                              product
                            )
                          }
                          className="text-brand font-semibold"
                        >
                          Edit
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            deleteProduct(
                              product._id
                            )
                          }
                          className="text-red-600 font-semibold"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>


      {/* MOBILE / TABLET CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">

        {products.length === 0 ? (

          <div className="card p-6 text-center text-stone-500 sm:col-span-2">
            No products found.
          </div>

        ) : (

          products.map(
            (product) => (

              <div
                key={product._id}
                className="card p-4 w-full min-w-0"
              >

                <div className="flex gap-3">

                  {product.images?.[0]
                    ?.url && (

                    <img
                      src={
                        product.images[0]
                          .url
                      }
                      alt={
                        product.name
                      }
                      className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 rounded-lg object-cover border"
                    />

                  )}


                  <div className="min-w-0 flex-1">

                    <h3 className="font-semibold break-words">

                      {product.name}

                    </h3>


                    <p className="text-xs text-stone-500 mt-1">

                      {
                        product.category
                          ?.name ||
                          "No Category"
                      }

                    </p>


                    <p className="text-brand font-bold mt-2 text-sm sm:text-base">

                      PKR{" "}

                      {Number(
                        product.sellingPrice ||
                          0
                      ).toLocaleString()}

                    </p>

                  </div>

                </div>


                <div className="grid grid-cols-2 gap-3 mt-4 border-t pt-3">

                  <div>

                    <p className="text-xs text-stone-500">
                      Stock
                    </p>

                    <b className="text-sm">

                      {
                        getTotalStock(
                          product
                        )
                      }

                    </b>

                  </div>


                  <div>

                    <p className="text-xs text-stone-500">
                      Status
                    </p>

                    <div className="flex gap-1 flex-wrap mt-1">

                      {product.isFeatured && (

                        <span className="text-[10px] border rounded px-2 py-1">
                          Featured
                        </span>

                      )}

                      {product.isBestSeller && (

                        <span className="text-[10px] border rounded px-2 py-1">
                          Best Seller
                        </span>

                      )}

                      {!product.isFeatured &&
                        !product.isBestSeller && (

                          <span className="text-xs text-stone-400">
                            Normal
                          </span>

                        )}

                    </div>

                  </div>

                </div>


                <div className="grid grid-cols-2 gap-3 mt-4">

                  <button
                    type="button"
                    onClick={() =>
                      editProduct(
                        product
                      )
                    }
                    className="border border-brand text-brand rounded-lg py-2.5 text-sm font-semibold"
                  >
                    EDIT
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      deleteProduct(
                        product._id
                      )
                    }
                    className="border border-red-200 text-red-600 rounded-lg py-2.5 text-sm font-semibold"
                  >
                    DELETE
                  </button>

                </div>

              </div>

            )
          )

        )}

      </div>

    </div>
  );
}