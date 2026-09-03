import { useEffect, useState } from "react";
import api from "../api";

/* =========================================================
   ADMIN COUPONS
========================================================= */

export function AdminCoupons() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [f, setF] = useState({
    code: "",
    type: "percentage",
    value: 10,
    minimumOrder: 0,
  });

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/coupons");
      const data = response.data;

      if (Array.isArray(data)) {
        setRows(data);
      } else if (Array.isArray(data?.coupons)) {
        setRows(data.coupons);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error("Coupons loading error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load coupons."
      );

      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!f.code.trim()) {
      setError("Coupon code is required.");
      return;
    }

    if (
      f.type !== "free_shipping" &&
      Number(f.value) <= 0
    ) {
      setError(
        "Discount value must be greater than 0."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.post("/admin/coupons", {
        code: f.code.trim().toUpperCase(),
        type: f.type,
        value:
          f.type === "free_shipping"
            ? 0
            : Number(f.value) || 0,
        minimumOrder:
          Number(f.minimumOrder) || 0,
      });

      setSuccess(
        "Coupon added successfully."
      );

      setF({
        code: "",
        type: "percentage",
        value: 10,
        minimumOrder: 0,
      });

      await load();
    } catch (err) {
      console.error(
        "Coupon create error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to add coupon."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteCoupon = async (id) => {
    if (!id) {
      setError("Coupon ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/admin/coupons/${id}`
      );

      setSuccess(
        "Coupon deleted successfully."
      );

      await load();
    } catch (err) {
      console.error(
        "Coupon delete error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete coupon."
      );
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif">
            COUPONS
          </h1>

          <p className="text-sm text-stone-500 mt-1">
            Create and manage discount coupons.
          </p>
        </div>

        <button
          type="button"
          className="btn-brand w-full sm:w-auto"
          onClick={load}
        >
          REFRESH
        </button>
      </div>

      {error && (
        <div className="card mt-5 p-4 border border-red-300 text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="card mt-5 p-4 border border-green-300 text-green-600">
          {success}
        </div>
      )}

      <form
        className="card p-4 sm:p-5 mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
        onSubmit={handleSubmit}
      >
        <input
          className="field w-full"
          placeholder="Coupon Code"
          value={f.code}
          onChange={(e) =>
            setF({
              ...f,
              code: e.target.value,
            })
          }
        />

        <select
          className="field w-full"
          value={f.type}
          onChange={(e) =>
            setF({
              ...f,
              type: e.target.value,
              value:
                e.target.value ===
                "free_shipping"
                  ? 0
                  : f.value,
            })
          }
        >
          <option value="percentage">
            Percentage
          </option>

          <option value="fixed">
            Fixed PKR
          </option>

          <option value="free_shipping">
            Free Shipping
          </option>
        </select>

        <input
          className="field w-full"
          type="number"
          min="0"
          placeholder="Discount Value"
          value={
            f.type === "free_shipping"
              ? 0
              : f.value
          }
          disabled={
            f.type === "free_shipping"
          }
          onChange={(e) =>
            setF({
              ...f,
              value:
                Number(e.target.value) || 0,
            })
          }
        />

        <input
          className="field w-full"
          type="number"
          min="0"
          placeholder="Minimum Order"
          value={f.minimumOrder}
          onChange={(e) =>
            setF({
              ...f,
              minimumOrder:
                Number(e.target.value) || 0,
            })
          }
        />

        <button
          type="submit"
          disabled={saving}
          className="btn-brand w-full"
        >
          {saving
            ? "ADDING..."
            : "ADD COUPON"}
        </button>
      </form>

      <div className="card p-3 sm:p-4 mt-5">
        {loading ? (
          <p className="text-stone-500 p-3">
            Loading coupons...
          </p>
        ) : rows.length === 0 ? (
          <p className="text-stone-500 p-3">
            No coupons found.
          </p>
        ) : (
          rows.map((coupon, index) => {
            const id =
              coupon?._id ||
              coupon?.id ||
              `coupon-${index}`;

            return (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b last:border-b-0 p-3 sm:p-4"
                key={id}
              >
                <div className="min-w-0">
                  <b className="break-all">
                    {coupon?.code ||
                      "NO CODE"}
                  </b>

                  <p className="text-sm text-stone-500 mt-1 break-words">
                    {coupon?.type || "N/A"}
                    {" • "}

                    {coupon?.type ===
                    "percentage"
                      ? `${coupon?.value || 0}%`
                      : coupon?.type ===
                        "fixed"
                      ? `PKR ${
                          coupon?.value || 0
                        }`
                      : "Free Shipping"}

                    {" • Minimum Order: PKR "}
                    {coupon?.minimumOrder || 0}
                  </p>
                </div>

                <button
                  type="button"
                  className="text-red-600 font-medium w-full sm:w-auto text-left sm:text-right"
                  onClick={() =>
                    deleteCoupon(
                      coupon?._id ||
                        coupon?.id
                    )
                  }
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

/* =========================================================
   ADMIN RETURNS
========================================================= */

export function AdminReturns() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [updating, setUpdating] =
    useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/returns"
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setRows(data);
      } else if (
        Array.isArray(data?.returns)
      ) {
        setRows(data.returns);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error(
        "Returns loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load returns."
      );

      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (
    id,
    status
  ) => {
    if (!id) {
      setError("Return ID is missing.");
      return;
    }

    try {
      setUpdating(id);
      setError("");

      await api.patch(
        `/admin/returns/${id}`,
        {
          status,
        }
      );

      await load();
    } catch (err) {
      console.error(
        "Return update error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update return status."
      );
    } finally {
      setUpdating("");
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif">
            RETURNS & EXCHANGES
          </h1>

          <p className="text-sm text-stone-500 mt-1">
            Manage customer return and
            exchange requests.
          </p>
        </div>

        <button
          type="button"
          className="btn-brand w-full sm:w-auto"
          onClick={load}
        >
          REFRESH
        </button>
      </div>

      {error && (
        <div className="card mt-5 p-4 border border-red-300 text-red-600">
          {error}
        </div>
      )}

      <div className="card p-3 sm:p-4 mt-5">
        {loading ? (
          <p className="p-3 text-stone-500">
            Loading returns...
          </p>
        ) : rows.length === 0 ? (
          <p className="p-3 text-stone-500">
            No return requests found.
          </p>
        ) : (
          rows.map((item, index) => {
            const id =
              item?._id ||
              item?.id ||
              `return-${index}`;

            return (
              <div
                className="border-b last:border-b-0 p-3 sm:p-4"
                key={id}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <b>
                      {item?.type ||
                        "Return Request"}
                    </b>

                    {item?.orderId && (
                      <p className="text-xs text-stone-500 mt-1 break-all">
                        Order: {item.orderId}
                      </p>
                    )}
                  </div>

                  <span className="text-sm text-stone-500">
                    {item?.status ||
                      "Pending"}
                  </span>
                </div>

                <p className="mt-3 text-stone-600 break-words">
                  {item?.reason ||
                    "No reason provided."}
                </p>

                <select
                  className="field mt-4 w-full sm:max-w-xs"
                  value={
                    item?.status ||
                    "Pending"
                  }
                  disabled={
                    updating ===
                    (item?._id ||
                      item?.id)
                  }
                  onChange={(e) =>
                    updateStatus(
                      item?._id ||
                        item?.id,
                      e.target.value
                    )
                  }
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Approved">
                    Approved
                  </option>

                  <option value="Rejected">
                    Rejected
                  </option>

                  <option value="Completed">
                    Completed
                  </option>
                </select>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

/* =========================================================
   ADMIN BANNERS
========================================================= */

export function AdminBanners() {
  const empty = {
    title: "",
    subtitle: "",
    image: "",
    publicId: "",
    buttonText: "SHOP NOW",
    buttonLink: "/shop",
    isActive: true,
    sortOrder: 0,
  };

  const [rows, setRows] = useState([]);
  const [f, setF] = useState(empty);
  const [editingId, setEditingId] =
    useState(null);
  const [busy, setBusy] =
    useState(false);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/admin/banners");

      const data = response.data;

      if (Array.isArray(data)) {
        setRows(data);
      } else if (
        Array.isArray(data?.banners)
      ) {
        setRows(data.banners);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error(
        "Banner loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load banners."
      );

      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    try {
      setBusy(true);
      setError("");
      setSuccess("");

      const formData =
        new FormData();

      formData.append(
        "images",
        file
      );

      formData.append(
        "folder",
        "banners"
      );

      const response =
        await api.post(
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

      if (Array.isArray(data)) {
        uploadedImage = data[0];
      } else if (
        Array.isArray(data?.images)
      ) {
        uploadedImage =
          data.images[0];
      } else if (data?.url) {
        uploadedImage = data;
      }

      if (
        !uploadedImage ||
        !uploadedImage.url
      ) {
        throw new Error(
          "Image upload response is invalid."
        );
      }

      setF((prev) => ({
        ...prev,
        image: uploadedImage.url,
        publicId:
          uploadedImage.publicId ||
          uploadedImage.public_id ||
          "",
      }));

      setSuccess(
        "Banner image uploaded successfully."
      );
    } catch (err) {
      console.error(
        "Banner upload error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Banner upload failed."
      );
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const save = async (e) => {
    e.preventDefault();

    if (!f.title.trim()) {
      setError(
        "Banner title is required."
      );
      return;
    }

    if (!f.image) {
      setError(
        "Please upload a banner image."
      );
      return;
    }

    try {
      setBusy(true);
      setError("");
      setSuccess("");

      const payload = {
        ...f,
        title: f.title.trim(),
        subtitle: f.subtitle.trim(),
        buttonText:
          f.buttonText.trim() ||
          "SHOP NOW",
        buttonLink:
          f.buttonLink.trim() ||
          "/shop",
        sortOrder:
          Number(f.sortOrder) || 0,
      };

      if (editingId) {
        await api.patch(
          `/admin/banners/${editingId}`,
          payload
        );

        setSuccess(
          "Banner updated successfully."
        );
      } else {
        await api.post(
          "/admin/banners",
          payload
        );

        setSuccess(
          "Banner added successfully."
        );
      }

      setF(empty);
      setEditingId(null);

      await load();
    } catch (err) {
      console.error(
        "Banner save error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to save banner."
      );
    } finally {
      setBusy(false);
    }
  };

  const edit = (banner) => {
    if (!banner) return;

    setEditingId(
      banner._id ||
        banner.id ||
        null
    );

    setF({
      title:
        banner.title || "",
      subtitle:
        banner.subtitle || "",
      image:
        banner.image || "",
      publicId:
        banner.publicId ||
        banner.public_id ||
        "",
      buttonText:
        banner.buttonText ||
        "SHOP NOW",
      buttonLink:
        banner.buttonLink ||
        "/shop",
      isActive:
        banner.isActive !== false,
      sortOrder:
        Number(
          banner.sortOrder
        ) || 0,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteBanner = async (
    id
  ) => {
    if (!id) {
      setError(
        "Banner ID is missing."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this banner?"
      );

    if (!confirmed) return;

    try {
      setBusy(true);
      setError("");
      setSuccess("");

      await api.delete(
        `/admin/banners/${id}`
      );

      setSuccess(
        "Banner deleted successfully."
      );

      if (editingId === id) {
        setEditingId(null);
        setF(empty);
      }

      await load();
    } catch (err) {
      console.error(
        "Banner delete error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete banner."
      );
    } finally {
      setBusy(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setF(empty);
    setError("");
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif">
            HOMEPAGE BANNERS
          </h1>

          <p className="text-sm text-stone-500 mt-1">
            Upload and manage homepage
            banners.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            type="button"
            className="btn border w-full sm:w-auto"
            onClick={load}
          >
            REFRESH
          </button>

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
      </div>

      {error && (
        <div className="card mt-5 p-4 border border-red-300 text-red-600 break-words">
          {error}
        </div>
      )}

      {success && (
        <div className="card mt-5 p-4 border border-green-300 text-green-600 break-words">
          {success}
        </div>
      )}

      {/* RESPONSIVE BANNER FORM */}
      <form
        onSubmit={save}
        className="card mt-6 p-4 sm:p-5 md:p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* TITLE */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">
              Banner Title
            </label>

            <input
              required
              value={f.title}
              onChange={(e) =>
                setF({
                  ...f,
                  title:
                    e.target.value,
                })
              }
              className="field w-full"
              placeholder="Enter banner title"
            />
          </div>

          {/* SUBTITLE */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">
              Banner Subtitle
            </label>

            <input
              value={f.subtitle}
              onChange={(e) =>
                setF({
                  ...f,
                  subtitle:
                    e.target.value,
                })
              }
              className="field w-full"
              placeholder="Enter banner subtitle"
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div className="lg:col-span-2 w-full">
            <label className="block font-medium mb-2">
              Banner Image
            </label>

            <div className="border border-dashed border-stone-300 rounded-xl p-4 sm:p-6">
              <input
                type="file"
                accept="image/*"
                onChange={upload}
                disabled={busy}
                className="block w-full text-sm"
              />

              <p className="text-xs text-stone-500 mt-3">
                Upload a high quality
                banner image for your
                homepage.
              </p>

              {f.image && (
                <div className="mt-5">
                  <img
                    src={f.image}
                    alt="Banner preview"
                    className="w-full max-w-full lg:max-w-4xl h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-xl border shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* BUTTON TEXT */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">
              Button Text
            </label>

            <input
              value={f.buttonText}
              onChange={(e) =>
                setF({
                  ...f,
                  buttonText:
                    e.target.value,
                })
              }
              className="field w-full"
              placeholder="SHOP NOW"
            />
          </div>

          {/* BUTTON LINK */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">
              Button Link
            </label>

            <input
              value={f.buttonLink}
              onChange={(e) =>
                setF({
                  ...f,
                  buttonLink:
                    e.target.value,
                })
              }
              className="field w-full"
              placeholder="/shop"
            />
          </div>

          {/* SORT ORDER */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">
              Sort Order
            </label>

            <input
              type="number"
              value={f.sortOrder}
              onChange={(e) =>
                setF({
                  ...f,
                  sortOrder:
                    Number(
                      e.target.value
                    ) || 0,
                })
              }
              className="field w-full"
              placeholder="0"
            />
          </div>

          {/* ACTIVE STATUS */}
          <div className="w-full flex items-end">
            <label className="flex items-center gap-3 border rounded-lg px-4 py-3 w-full cursor-pointer">
              <input
                type="checkbox"
                checked={f.isActive}
                onChange={(e) =>
                  setF({
                    ...f,
                    isActive:
                      e.target.checked,
                  })
                }
                className="w-4 h-4"
              />

              <div>
                <span className="font-medium block">
                  Active Banner
                </span>

                <span className="text-xs text-stone-500">
                  Display this banner on
                  the homepage.
                </span>
              </div>
            </label>
          </div>

          {/* SUBMIT */}
          <div className="lg:col-span-2 pt-2">
            <button
              type="submit"
              disabled={busy}
              className="btn-brand w-full sm:w-auto min-w-full sm:min-w-[220px]"
            >
              {busy
                ? "SAVING..."
                : editingId
                ? "UPDATE BANNER"
                : "ADD BANNER"}
            </button>
          </div>
        </div>
      </form>

      {/* BANNER LIST */}
      <div className="mt-6">
        {loading ? (
          <div className="card p-5">
            Loading banners...
          </div>
        ) : rows.length === 0 ? (
          <div className="card p-5 text-stone-500">
            No banners found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {rows.map(
              (banner, index) => {
                const id =
                  banner?._id ||
                  banner?.id ||
                  `banner-${index}`;

                return (
                  <div
                    key={id}
                    className="card overflow-hidden min-w-0"
                  >
                    {banner?.image ? (
                      <img
                        className="w-full h-48 sm:h-56 md:h-64 object-cover"
                        src={
                          banner.image
                        }
                        alt={
                          banner.title ||
                          "Banner"
                        }
                      />
                    ) : (
                      <div className="w-full h-48 sm:h-56 flex items-center justify-center bg-stone-100 text-stone-400">
                        No Image
                      </div>
                    )}

                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="min-w-0">
                          <b className="text-base sm:text-lg break-words">
                            {banner.title ||
                              "Untitled Banner"}
                          </b>

                          {banner.subtitle && (
                            <p className="text-stone-500 mt-1 break-words">
                              {
                                banner.subtitle
                              }
                            </p>
                          )}
                        </div>

                        <span
                          className={
                            banner.isActive !==
                            false
                              ? "text-green-600 text-sm shrink-0"
                              : "text-red-600 text-sm shrink-0"
                          }
                        >
                          {banner.isActive !==
                          false
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <div className="text-sm text-stone-500 mt-4 break-words">
                        <p>
                          Button:{" "}
                          {banner.buttonText ||
                            "SHOP NOW"}
                        </p>

                        <p className="mt-1">
                          Link:{" "}
                          {banner.buttonLink ||
                            "/shop"}
                        </p>

                        <p className="mt-1">
                          Sort Order:{" "}
                          {banner.sortOrder ||
                            0}
                        </p>
                      </div>

                      <div className="flex flex-col xs:flex-row sm:flex-row gap-3 sm:gap-5 mt-5">
                        <button
                          type="button"
                          onClick={() =>
                            edit(banner)
                          }
                          className="text-brand font-medium text-left"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            deleteBanner(
                              banner._id ||
                                banner.id
                            )
                          }
                          className="text-red-600 font-medium text-left"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* =========================================================
   ADMIN REVIEWS
========================================================= */

export function AdminReviews() {
  const [rows, setRows] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [busyId, setBusyId] =
    useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/admin/reviews"
        );

      setRows(
        Array.isArray(
          response.data
        )
          ? response.data
          : []
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load reviews."
      );

      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (
    id,
    status
  ) => {
    try {
      setBusyId(id);
      setError("");

      await api.patch(
        `/admin/reviews/${id}`,
        { status }
      );

      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to update review."
      );
    } finally {
      setBusyId("");
    }
  };

  const remove = async (id) => {
    if (
      !window.confirm(
        "Delete this review permanently?"
      )
    )
      return;

    try {
      setBusyId(id);
      setError("");

      await api.delete(
        `/admin/reviews/${id}`
      );

      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete review."
      );
    } finally {
      setBusyId("");
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif">
            PRODUCT REVIEWS
          </h1>

          <p className="text-sm text-stone-500 mt-1">
            Approve, reject, or remove
            customer reviews.
          </p>
        </div>

        <button
          type="button"
          className="btn-brand w-full sm:w-auto"
          onClick={load}
        >
          REFRESH
        </button>
      </div>

      {error && (
        <div className="card mt-5 p-4 border border-red-300 text-red-600">
          {error}
        </div>
      )}

      <div className="card mt-6 p-3 sm:p-4">
        {loading ? (
          <p className="p-3 text-stone-500">
            Loading reviews...
          </p>
        ) : rows.length === 0 ? (
          <p className="p-3 text-stone-500">
            No reviews found.
          </p>
        ) : (
          rows.map((review) => (
            <div
              key={review._id}
              className="border-b last:border-b-0 p-3 sm:p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="break-words">
                  <b>
                    {review.product?.name ||
                      "Product"}
                  </b>

                  <span className="text-stone-500 text-sm">
                    {" — "}
                    {review.customer?.name ||
                      "Customer"}
                  </span>
                </div>

                <span
                  className={
                    review.status ===
                    "Approved"
                      ? "text-green-600 text-sm"
                      : review.status ===
                        "Hidden"
                      ? "text-red-600 text-sm"
                      : "text-stone-500 text-sm"
                  }
                >
                  {review.status}
                </span>
              </div>

              <p className="mt-2 text-sm">
                Rating:{" "}
                {"★".repeat(
                  review.rating
                )}
                {"☆".repeat(
                  5 - review.rating
                )}
              </p>

              {review.comment && (
                <p className="mt-1 text-stone-600 break-words">
                  {review.comment}
                </p>
              )}

              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <button
                  disabled={
                    busyId ===
                    review._id
                  }
                  className="text-green-600 font-medium"
                  onClick={() =>
                    updateStatus(
                      review._id,
                      "Approved"
                    )
                  }
                >
                  Approve
                </button>

                <button
                  disabled={
                    busyId ===
                    review._id
                  }
                  className="text-amber-600 font-medium"
                  onClick={() =>
                    updateStatus(
                      review._id,
                      "Hidden"
                    )
                  }
                >
                  Reject
                </button>

                <button
                  disabled={
                    busyId ===
                    review._id
                  }
                  className="text-red-600 font-medium"
                  onClick={() =>
                    remove(
                      review._id
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* =========================================================
   ADMIN NEWSLETTER SUBSCRIBERS
========================================================= */

export function AdminNewsletter() {
  const [rows, setRows] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [busyId, setBusyId] =
    useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/admin/newsletter"
        );

      setRows(
        Array.isArray(
          response.data
        )
          ? response.data
          : []
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load subscribers."
      );

      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (id) => {
    try {
      setBusyId(id);

      await api.patch(
        `/admin/newsletter/${id}/toggle`
      );

      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to update subscriber."
      );
    } finally {
      setBusyId("");
    }
  };

  const remove = async (id) => {
    if (
      !window.confirm(
        "Remove this subscriber?"
      )
    )
      return;

    try {
      setBusyId(id);

      await api.delete(
        `/admin/newsletter/${id}`
      );

      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to remove subscriber."
      );
    } finally {
      setBusyId("");
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif">
            NEWSLETTER SUBSCRIBERS
          </h1>

          <p className="text-sm text-stone-500 mt-1">
            Manage customers subscribed
            to email updates.
          </p>
        </div>

        <button
          type="button"
          className="btn-brand w-full sm:w-auto"
          onClick={load}
        >
          REFRESH
        </button>
      </div>

      {error && (
        <div className="card mt-5 p-4 border border-red-300 text-red-600">
          {error}
        </div>
      )}

      <div className="card mt-6 p-3 sm:p-4">
        {loading ? (
          <p className="p-3 text-stone-500">
            Loading subscribers...
          </p>
        ) : rows.length === 0 ? (
          <p className="p-3 text-stone-500">
            No subscribers yet.
          </p>
        ) : (
          rows.map((s) => (
            <div
              key={s._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b last:border-b-0 p-3 sm:p-4"
            >
              <div className="min-w-0">
                <b className="break-all">
                  {s.email}
                </b>

                <p className="text-sm text-stone-500 mt-1">
                  Subscribed{" "}
                  {s.createdAt
                    ? new Date(
                        s.createdAt
                      ).toLocaleDateString()
                    : "-"}

                  {" • "}

                  <span
                    className={
                      s.status ===
                      "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {s.status}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  disabled={
                    busyId ===
                    s._id
                  }
                  className="text-brand font-medium text-sm"
                  onClick={() =>
                    toggle(s._id)
                  }
                >
                  {s.status ===
                  "Active"
                    ? "Deactivate"
                    : "Activate"}
                </button>

                <button
                  disabled={
                    busyId ===
                    s._id
                  }
                  className="text-red-600 font-medium text-sm"
                  onClick={() =>
                    remove(s._id)
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* =========================================================
   ADMIN ANALYTICS
========================================================= */

export function AdminAnalytics() {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-serif">
        BUSINESS ANALYTICS
      </h1>

      <div className="card mt-6 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold">
          Business Performance
        </h2>

        <p className="text-stone-500 mt-3">
          Sales, orders, revenue and
          inventory analytics are
          available from the admin
          dashboard.
        </p>

        <p className="text-sm text-stone-400 mt-2">
          Additional analytics charts
          can be connected to dedicated
          backend analytics APIs.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN SETTINGS
========================================================= */

export function AdminSettings() {
  const [f, setF] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [text, setText] =
    useState("{}");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response =
        await api.get(
          "/admin/settings"
        );

      const data =
        response.data || {};

      setF(data);

      setText(
        JSON.stringify(
          data,
          null,
          2
        )
      );
    } catch (err) {
      console.error(
        "Settings loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load store settings."
      );

      setF({});
      setText("{}");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleTextChange = (
    value
  ) => {
    setText(value);

    try {
      const parsed =
        JSON.parse(value);

      if (
        parsed &&
        typeof parsed ===
          "object"
      ) {
        setF(parsed);
        setError("");
      }
    } catch {
      // Keep text while typing
    }
  };

  const saveSettings =
    async () => {
      let parsed;

      try {
        parsed =
          JSON.parse(text);
      } catch {
        setError(
          "Invalid JSON. Please fix the JSON before saving."
        );
        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const response =
          await api.put(
            "/admin/settings",
            parsed
          );

        const updated =
          response.data ||
          parsed;

        setF(updated);

        setText(
          JSON.stringify(
            updated,
            null,
            2
          )
        );

        setSuccess(
          "Settings saved successfully."
        );
      } catch (err) {
        console.error(
          "Settings save error:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Failed to save settings."
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif">
          STORE SETTINGS
        </h1>

        <div className="card mt-6 p-4 sm:p-6">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif">
            STORE SETTINGS
          </h1>

          <p className="text-sm text-stone-500 mt-1">
            Configure your store
            settings.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          className="btn-brand w-full sm:w-auto"
        >
          REFRESH
        </button>
      </div>

      {error && (
        <div className="card mt-5 p-4 border border-red-300 text-red-600 break-words">
          {error}
        </div>
      )}

      {success && (
        <div className="card mt-5 p-4 border border-green-300 text-green-600">
          {success}
        </div>
      )}

      <textarea
        className="field mt-6 min-h-[320px] sm:min-h-[500px] font-mono w-full text-xs sm:text-sm"
        value={text}
        onChange={(e) =>
          handleTextChange(
            e.target.value
          )
        }
      />

      <button
        type="button"
        disabled={saving}
        className="btn-brand mt-4 w-full sm:w-auto"
        onClick={saveSettings}
      >
        {saving
          ? "SAVING..."
          : "SAVE SETTINGS"}
      </button>
    </div>
  );
}