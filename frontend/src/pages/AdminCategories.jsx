import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  FolderTree,
  Search,
  Upload,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import api from "../api";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  publicId: "",
  parent: "",
  isActive: true,
  sortOrder: 0,
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState(initialForm);

  /* =========================
     LOAD CATEGORIES
  ========================== */

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.categories || [];

      setCategories(data);
    } catch (err) {
      console.error("Load categories error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load categories."
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* =========================
     GENERATE SLUG
  ========================== */

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  /* =========================
     FORM CHANGE
  ========================== */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "name" && !editingCategory) {
      setForm((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value),
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "sortOrder"
          ? Number(value)
          : value,
    }));
  };

  /* =========================
     IMAGE UPLOAD
     SAME AS ADMIN BANNERS
  ========================== */

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please upload a valid image file (JPG, PNG or WEBP)."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");

      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      setMessage("");

      const formData = new FormData();

      /*
        SAME FIELD NAME AS BANNERS
      */
      formData.append("images", file);

      /*
        Cloudinary Folder
      */
      formData.append("folder", "categories");

      /*
        SAME WORKING ENDPOINT AS BANNERS
      */
      const response = await api.post(
        "/upload/images",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      const data = response.data;

      let uploadedImage = null;

      /*
        Possible backend response formats
      */

      if (Array.isArray(data)) {
        uploadedImage = data[0];
      } else if (Array.isArray(data?.images)) {
        uploadedImage = data.images[0];
      } else if (data?.url) {
        uploadedImage = data;
      } else if (data?.image) {
        uploadedImage = {
          url: data.image,
          publicId:
            data.publicId ||
            data.public_id ||
            "",
        };
      }

      if (
        !uploadedImage ||
        !uploadedImage.url
      ) {
        console.error(
          "Invalid upload response:",
          data
        );

        throw new Error(
          "Image URL was not returned from server."
        );
      }

      setForm((prev) => ({
        ...prev,
        image: uploadedImage.url,
        publicId:
          uploadedImage.publicId ||
          uploadedImage.public_id ||
          "",
      }));

      setMessage(
        "Category image uploaded successfully."
      );
    } catch (err) {
      console.error(
        "Category image upload error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to upload category image."
      );
    } finally {
      setUploadingImage(false);

      /*
        Reset input so same image
        can be uploaded again
      */
      event.target.value = "";
    }
  };

  /* =========================
     REMOVE IMAGE
  ========================== */

  const removeImage = () => {
    setForm((prev) => ({
      ...prev,
      image: "",
      publicId: "",
    }));
  };

  /* =========================
     OPEN CREATE
  ========================== */

  const openCreate = () => {
    setEditingCategory(null);
    setForm(initialForm);

    setError("");
    setMessage("");

    setShowForm(true);
  };

  /* =========================
     OPEN EDIT
  ========================== */

  const openEdit = (category) => {
    setEditingCategory(category);

    setForm({
      name: category?.name || "",
      slug: category?.slug || "",
      description:
        category?.description || "",

      image:
        category?.image || "",

      publicId:
        category?.publicId ||
        category?.public_id ||
        "",

      parent:
        typeof category?.parent ===
        "object"
          ? category.parent?._id || ""
          : category?.parent || "",

      isActive:
        category?.isActive !== undefined
          ? category.isActive
          : true,

      sortOrder:
        Number(category?.sortOrder) ||
        0,
    });

    setError("");
    setMessage("");

    setShowForm(true);
  };

  /* =========================
     CLOSE FORM
  ========================== */

  const closeForm = () => {
    if (saving || uploadingImage) return;

    setShowForm(false);
    setEditingCategory(null);
    setForm(initialForm);
  };

  /* =========================
     SUBMIT CATEGORY
  ========================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        "Category name is required."
      );
      return;
    }

    if (!form.slug.trim()) {
      setError(
        "Category slug is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        name: form.name.trim(),

        slug: form.slug.trim(),

        description:
          form.description.trim(),

        image: form.image || "",

        publicId:
          form.publicId || "",

        parent:
          form.parent || null,

        isActive:
          Boolean(form.isActive),

        sortOrder:
          Number(form.sortOrder) || 0,
      };

      if (editingCategory) {
        await api.patch(
          `/categories/${editingCategory._id}`,
          payload
        );

        setMessage(
          "Category updated successfully."
        );
      } else {
        await api.post(
          "/categories",
          payload
        );

        setMessage(
          "Category created successfully."
        );
      }

      await loadCategories();

      setShowForm(false);
      setEditingCategory(null);
      setForm(initialForm);
    } catch (err) {
      console.error(
        "Category save error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     DELETE CATEGORY
  ========================== */

  const handleDelete = async (
    category
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${category.name}"?`
      );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(
        `/categories/${category._id}`
      );

      setCategories((prev) =>
        prev.filter(
          (item) =>
            item._id !== category._id
        )
      );

      setMessage(
        "Category deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete category error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete category."
      );
    }
  };

  /* =========================
     FILTER
  ========================== */

  const filteredCategories =
    categories.filter((category) => {
      const query =
        search.toLowerCase();

      return (
        category?.name
          ?.toLowerCase()
          .includes(query) ||
        category?.slug
          ?.toLowerCase()
          .includes(query)
      );
    });

  const parentCategories =
    categories.filter(
      (category) =>
        !category.parent
    );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-0 pb-10">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">

        <div>
          <p className="text-sm text-stone-500">
            Manage your store categories
          </p>

          <h1 className="text-2xl sm:text-3xl font-serif mt-1 flex items-center gap-2">
            <FolderTree className="text-brand shrink-0" />
            Categories
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="btn-brand flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={18} />
          Add Category
        </button>

      </div>

      {/* SUCCESS */}

      {message && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-start justify-between gap-3">

          <span>{message}</span>

          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
          >
            <X size={17} />
          </button>

        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start justify-between gap-3">

          <div className="flex gap-2">
            <AlertCircle
              size={18}
              className="shrink-0"
            />

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={17} />
          </button>

        </div>
      )}

      {/* SEARCH */}

      <div className="card p-3 sm:p-4 mb-5">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />

          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            className="field pl-10 w-full"
          />

        </div>

      </div>

      {/* CATEGORY LIST */}

      <div className="card overflow-hidden">

        {loading ? (

          <div className="py-16 flex justify-center">
            <Loader2
              className="animate-spin text-brand"
              size={30}
            />
          </div>

        ) : filteredCategories.length === 0 ? (

          <div className="py-16 px-4 text-center">

            <FolderTree
              size={42}
              className="mx-auto text-stone-300"
            />

            <p className="mt-4 text-stone-500">
              No categories found.
            </p>

            <button
              type="button"
              onClick={openCreate}
              className="btn-brand mt-5"
            >
              Create First Category
            </button>

          </div>

        ) : (

          <>
            {/* DESKTOP TABLE */}

            <div className="hidden lg:block overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-stone-50 border-b">

                  <tr>
                    <th className="text-left p-4">
                      Category
                    </th>

                    <th className="text-left p-4">
                      Slug
                    </th>

                    <th className="text-left p-4">
                      Parent
                    </th>

                    <th className="text-center p-4">
                      Status
                    </th>

                    <th className="text-center p-4">
                      Order
                    </th>

                    <th className="text-right p-4">
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredCategories.map(
                    (category) => (

                      <tr
                        key={category._id}
                        className="border-b last:border-0"
                      >

                        <td className="p-4">

                          <div className="flex items-center gap-3">

                            {category.image ? (

                              <img
                                src={
                                  category.image
                                }
                                alt={
                                  category.name
                                }
                                className="w-12 h-12 rounded-lg object-cover bg-stone-100"
                              />

                            ) : (

                              <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center">

                                <FolderTree
                                  size={22}
                                  className="text-brand"
                                />

                              </div>

                            )}

                            <div className="min-w-0">

                              <p className="font-semibold">
                                {category.name}
                              </p>

                              {category.description && (

                                <p className="text-xs text-stone-500 mt-1 max-w-xs truncate">
                                  {
                                    category.description
                                  }
                                </p>

                              )}

                            </div>

                          </div>

                        </td>

                        <td className="p-4 text-stone-500">
                          {category.slug}
                        </td>

                        <td className="p-4">

                          {typeof category.parent ===
                          "object"
                            ? category.parent
                                ?.name || "-"
                            : "-"}

                        </td>

                        <td className="p-4 text-center">

                          <span
                            className={
                              category.isActive
                                ? "inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                                : "inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
                            }
                          >
                            {category.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        <td className="p-4 text-center">
                          {category.sortOrder || 0}
                        </td>

                        <td className="p-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  category
                                )
                              }
                              className="p-2 rounded-lg hover:bg-stone-100"
                            >
                              <Pencil
                                size={17}
                                className="text-brand"
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  category
                                )
                              }
                              className="p-2 rounded-lg hover:bg-red-50"
                            >
                              <Trash2
                                size={17}
                                className="text-red-600"
                              />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* MOBILE CARDS */}

            <div className="lg:hidden divide-y">

              {filteredCategories.map(
                (category) => (

                  <div
                    key={category._id}
                    className="p-4 sm:p-5"
                  >

                    <div className="flex gap-3">

                      {category.image ? (

                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-stone-100 shrink-0"
                        />

                      ) : (

                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">

                          <FolderTree
                            size={28}
                            className="text-brand"
                          />

                        </div>

                      )}

                      <div className="min-w-0 flex-1">

                        <div className="flex justify-between gap-3">

                          <div className="min-w-0">

                            <h3 className="font-semibold truncate">
                              {
                                category.name
                              }
                            </h3>

                            <p className="text-xs text-stone-500 truncate mt-1">
                              {
                                category.slug
                              }
                            </p>

                          </div>

                          <span
                            className={
                              category.isActive
                                ? "shrink-0 px-2 py-1 h-fit rounded-full text-xs bg-green-100 text-green-700"
                                : "shrink-0 px-2 py-1 h-fit rounded-full text-xs bg-red-100 text-red-700"
                            }
                          >
                            {category.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </div>

                        {category.description && (

                          <p className="text-xs sm:text-sm text-stone-500 mt-2 line-clamp-2">
                            {
                              category.description
                            }
                          </p>

                        )}

                        <div className="flex items-center justify-between mt-4">

                          <div className="text-xs text-stone-500">
                            Sort:{" "}
                            {
                              category.sortOrder ||
                              0
                            }
                          </div>

                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  category
                                )
                              }
                              className="p-2.5 rounded-lg bg-stone-100"
                            >
                              <Pencil
                                size={17}
                                className="text-brand"
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  category
                                )
                              }
                              className="p-2.5 rounded-lg bg-red-50"
                            >
                              <Trash2
                                size={17}
                                className="text-red-600"
                              />
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>
          </>

        )}

      </div>

      {/* CATEGORY MODAL */}

      {showForm && (

        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-0 sm:p-4 flex items-end sm:items-center justify-center">

          <div className="bg-white w-full max-w-3xl sm:rounded-2xl shadow-2xl h-[95dvh] sm:h-auto sm:max-h-[92vh] flex flex-col">

            {/* HEADER */}

            <div className="shrink-0 border-b px-4 sm:px-6 py-4 flex items-center justify-between">

              <div>

                <h2 className="text-xl sm:text-2xl font-serif">

                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}

                </h2>

                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Manage your store category information
                </p>

              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={
                  saving ||
                  uploadingImage
                }
                className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-50"
              >
                <X size={21} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-4 sm:p-6"
            >

              <div className="space-y-5">

                {/* NAME + SLUG */}

                <div className="grid md:grid-cols-2 gap-5">

                  <div>

                    <label className="text-sm font-medium">
                      Category Name *
                    </label>

                    <input
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="field mt-2 w-full"
                      placeholder="e.g. Boys Collection"
                    />

                  </div>

                  <div>

                    <label className="text-sm font-medium">
                      Slug *
                    </label>

                    <input
                      name="slug"
                      required
                      value={form.slug}
                      onChange={handleChange}
                      className="field mt-2 w-full"
                      placeholder="boys-collection"
                    />

                  </div>

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    rows={4}
                    className="field mt-2 resize-none w-full"
                    placeholder="Write category description..."
                  />

                </div>

                {/* IMAGE */}

                <div>

                  <label className="text-sm font-medium">
                    Category Image
                  </label>

                  <div className="mt-2 border-2 border-dashed border-stone-200 rounded-2xl p-4 sm:p-5">

                    {form.image ? (

                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">

                        <img
                          src={form.image}
                          alt="Category preview"
                          className="w-full sm:w-36 h-48 sm:h-28 rounded-xl object-cover border bg-stone-100"
                        />

                        <div className="flex-1">

                          <p className="font-medium text-sm">
                            Image uploaded successfully
                          </p>

                          <p className="text-xs text-stone-500 mt-1 break-all">
                            {
                              form.image
                            }
                          </p>

                          <div className="flex flex-wrap gap-2 mt-4">

                            <label className="cursor-pointer border border-brand text-brand px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand/5">

                              <span className="flex items-center gap-2">

                                <Upload
                                  size={16}
                                />

                                Replace Image

                              </span>

                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                className="hidden"
                                onChange={
                                  uploadImage
                                }
                                disabled={
                                  uploadingImage
                                }
                              />

                            </label>

                            <button
                              type="button"
                              onClick={
                                removeImage
                              }
                              className="border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm"
                            >
                              Remove
                            </button>

                          </div>

                        </div>

                      </div>

                    ) : (

                      <div className="text-center py-5">

                        <div className="w-14 h-14 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">

                          {uploadingImage ? (

                            <Loader2
                              size={25}
                              className="animate-spin"
                            />

                          ) : (

                            <ImageIcon
                              size={25}
                            />

                          )}

                        </div>

                        <h3 className="font-medium mt-3">
                          Upload Category Image
                        </h3>

                        <p className="text-xs text-stone-500 mt-1">
                          JPG, PNG or WEBP • Maximum 5MB
                        </p>

                        <label
                          className={`inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl cursor-pointer text-sm font-medium ${
                            uploadingImage
                              ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                              : "btn-brand"
                          }`}
                        >

                          {uploadingImage ? (

                            <>
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />

                              Uploading...
                            </>

                          ) : (

                            <>
                              <Upload
                                size={17}
                              />

                              Choose Image
                            </>

                          )}

                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            className="hidden"
                            onChange={
                              uploadImage
                            }
                            disabled={
                              uploadingImage
                            }
                          />

                        </label>

                      </div>

                    )}

                  </div>

                </div>

                {/* IMAGE URL */}

                <div>

                  <input
                    name="image"
                    value={form.image}
                    onChange={
                      handleChange
                    }
                    className="field w-full"
                    placeholder="Or paste image URL here..."
                  />

                </div>

                {/* PARENT */}

                <div>

                  <label className="text-sm font-medium">
                    Parent Category
                  </label>

                  <select
                    name="parent"
                    value={form.parent}
                    onChange={
                      handleChange
                    }
                    className="field mt-2 w-full"
                  >

                    <option value="">
                      None (Main Category)
                    </option>

                    {parentCategories
                      .filter(
                        (category) =>
                          category._id !==
                          editingCategory?._id
                      )
                      .map(
                        (category) => (

                          <option
                            key={
                              category._id
                            }
                            value={
                              category._id
                            }
                          >
                            {
                              category.name
                            }
                          </option>

                        )
                      )}

                  </select>

                </div>

                {/* SORT + STATUS */}

                <div className="grid sm:grid-cols-2 gap-5">

                  <div>

                    <label className="text-sm font-medium">
                      Sort Order
                    </label>

                    <input
                      type="number"
                      name="sortOrder"
                      value={
                        form.sortOrder
                      }
                      onChange={
                        handleChange
                      }
                      className="field mt-2 w-full"
                      min="0"
                    />

                  </div>

                  <div>

                    <label className="text-sm font-medium block mb-2">
                      Status
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer border rounded-xl px-4 py-3.5 w-full">

                      <input
                        type="checkbox"
                        name="isActive"
                        checked={
                          form.isActive
                        }
                        onChange={
                          handleChange
                        }
                        className="w-4 h-4"
                      />

                      <div>

                        <p className="text-sm font-medium">
                          Active Category
                        </p>

                        <p className="text-xs text-stone-500">
                          Visible in your store
                        </p>

                      </div>

                    </label>

                  </div>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-7 pt-5 border-t">

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={
                    saving ||
                    uploadingImage
                  }
                  className="border border-stone-300 px-5 py-3 rounded-xl w-full sm:w-auto disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploadingImage
                  }
                  className="btn-brand flex justify-center items-center gap-2 px-5 py-3 w-full sm:w-auto disabled:opacity-70"
                >

                  {saving && (

                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                  )}

                  {saving
                    ? "PLEASE WAIT..."
                    : editingCategory
                    ? "UPDATE CATEGORY"
                    : "CREATE CATEGORY"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}